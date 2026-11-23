/**
 * Example analyses used on marketing pages and in the demo. They are produced by running
 * the REAL analysis engine on procedurally generated movement (no camera involved), and are
 * always displayed with an "Exemple" label.
 */
import { analyze } from "./analyze";
import { syntheticSequence } from "./synthetic";
import type { AnalysisResult } from "./types";

export const HERO_SQUAT = { kneeMin: 84, leanMax: 58, shinMax: 30 };
export const SHOWCASE_SQUAT = { kneeMin: 88, leanMax: 42, shinMax: 30 };
export const SHOWCASE_DEPTHS = [86, 90, 116, 88, 121, 92];

let cache: Record<string, AnalysisResult> = {};

export function exampleAnalysis(kind: "hero" | "showcase" | "pushup"): AnalysisResult {
  if (cache[kind]) return cache[kind];
  let r: AnalysisResult;
  if (kind === "hero") r = analyze(syntheticSequence({ exercise: "squat", reps: 5, squat: HERO_SQUAT, seed: 3 }));
  else if (kind === "showcase") r = analyze(syntheticSequence({ exercise: "squat", reps: 6, squat: SHOWCASE_SQUAT, depthPerRep: SHOWCASE_DEPTHS, seed: 11, tempo: { top: 0.6, down: 1.3, bottom: 0.25, up: 1.0 } }));
  else r = analyze(syntheticSequence({ exercise: "pushup", reps: 6, pushup: { sag: 28 }, seed: 5 }));
  r = { ...r, createdAt: "2026-01-01T00:00:00.000Z" };
  cache = { ...cache, [kind]: r };
  return r;
}
