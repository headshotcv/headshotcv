import { db, jobsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUncachableStripeClient } from "./stripeClient.js";
import { processJobAsync } from "./routes/jobs.js";
import { logger } from "./lib/logger.js";

export async function processWebhook(payload: Buffer, signature: string): Promise<void> {
  const stripe = await getUncachableStripeClient();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not set");
  }

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  logger.info({ type: event.type }, "Stripe webhook received");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const jobId = session.metadata?.jobId;

    if (!jobId) {
      logger.warn({ sessionId: session.id }, "No jobId in session metadata");
      return;
    }

    // Only act on actually-paid sessions. For cards this is always "paid" here,
    // but asynchronous payment methods can complete the session before funds
    // settle, and we must never launch (paid) AI work without payment.
    if (session.payment_status !== "paid") {
      logger.warn(
        { jobId, sessionId: session.id, paymentStatus: session.payment_status },
        "checkout.session.completed but not paid; skipping",
      );
      return;
    }

    // Atomically claim the job (same guard the confirm-payment endpoint uses)
    // so processing is launched exactly once regardless of which path — webhook
    // or client confirm — observes the paid session first.
    const claimed = await db
      .update(jobsTable)
      .set({ status: "processing", stripePaymentIntentId: session.payment_intent ?? session.id })
      .where(and(eq(jobsTable.id, jobId), eq(jobsTable.status, "pending_payment")))
      .returning();

    if (claimed.length > 0) {
      processJobAsync(jobId).catch((err) =>
        logger.error({ err, jobId }, "Async job processing failed (webhook)"),
      );
      logger.info({ jobId }, "Job claimed and processing launched after payment");
    } else {
      logger.info({ jobId }, "Job already claimed; webhook took no action");
    }
  }
}
