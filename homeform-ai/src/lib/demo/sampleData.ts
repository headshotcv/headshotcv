/**
 * SAMPLE DATA — for the marketing preview and the internal demo only.
 * Never mixed with real accounts: the demo stores it under its own key and every screen
 * that shows it carries an "Exemple" / "Démo" label.
 */
import type { AccountData, WorkoutLog } from "@/lib/store/types";
import { generateProgram } from "@/lib/program/generate";
import { exampleAnalysis } from "@/lib/analysis/example";

export function sampleAccount(now = new Date("2026-11-20T18:00:00Z")): AccountData {
  const profile = { goal: "pompes" as const, level: 1 as const, days: 3 as const, minutes: 25 as const, equipment: ["chair" as const, "mat" as const] };
  const program = { ...generateProgram(profile), id: "demo_program", createdAt: "2026-09-28T08:00:00Z" };
  const logs: WorkoutLog[] = [];
  const dayMs = 86400000;
  // 8 weeks, mostly 3 sessions/week with a couple of missed sessions
  const pattern = [3, 3, 2, 3, 3, 1, 3, 3];
  pattern.forEach((n, w) => {
    for (let k = 0; k < n; k++) {
      const date = new Date(now.getTime() - (7 * (7 - w) + [5, 3, 1][k]) * dayMs);
      const push = 4 + Math.round(w * 1.1 + k * 0.3);
      logs.push({
        id: `demo_${w}_${k}`, sessionId: `w${(w % 4) + 1}s${k + 1}`, week: (w % 4) + 1, title: `Séance ${"ABC"[k]}`, durationMin: 22 + ((w + k) % 5),
        items: [
          { exerciseId: "knee-pushup", unit: "reps", sets: [0, 1, 2].map(() => ({ target: push + 1, done: push })) },
          { exerciseId: "squat", unit: "reps", sets: [0, 1, 2].map(() => ({ target: 12, done: 10 + Math.min(4, w) })) },
          { exerciseId: "plank", unit: "seconds", sets: [0, 1].map(() => ({ target: 30, done: 20 + w * 3 })) },
        ],
        createdAt: date.toISOString(),
      });
    }
  });
  const a1 = exampleAnalysis("hero"), a2 = exampleAnalysis("showcase"), a3 = exampleAnalysis("pushup");
  return {
    profile, program, logs: logs.reverse(), coachConsent: true,
    analyses: [
      { id: "demo_a3", exercise: "pushup", status: a3.status, result: a3, createdAt: new Date(now.getTime() - 2 * dayMs).toISOString() },
      { id: "demo_a2", exercise: "squat", status: a2.status, result: a2, createdAt: new Date(now.getTime() - 16 * dayMs).toISOString() },
      { id: "demo_a1", exercise: "squat", status: a1.status, result: a1, createdAt: new Date(now.getTime() - 40 * dayMs).toISOString() },
    ],
    goals: [
      { id: "g1", label: "10 pompes sur les genoux d'affilée", exerciseId: "knee-pushup", target: 10, unit: "reps", createdAt: "2026-10-01T00:00:00Z" },
      { id: "g2", label: "Planche de 45 s", exerciseId: "plank", target: 45, unit: "seconds", createdAt: "2026-10-01T00:00:00Z" },
    ],
    subscription: { status: "dev", plan: "annual" },
  };
}
