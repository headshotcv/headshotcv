/**
 * Procedural side-view body model. Used for:
 *  - unit tests of the analysis pipeline (known ground truth),
 *  - the clearly-labelled "exemple" sequences on the marketing pages and in the demo,
 *  - the exercise demonstration figures.
 * It never replaces a user's real analysis.
 */
import type { Landmark, PoseFrame } from "./types.ts";

type V = { x: number; y: number }; // y up, frame-height units
const rad = (d: number) => (d * Math.PI) / 180;
const dir = (deg: number, len: number): V => ({ x: Math.cos(rad(deg)) * len, y: Math.sin(rad(deg)) * len });
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LEN = { shin: 0.22, thigh: 0.22, torso: 0.27, neck: 0.09, upper: 0.15, fore: 0.14 };

export interface SquatParams { kneeMin?: number; leanMax?: number; shinMax?: number }
export interface PushupParams { elbowMin?: number; elbowTop?: number; sag?: number }

export type JointName = "nose" | "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" | "heel" | "toe";
export type Joints = Record<JointName, V> & {
  /** optional far-side limbs when they differ from the near side (lunges, climbers…) */
  far?: Partial<Record<"elbow" | "wrist" | "knee" | "ankle" | "heel" | "toe", V>>;
};

export function squatJoints(p: number, prm: SquatParams = {}): Joints {
  const { kneeMin = 85, leanMax = 40, shinMax = 32 } = prm;
  const k = lerp(176, kneeMin, p);
  const ts = lerp(2, shinMax, p);
  const lean = lerp(4, leanMax, p);
  const ankle = { x: 0, y: 0.08 };
  const knee = add(ankle, dir(90 - ts, LEN.shin));
  const hip = add(knee, dir(270 - ts - k, LEN.thigh));
  const shoulder = add(hip, dir(90 - lean, LEN.torso));
  const nose = add(shoulder, dir(90 - lean * 0.6 + 8, LEN.neck));
  const armDir = lerp(-88, -5, Math.min(1, p * 1.3));
  const elbow = add(shoulder, dir(armDir, LEN.upper));
  const wrist = add(elbow, dir(armDir + 4, LEN.fore));
  return { nose, shoulder, elbow, wrist, hip, knee, ankle, heel: add(ankle, { x: -0.035, y: -0.04 }), toe: add(ankle, { x: 0.085, y: -0.045 }) };
}

function circleIntersect(c0: V, r0: number, c1: V, r1: number, pickUpper = true): V {
  const dx = c1.x - c0.x, dy = c1.y - c0.y;
  const d = Math.hypot(dx, dy);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = c0.x + (a * dx) / d, my = c0.y + (a * dy) / d;
  const p1 = { x: mx + (h * dy) / d, y: my - (h * dx) / d };
  const p2 = { x: mx - (h * dy) / d, y: my + (h * dx) / d };
  return pickUpper ? (p1.y > p2.y ? p1 : p2) : (p1.y > p2.y ? p2 : p1);
}

export function pushupJoints(p: number, prm: PushupParams = {}): Joints {
  const { elbowMin = 80, elbowTop = 172, sag = 0 } = prm;
  const e = lerp(elbowTop, elbowMin, p);
  const toe = { x: 0, y: 0.06 };
  const bodyLen = LEN.shin + LEN.thigh + LEN.torso;
  // place the wrist so that the shoulder is above it at the top position
  const dTop = Math.sqrt(LEN.upper ** 2 + LEN.fore ** 2 - 2 * LEN.upper * LEN.fore * Math.cos(rad(elbowTop)));
  const wx = Math.sqrt(bodyLen ** 2 - (dTop + 0.0) ** 2 + 0.0001);
  const wrist = { x: wx, y: 0.06 };
  const d = Math.sqrt(LEN.upper ** 2 + LEN.fore ** 2 - 2 * LEN.upper * LEN.fore * Math.cos(rad(e)));
  const shoulder = circleIntersect(toe, bodyLen, wrist, d, true);
  // elbow: behind (towards feet) and above the wrist
  const el1 = circleIntersect(shoulder, LEN.upper, wrist, LEN.fore, true);
  const el2 = circleIntersect(shoulder, LEN.upper, wrist, LEN.fore, false);
  const elbow = el1.x < el2.x ? el1 : el2;
  const ankle = add(toe, { x: 0.03, y: 0.03 });
  const along = (f: number) => ({ x: lerp(ankle.x, shoulder.x, f), y: lerp(ankle.y, shoulder.y, f) });
  const bx = shoulder.x - ankle.x, by = shoulder.y - ankle.y;
  const bl = Math.hypot(bx, by);
  const nrm = { x: -by / bl, y: bx / bl }; // perpendicular, pointing "up"
  const legFrac = (LEN.shin + LEN.thigh) / bodyLen;
  const hipLine = along(legFrac);
  // sag: hip drops below the line by an angle `sag` (deg); negative = pike
  const off = Math.tan(rad(sag / 2)) * (LEN.torso * 0.9);
  const hip = { x: hipLine.x - nrm.x * off, y: hipLine.y - nrm.y * off };
  const kneeLine = along(legFrac * 0.5);
  const knee = { x: kneeLine.x - nrm.x * off * 0.5, y: kneeLine.y - nrm.y * off * 0.5 };
  const nose = add(shoulder, { x: (bx / bl) * LEN.neck, y: (by / bl) * LEN.neck + 0.01 });
  return { nose, shoulder, elbow, wrist, hip, knee, ankle, heel: add(ankle, { x: -0.02, y: 0.03 }), toe };
}

