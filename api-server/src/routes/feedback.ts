import { Router } from "express";
import { db } from "@workspace/db";
import { feedbackTable, jobsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateFeedbackBody, GetFeedbackForJobParams } from "@workspace/api-zod";

const router = Router();

function serialize(row: typeof feedbackTable.$inferSelect) {
  return {
    id: row.id,
    jobId: row.jobId,
    rating: row.rating,
    easeOfUse: row.easeOfUse,
    photoQuality: row.photoQuality,
    cvQuality: row.cvQuality,
    priceFeeling: row.priceFeeling,
    wouldRecommend: row.wouldRecommend,
    hadIssue: row.hadIssue,
    issueText: row.issueText,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/api/feedback", async (req, res) => {
  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid feedback", details: parsed.error.issues });
  }

  const v = parsed.data;

  // Only allow feedback for real, completed jobs.
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, v.jobId));
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (job.status !== "completed") {
    return res.status(409).json({ error: "Job is not completed yet" });
  }

  // Enforce one feedback per job (DB has a unique index too).
  const [existing] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.jobId, v.jobId))
    .limit(1);
  if (existing) {
    return res.status(409).json({ error: "Feedback already submitted for this job" });
  }

  const [row] = await db
    .insert(feedbackTable)
    .values({
      jobId: v.jobId,
      rating: v.rating,
      easeOfUse: v.easeOfUse ?? null,
      photoQuality: v.photoQuality ?? null,
      cvQuality: v.cvQuality ?? null,
      priceFeeling: v.priceFeeling ?? null,
      wouldRecommend: v.wouldRecommend ?? null,
      hadIssue: v.hadIssue ?? null,
      issueText: v.issueText ?? null,
      comment: v.comment ?? null,
    })
    .returning();

  req.log.info({ jobId: v.jobId, rating: v.rating }, "feedback received");
  return res.status(201).json(serialize(row));
});

router.get("/api/feedback/:jobId", async (req, res) => {
  const parsed = GetFeedbackForJobParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }
  const [row] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.jobId, parsed.data.jobId))
    .orderBy(desc(feedbackTable.createdAt))
    .limit(1);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(row));
});

export default router;
