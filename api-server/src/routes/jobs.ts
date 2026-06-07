import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  CreateJobBody,
  GetJobParams,
  ConfirmJobPaymentParams,
  ConfirmJobPaymentBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getUncachableStripeClient } from "../stripeClient.js";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth.js";
import { logger } from "../lib/logger.js";
import { generateCVPdfDataUrl, type CVData } from "../cv/pdfGenerator.js";
import { enrichCVData } from "../cv/enricher.js";
import { translateCVToEnglish } from "../cv/translator.js";

const router = Router();

function serializeJob(job: typeof jobsTable.$inferSelect, opts?: { includeCvData?: boolean }) {
  return {
    id: job.id,
    userId: job.userId,
    status: job.status,
    style: job.style,
    imageDataUrl: job.imageDataUrl,
    resultDataUrl: job.resultDataUrl,
    // Avoid exposing raw CV PII via job reads — only the rendered PDF is needed by the client.
    cvData: opts?.includeCvData ? (job.cvData as CVData | null) : null,
    cvTemplate: job.cvTemplate,
    cvPdfDataUrl: job.cvPdfDataUrl,
    stripePaymentIntentId: job.stripePaymentIntentId,
    createdAt: job.createdAt.toISOString(),
  };
}

router.post("/api/jobs", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
  }

  const { imageDataUrl, style, cvData, cvTemplate } = parsed.data;

  const id = randomUUID();
  const [job] = await db
    .insert(jobsTable)
    .values({
      id,
      userId: req.userId,
      status: "pending_payment",
      style,
      imageDataUrl,
      cvData,
      cvTemplate,
    })
    .returning();

  // Echo cvData back on creation so the client can verify what was stored if needed.
  return res.status(201).json(serializeJob(job, { includeCvData: true }));
});

// List the authenticated user's jobs for the dashboard.
// Registered before "/api/jobs/:id" so "mine" isn't captured as an id.
router.get("/api/jobs/mine", requireAuth, async (req: AuthedRequest, res) => {
  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.userId, req.userId!))
    .orderBy(desc(jobsTable.createdAt));

  return res.json(jobs.map((job) => serializeJob(job)));
});

router.get("/api/jobs/:id", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = GetJobParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, parsed.data.id));

  if (!job || job.userId !== req.userId) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.json(serializeJob(job));
});

// Stream the CV PDF as a real HTTP download.
// data: URLs are unreliable on mobile (especially Safari), so we serve bytes
// with proper Content-Disposition: attachment headers instead.
router.get("/api/jobs/:id/cv.pdf", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = GetJobParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, parsed.data.id));
  if (!job || job.userId !== req.userId || !job.cvPdfDataUrl) {
    return res.status(404).json({ error: "CV not available" });
  }

  // Language toggle: ?lang=en regenerates the PDF in English on the fly
  // (translates user content + uses English labels). Default `fr` serves
  // the cached French PDF generated during processing.
  const requestedLang = req.query.lang === "en" ? "en" : "fr";
  let buffer: Buffer;
  let servedLang: "fr" | "en" = "fr";

  if (requestedLang === "en" && job.cvData) {
    try {
      const translated = await translateCVToEnglish(job.cvData as CVData);
      const enDataUrl = await generateCVPdfDataUrl(
        translated,
        job.resultDataUrl ?? null,
        "classique",
        "en",
      );
      const enBase64 = enDataUrl.replace(/^data:application\/pdf;base64,/, "");
      buffer = Buffer.from(enBase64, "base64");
      servedLang = "en";
    } catch (err) {
      logger.error({ err, jobId: job.id }, "English CV generation failed, falling back to French");
      const base64 = job.cvPdfDataUrl.replace(/^data:application\/pdf;base64,/, "");
      buffer = Buffer.from(base64, "base64");
    }
  } else {
    const base64 = job.cvPdfDataUrl.replace(/^data:application\/pdf;base64,/, "");
    buffer = Buffer.from(base64, "base64");
  }

  // Filename and signaling reflect the language actually served, not just
  // what was requested, so a fallback never delivers French bytes named "-en".
  const suffix = servedLang === "en" ? "-en" : "";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="cv-${job.id}${suffix}.pdf"`);
  res.setHeader("Content-Length", buffer.length.toString());
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("X-CV-Language", servedLang);
  return res.end(buffer);
});

// Same for the generated photo — avoid huge data: URLs on mobile.
router.get("/api/jobs/:id/photo.png", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = GetJobParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, parsed.data.id));
  if (!job || job.userId !== req.userId || !job.resultDataUrl) {
    return res.status(404).json({ error: "Photo not available" });
  }

  const base64 = job.resultDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename="headshotcv-${job.id}.png"`);
  res.setHeader("Content-Length", buffer.length.toString());
  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.end(buffer);
});

