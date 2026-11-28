/**
 * Real-time rep counting for the camera preview. Uses the same angle definitions and the
 * same rep segmentation as the full analysis, re-run on a rolling buffer.
 */
import type { ExerciseId, Landmark } from "./types.ts";
import { sideIdx, type Side } from "./landmarks.ts";
import { angle, toPoint } from "./geometry.ts";
import { smooth } from "./signal.ts";
import { segmentReps } from "./reps.ts";
import { KEY_JOINTS } from "./classify.ts";
import { THRESHOLDS as T } from "./thresholds.ts";

export interface LiveState {
  angle: number | null;
  reps: number;
  hint: string | null;
  tracking: boolean;
}

export function primaryAngle(lm: Landmark[], exercise: ExerciseId, aspect: number, side: Side): number | null {
  const j = sideIdx(side);
  const ids = exercise === "squat" ? [j.hip, j.knee, j.ankle] : [j.shoulder, j.elbow, j.wrist];
  if (ids.some((i) => lm[i].visibility < T.detection.minVisibility)) return null;
  const p = (i: number) => toPoint(lm[i], aspect);
  return angle(p(ids[0]), p(ids[1]), p(ids[2]));
}

export class LiveRepCounter {
  private times: number[] = [];
  private angles: (number | null)[] = [];
  private visL = 0;
  private visR = 0;
  private last: LiveState = { angle: null, reps: 0, hint: "Place-toi dans le cadre", tracking: false };
  private lastSeg = 0;
  private exercise: ExerciseId;
  private aspect: number;
  constructor(exercise: ExerciseId, aspect: number) { this.exercise = exercise; this.aspect = aspect; }

  push(tSec: number, lm: Landmark[] | null): LiveState {
    if (!lm) {
      this.times.push(tSec); this.angles.push(null);
      this.last = { ...this.last, angle: null, hint: "Aucune personne détectée", tracking: false };
      return this.last;
    }
    const L = this.exercise === "squat" ? [23, 25, 27] : [11, 13, 15];
    const R = this.exercise === "squat" ? [24, 26, 28] : [12, 14, 16];
    this.visL = this.visL * 0.9 + (L.reduce((s, i) => s + lm[i].visibility, 0) / 3) * 0.1;
    this.visR = this.visR * 0.9 + (R.reduce((s, i) => s + lm[i].visibility, 0) / 3) * 0.1;
    const side: Side = this.visL >= this.visR ? "left" : "right";
    const a = primaryAngle(lm, this.exercise, this.aspect, side);
    this.times.push(tSec); this.angles.push(a);
    if (this.times.length > 1200) { this.times.splice(0, 300); this.angles.splice(0, 300); }

    const m = T.detection.edgeMargin;
    const outside = KEY_JOINTS.some((i) => lm[i].x < m || lm[i].x > 1 - m || lm[i].y < m || lm[i].y > 1 - m);
    const hint = outside ? "Recule : tout ton corps doit rester dans le cadre" : a === null ? "Tourne-toi de profil" : null;

    let reps = this.last.reps;
    if (tSec - this.lastSeg > 0.25) {
      this.lastSeg = tSec;
      reps = segmentReps(smooth(this.angles), this.times, { minRange: this.exercise === "squat" ? T.squat.minRange : T.pushup.minRange }).length;
    }
    this.last = { angle: a, reps, hint, tracking: a !== null };
    return this.last;
  }
}