/** Map joints (frame-height units, y up) to 33 normalised BlazePose landmarks. */
export function jointsToLandmarks(j: Joints, opts: { aspect: number; originX: number; groundY?: number; facing?: 1 | -1; jitter?: number; rand?: () => number }): Landmark[] {
  const { aspect, originX, groundY = 0.93, facing = 1, jitter = 0, rand = Math.random } = opts;
  const n = () => (jitter ? (rand() - 0.5) * 2 * jitter : 0);
  const to = (v: V, dz = 0, vis = 0.95): Landmark => ({ x: (originX + facing * v.x) / aspect + n(), y: groundY - v.y + n(), z: dz, visibility: vis });
  const lm: Landmark[] = Array.from({ length: 33 }, () => to(j.nose, 0, 0.9));
  const near = 0.96, far = 0.7, dz = 0.006;
  // near side = left when facing right
  const sides: [number[], number, number][] = [
    [[11, 13, 15, 23, 25, 27, 29, 31], 0, near],
    [[12, 14, 16, 24, 26, 28, 30, 32], dz, far],
  ];
  const keys: JointName[] = ["shoulder", "elbow", "wrist", "hip", "knee", "ankle", "heel", "toe"];
  for (const [idx, off, vis] of sides) {
    idx.forEach((li, k) => {
      const v = j[keys[k]];
      lm[li] = to({ x: v.x - off, y: v.y }, off, vis);
    });
  }
  for (let i = 1; i <= 10; i++) lm[i] = to(add(j.nose, { x: 0.005 * (i % 3), y: 0.01 }), 0, 0.9);
  for (const i of [17, 18, 19, 20, 21, 22]) lm[i] = to(j.wrist, 0, 0.8);
  return lm;
}

/** Smooth rep phase 0→1→0 with pauses, given a rep schedule. */
export function phaseAt(t: number, rep = { top: 0.5, down: 1.2, bottom: 0.15, up: 1.0 }): { p: number; repIndex: number } {
  const period = rep.top + rep.down + rep.bottom + rep.up;
  const repIndex = Math.floor(t / period);
  let u = t - repIndex * period;
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
  if (u < rep.top) return { p: 0, repIndex };
  u -= rep.top;
  if (u < rep.down) return { p: ease(u / rep.down), repIndex };
  u -= rep.down;
  if (u < rep.bottom) return { p: 1, repIndex };
  u -= rep.bottom;
  return { p: 1 - ease(Math.min(1, u / rep.up)), repIndex };
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SyntheticOpts {
  exercise: "squat" | "pushup";
  reps?: number;
  fps?: number;
  aspect?: number;
  squat?: SquatParams;
  pushup?: PushupParams;
  /** per-rep depth override (squat kneeMin or push-up elbowMin) */
  depthPerRep?: number[];
  jitter?: number;
  luma?: number;
  seed?: number;
  tempo?: { top: number; down: number; bottom: number; up: number };
}

export function syntheticSequence(o: SyntheticOpts): { frames: PoseFrame[]; meta: { width: number; height: number; duration: number } } {
  const { exercise, reps = 5, fps = 15, aspect = 16 / 9, jitter = 0.002, luma = 120, seed = 7 } = o;
  const tempo = o.tempo ?? (exercise === "squat" ? { top: 0.5, down: 1.3, bottom: 0.2, up: 1.0 } : { top: 0.5, down: 1.0, bottom: 0.15, up: 0.8 });
  const period = tempo.top + tempo.down + tempo.bottom + tempo.up;
  const duration = reps * period + 0.6;
  const rand = mulberry32(seed);
  const frames: PoseFrame[] = [];
  for (let i = 0; i * (1 / fps) <= duration; i++) {
    const t = i / fps;
    const { p, repIndex } = phaseAt(t, tempo);
    const depth = o.depthPerRep?.[Math.min(repIndex, (o.depthPerRep?.length ?? 1) - 1)];
    const j = exercise === "squat"
      ? squatJoints(repIndex >= reps ? 0 : p, { ...o.squat, ...(depth ? { kneeMin: depth } : {}) })
      : pushupJoints(repIndex >= reps ? 0 : p, { ...o.pushup, ...(depth ? { elbowMin: depth } : {}) });
    const originX = exercise === "squat" ? aspect * 0.48 : aspect * 0.22;
    frames.push({ t, landmarks: jointsToLandmarks(j, { aspect, originX, jitter, rand }), luma: i % 5 === 0 ? luma : undefined });
  }
  return { frames, meta: { width: 1280, height: Math.round(1280 / aspect), duration } };
}
