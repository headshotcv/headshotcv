import type { AccountData } from "@/lib/store/types";

/** Next session in program order, based on how many program sessions were logged since it was created. */
export function nextSession(d: AccountData) {
  const p = d.program;
  if (!p) return null;
  const since = d.logs.filter((l) => l.createdAt >= p.createdAt).length;
  const per = p.profile.days;
  const weekIdx = Math.min(3, Math.floor(since / per));
  const session = p.weeks[weekIdx].sessions[since % per];
  const done = since >= per * 4;
  return { weekIdx, session, done, completed: since, total: per * 4 };
}

export function thisWeekCount(d: AccountData, now = new Date()) {
  const start = new Date(now); const day = (start.getDay() + 6) % 7; start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - day);
  return d.logs.filter((l) => new Date(l.createdAt) >= start).length;
}