router.post("/api/jobs/:id/confirm-payment", requireAuth, async (req: AuthedRequest, res) => {
  const paramsParsed = ConfirmJobPaymentParams.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const bodyParsed = ConfirmJobPaymentBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Invalid body" });
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, paramsParsed.data.id));

  if (!job || job.userId !== req.userId) {
    return res.status(404).json({ error: "Job not found" });
  }

  // Verify the payment server-side before doing any (paid) AI work. The client
  // sends the Stripe Checkout Session id; we look it up and require that it is
  // actually paid and tied to THIS job. This prevents triggering free
  // generation by replaying the endpoint with an arbitrary id.
  const stripe = await getUncachableStripeClient();
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    session = await stripe.checkout.sessions.retrieve(bodyParsed.data.stripePaymentIntentId);
  } catch (err) {
    logger.warn({ err, jobId: job.id }, "Stripe session lookup failed during confirm-payment");
    return res.status(402).json({ error: "Payment not verified" });
  }

  if (session.payment_status !== "paid" || session.metadata?.jobId !== job.id) {
    logger.warn(
      { jobId: job.id, sessionId: session.id, paymentStatus: session.payment_status },
      "Payment verification failed during confirm-payment",
    );
    return res.status(402).json({ error: "Payment not verified" });
  }

  // Atomically claim the job for processing. The WHERE clause only matches
  // while the job is still awaiting payment, so neither a duplicate confirm
  // call nor the Stripe webhook (which uses the same claim) can ever launch a
  // second AI run. Whoever wins the claim is responsible for processing.
  const claimed = await db
    .update(jobsTable)
    .set({
      status: "processing",
      stripePaymentIntentId: session.payment_intent
        ? String(session.payment_intent)
        : session.id,
      updatedAt: new Date(),
    })
    .where(and(eq(jobsTable.id, job.id), eq(jobsTable.status, "pending_payment")))
    .returning();

  if (claimed.length > 0) {
    processJobAsync(job.id).catch((err) =>
      logger.error({ err, jobId: job.id }, "Async job processing failed")
    );
  }

  const [updated] = await db.select().from(jobsTable).where(eq(jobsTable.id, job.id));
  return res.json(serializeJob(updated));
});

