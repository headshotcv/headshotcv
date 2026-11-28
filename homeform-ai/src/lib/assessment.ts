import type { Assessment } from "@/lib/store/types";
import type { Level } from "@/lib/program/generate";

/** Indicative level from the starting test (to be validated by qualified professionals). */
export function levelFromAssessment(a: Assessment): Level {
  const push = a.pushupVariant === "pushup" ? (a.pushups >= 15 ? 3 : a.pushups >= 5 ? 2 : 1) : a.pushups >= 12 ? 2 : 1;
  const squat = a.squats60 >= 35 ? 3 : a.squats60 >= 20 ? 2 : 1;
  const core = a.plank >= 60 ? 3 : a.plank >= 30 ? 2 : 1;
  return Math.round((push + squat + core) / 3) as Level;
}

export function baselineFrom(a: Assessment) {
  return { pushupVariant: a.pushupVariant, pushups: a.pushups, squats60: a.squats60, plank: a.plank, wallSit: a.wallSit };
}
