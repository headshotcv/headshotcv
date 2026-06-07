import { Router } from "express";
import { db, jobsTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";
import {
  requireAdmin,
  isAdminUser,
  type AdminRequest,
} from "../middlewares/requireAdmin.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Price charged per generated CV, in cents (must match the Stripe checkout
// unit_amount in routes/payments.ts).
const UNIT_PRICE_CENTS = 499;

// Lets the signed-in client know whether to surface owner-only UI (e.g. the
// stats link). Any authenticated user may call this; it never 403s, it just
// reports the boolean. The stats data itself stays behind requireAdmin.
router.get("/api/admin/me", requireAuth, async (req: AdminRequest, res) => {
  const isAdmin = await isAdminUser(req.userId!);
  return res.json({ isAdmin });
});

// Owner-only business statistics for the dashboard.
router.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  const [agg] = await db
    .select({
      total: count(),
      pendingPayment: count(
        sql`CASE WHEN ${jobsTable.status} = 'pending_payment' THEN 1 END`,
      ),
      processing: count(
        sql`CASE WHEN ${jobsTable.status} = 'processing' THEN 1 END`,
      ),
      completed: count(
        sql`CASE WHEN ${jobsTable.status} = 'completed' THEN 1 END`,
      ),
      failed: count(sql`CASE WHEN ${jobsTable.status} = 'failed' THEN 1 END`),
    })
    .from(jobsTable);

  const dayExpr = sql<string>`to_char(date_trunc('day', ${jobsTable.createdAt}), 'YYYY-MM-DD')`;
  const perDayRows = await db
    .select({
      date: dayExpr,
      total: count(),
      completed: count(
        sql`CASE WHEN ${jobsTable.status} = 'completed' THEN 1 END`,
      ),
    })
    .from(jobsTable)
    .where(sql`${jobsTable.createdAt} >= date_trunc('day', now()) - interval '6 days'`)
    .groupBy(dayExpr);

  // Build a contiguous 7-day window (oldest → today) and fill gaps with zeros
  // so the chart always shows every day, even with no activity.
  const byDate = new Map(perDayRows.map((r) => [r.date, r]));
  const today = new Date();
  const perDay: Array<{ date: string; total: number; completed: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    perDay.push({
      date: key,
      total: row?.total ?? 0,
      completed: row?.completed ?? 0,
    });
  }

  const completed = agg?.completed ?? 0;

  return res.json({
    totalJobs: agg?.total ?? 0,
    pendingPayment: agg?.pendingPayment ?? 0,
    processing: agg?.processing ?? 0,
    completed,
    failed: agg?.failed ?? 0,
    revenueCents: completed * UNIT_PRICE_CENTS,
    unitPriceCents: UNIT_PRICE_CENTS,
    perDay,
  });
});

export default router;