const STYLE_PROMPTS: Record<string, string> = {
  classique:
    "A real unretouched RAW photograph straight out of camera. This is NOT AI art, NOT an illustration, NOT digital art, NOT CGI, NOT a render, NOT stylized. This is a real photograph taken by Peter Hurley-style corporate photographer. " +
    "Technical: Sony A7R IV, Sony 85mm f/1.4 GM lens at f/2.2, 1/200s, ISO 200, daylight white balance 5600K, shot in RAW with minimal color grading. Natural shallow depth of field, creamy bokeh background. " +
    "Lighting: large 120cm octabox softbox as key light camera-left at 45 degrees and slightly above eye level, 100cm white reflector for fill camera-right, gridded strip light as hair/rim light behind subject. Visible asymmetric shadow on the right side of the face. Distinct round catchlights in the eyes from the octabox. " +
    "CRITICAL — preserve the subject's identity exactly: keep the exact same face shape, jawline, nose, lips, eye shape and color, eyebrows, hairline, skin tone, age, ethnicity, and all unique features. Do NOT beautify, smooth, slim, or idealize. Keep natural facial asymmetry. The person must be 100% recognizable as themselves. " +
    "Skin must show authentic photographic detail: visible pores especially on the nose and cheeks, natural skin texture, fine wrinkles where they naturally occur, subtle redness around the nose, individual eyelashes and eyebrow hairs, a few flyaway hairs out of place. NO plastic-smooth skin, NO airbrushing, NO waxy look, NO uniform skin tone. " +
    "Micro-realism: subtle fabric wrinkles in the clothing, individual fabric weave visible on the collar, a slight crease, realistic stubble or pore detail if applicable, natural specular highlights on the lips and tip of the nose. " +
    "Background: out-of-focus medium grey seamless studio backdrop (#7a7a7a) with a subtle vignette from the key light falloff. " +
    "Wardrobe: simple dark blazer or collared shirt appropriate for corporate LinkedIn. No logos, no patterns. " +
    "Composition: classic headshot crop, head and top of shoulders, eyes positioned on the upper third line, subject facing camera with slight angle, soft confident expression with a hint of a smile, gaze directly into lens. " +
    "Final result must look like a frame from a real corporate photoshoot session — if shown next to a real photograph it must be indistinguishable. Render with photographic film grain, not digital cleanliness.",

  moderne:
    "Photorealistic contemporary professional headshot photograph. Not an illustration, not digital art — a real photograph. " +
    "Shot on a Sony A7R IV with an 85mm f/1.4 prime lens, shallow depth of field. " +
    "Dramatic split-key lighting with a subtle blue-to-charcoal gradient background, giving a bold modern editorial look. " +
    "Preserve the subject's exact facial features, bone structure, eye color, skin tone and all natural characteristics — do not alter or idealize the face. " +
    "Eyes sharp with distinctive catchlights. Skin retains natural texture — not airbrushed. " +
    "Background: deep dark gradient from charcoal to near-black with a hint of cool teal, slightly out of focus. " +
    "Clothing is modern and sharp — fitted blazer, open collar, or stylish business-casual attire reflecting a creative professional. " +
    "Headshot composition: head and upper chest centered, chin-to-forehead filling 60% of frame height. " +
    "The final image must look like a high-end editorial or tech executive headshot.",

  decontracte:
    "Photorealistic casual business headshot photograph. Not an illustration, not digital art — a real photograph. " +
    "Shot on a Sony A7R IV with an 85mm f/1.4 prime lens at f/2.2, soft natural-looking depth of field. " +
    "Soft window light or a large single diffused softbox creating a warm, approachable lighting with gentle shadows. " +
    "Preserve the subject's exact facial features, bone structure, eye color, skin tone and all natural characteristics — do not alter or idealize the face. " +
    "Eyes sharp and warm. Skin retains natural texture — not airbrushed. " +
    "Background: warm neutral beige or off-white, soft and slightly out of focus — reminiscent of a bright modern office or co-working space. " +
    "Clothing is smart-casual — open-collar shirt, smart sweater, or relaxed blazer without a tie; friendly and approachable. " +
    "Headshot composition: head and upper chest centered, chin-to-forehead filling 60% of frame height. Slight natural smile. " +
    "The final image must look like a friendly yet professional photo suitable for LinkedIn or a company 'About' page.",

  exterieur:
    "Photorealistic outdoor professional headshot photograph. Not an illustration, not digital art — a real photograph. " +
    "Shot on a Sony A7R IV with an 85mm f/1.4 prime lens at f/1.8, creating beautiful natural bokeh of outdoor scenery. " +
    "Natural outdoor light — golden hour or soft overcast daylight — with a subtle reflector fill. " +
    "Preserve the subject's exact facial features, bone structure, eye color, skin tone and all natural characteristics — do not alter or idealize the face. " +
    "Eyes sharp with natural outdoor catchlights. Skin retains natural texture with natural outdoor skin tones — not airbrushed. " +
    "Background: lush blurred greenery, trees, or an urban outdoors scene with bokeh — natural and vibrant yet out of focus. " +
    "Clothing is professional yet relaxed — smart blazer, collared shirt, or polished casual attire fitting for an outdoor setting. " +
    "Headshot composition: head and upper chest centered, chin-to-forehead filling 60% of frame height. Natural relaxed expression. " +
    "The final image must look like a premium outdoor environmental portrait taken by a professional photographer.",
};

