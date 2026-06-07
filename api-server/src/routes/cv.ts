import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ImportCvBody } from "@workspace/api-zod";

const router = Router();

const EXTRACTION_SYSTEM =
  "Tu es un assistant qui extrait des données structurées depuis un CV existant. " +
  "On te fournit un CV (image ou PDF). Tu lis tout son contenu et tu renvoies UNIQUEMENT un objet JSON " +
  "valide, sans texte autour, sans markdown. " +
  "Tu écris les valeurs dans la langue d'origine du CV (généralement le français). " +
  "Tu n'inventes RIEN : si une information est absente, tu omets le champ (ou tu mets un tableau vide). " +
  "Format JSON attendu :\n" +
  `{
  "firstName": string,
  "lastName": string,
  "jobTitle": string,
  "email": string,
  "phone": string,
  "address": string,
  "city": string,
  "website": string,
  "linkedin": string,
  "summary": string,
  "experiences": [{ "title": string, "company": string, "location": string, "startDate": string, "endDate": string, "description": string }],
  "education": [{ "degree": string, "school": string, "location": string, "startDate": string, "endDate": string, "description": string }],
  "skills": [string],
  "languages": [{ "name": string, "level": string }],
  "certifications": [{ "name": string, "issuer": string, "year": string }],
  "projects": [{ "name": string, "description": string, "link": string }],
  "references": [{ "name": string, "role": string, "contact": string }],
  "interests": [string]
}` +
  "\nPour les descriptions d'expérience, conserve les puces / réalisations telles quelles. " +
  "Pour startDate/endDate, garde le format texte tel qu'écrit sur le CV (ex : \"Sept. 2022\", \"2021\").";

function dataUrlMime(dataUrl: string): string | null {
  const match = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return match ? match[1] : null;
}

router.post("/api/cv/import", async (req, res) => {
  const parsed = ImportCvBody.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Requête invalide", details: parsed.error.issues });
  }

  const { fileDataUrl } = parsed.data;
  const mime = dataUrlMime(fileDataUrl);
  if (!mime) {
    return res.status(400).json({ error: "Fichier illisible" });
  }

  const isPdf = mime === "application/pdf";
  const isImage = mime.startsWith("image/");
  if (!isPdf && !isImage) {
    return res
      .status(400)
      .json({ error: "Format non supporté. Importez un PDF ou une image." });
  }

  const userContent = isPdf
    ? ([
        {
          type: "file" as const,
          file: { filename: "cv.pdf", file_data: fileDataUrl },
        },
        {
          type: "text" as const,
          text: "Extrait les données structurées de ce CV au format JSON demandé.",
        },
      ])
    : ([
        {
          type: "image_url" as const,
          image_url: { url: fileDataUrl },
        },
        {
          type: "text" as const,
          text: "Extrait les données structurées de ce CV au format JSON demandé.",
        },
      ]);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { role: "user", content: userContent as any },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return res.status(502).json({ error: "Lecture du CV vide" });
    }

    let extracted: unknown;
    try {
      extracted = JSON.parse(raw);
    } catch {
      // Do not log raw model output — it contains the candidate's personal data.
      req.log.error({ rawLength: raw.length }, "CV import: JSON parse failed");
      return res
        .status(502)
        .json({ error: "Le CV n'a pas pu être analysé. Réessayez." });
    }

    return res.json(extracted);
  } catch (err) {
    req.log.error({ err }, "CV import failed");
    return res
      .status(500)
      .json({ error: "Erreur lors de la lecture du CV, réessayez." });
  }
});

export default router;