export async function processJobAsync(jobId: string): Promise<void> {
  try {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
    if (!job) throw new Error("Job not found");

    const style = job.style ?? "classique";
    const imageDataUrl = job.imageDataUrl ?? "";

    logger.info({ jobId, style }, "Starting AI headshot transformation");

    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const rawBuffer = Buffer.from(base64Data, "base64");

    // Normalise the input so OpenAI never rejects it for format/mode reasons
    // (HEIC from iPhones, RGBA PNGs, EXIF rotation, oversized dimensions, etc.).
    const sharpModule = (await import("sharp")).default;
    const normalizedBuffer = await sharpModule(rawBuffer, { failOn: "none" })
      .rotate() // apply EXIF orientation then strip it
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // drop alpha → opaque RGB
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    logger.info(
      { jobId, originalKb: Math.round(rawBuffer.length / 1024), normalizedKb: Math.round(normalizedBuffer.length / 1024) },
      "Selfie normalised",
    );

    const { toFile } = await import("openai");

    const prompt = STYLE_PROMPTS[style] ?? STYLE_PROMPTS["classique"];

    const callOpenAI = async (currentPrompt: string) => {
      const imageFile = await toFile(normalizedBuffer, "selfie.jpg", { type: "image/jpeg" });
      return await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: currentPrompt,
        size: "1024x1536",
        quality: "high",
        input_fidelity: "high",
      } as any);
    };

    let response;
    try {
      response = await callOpenAI(prompt);
    } catch (err: unknown) {
      const errAny = err as { code?: string; status?: number };
      // The realistic prompt can occasionally trip the safety filter on real faces.
      // Retry once with a softer, safer prompt before giving up.
      if (errAny?.code === "moderation_blocked") {
        const softPrompt =
          "Professional studio portrait photograph of the same person. Natural lighting, neutral grey background, business attire, neutral confident expression. Keep the subject's facial features exactly as they are.";
        logger.warn({ jobId }, "Initial prompt blocked by moderation, retrying with neutral prompt");
        response = await callOpenAI(softPrompt);
      } else {
        throw err;
      }
    }

    const base64Result = response.data?.[0]?.b64_json ?? "";
    if (!base64Result) {
      throw new Error("No image data in AI response");
    }

    const resultDataUrl = `data:image/png;base64,${base64Result}`;

    // Generate CV PDF with the generated headshot embedded.
    // Before rendering, ask AI to fill in any blank descriptive fields
    // (summary, skills, interests, experience/education descriptions, job title)
    // so even a half-filled wizard produces a polished CV.
    let cvPdfDataUrl: string | null = null;
    if (job.cvData) {
      try {
        const enrichedCV = await enrichCVData(job.cvData as CVData);
        cvPdfDataUrl = await generateCVPdfDataUrl(
          enrichedCV,
          resultDataUrl,
          "classique",
          "fr",
        );
        logger.info({ jobId }, "CV PDF generated successfully");
      } catch (cvErr) {
        logger.error({ err: cvErr, jobId }, "CV PDF generation failed (continuing without CV)");
      }
    }

    await db
      .update(jobsTable)
      .set({
        status: "completed",
        resultDataUrl,
        cvPdfDataUrl,
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId));

    logger.info({ jobId }, "AI headshot transformation completed");
  } catch (err) {
    logger.error({ err, jobId }, "AI headshot transformation failed");
    await db
      .update(jobsTable)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(jobsTable.id, jobId));
  }
}

export default router;
