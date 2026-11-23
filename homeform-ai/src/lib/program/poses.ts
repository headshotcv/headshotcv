/**
 * Keyframes for the animated exercise demonstrations (side view, facing right,
 * model units = body-height fraction, y up, ground ≈ 0.035).
 * Demonstrations interpolate between keyframe A and B.
 */
import { pushupJoints, squatJoints, type Joints } from "@/lib/analysis/synthetic";

type V = { x: number; y: number };
const v = (x: number, y: number): V => ({ x, y });

function lerpV(a: V, b: V, t: number): V { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

export function lerpJoints(a: Joints, b: Joints, t: number): Joints {
  const out = {} as Joints;
  for (const k of Object.keys(a) as (keyof Joints)[]) {
    if (k === "far") continue;
    (out as Record<string, V>)[k] = lerpV(a[k] as V, b[k] as V, t);
  }
  if (a.far || b.far) {
    out.far = {};
    const keys = new Set([...Object.keys(a.far ?? {}), ...Object.keys(b.far ?? {})]) as Set<keyof NonNullable<Joints["far"]>>;
    for (const k of keys) {
      const A = a.far?.[k] ?? (a as unknown as Record<string, V>)[k];
      const B = b.far?.[k] ?? (b as unknown as Record<string, V>)[k];
      out.far[k] = lerpV(A, B, t);
    }
  }
  return out;
}

export type DemoKey =
  | "squat" | "chair-squat" | "wall-sit" | "pushup" | "incline-pushup" | "knee-pushup"
  | "lunge" | "glute-bridge" | "plank" | "superman" | "calf-raise" | "chair-dip" | "mountain-climber" | "pike-pushup";

export interface Demo { a: Joints; b: Joints; hold?: boolean; prop?: "chair" | "wall" | "sofa" }

const pushTop = pushupJoints(0);
const pushBottom = pushupJoints(1);

function raise(j: Joints, dy: number, pivot: V, deg: number): Joints {
  // rotate whole figure around pivot by deg (used for incline push-ups)
  const r = (deg * Math.PI) / 180;
  const rot = (p: V): V => ({ x: pivot.x + (p.x - pivot.x) * Math.cos(r) - (p.y - pivot.y) * Math.sin(r), y: pivot.y + (p.x - pivot.x) * Math.sin(r) + (p.y - pivot.y) * Math.cos(r) + dy });
  const out = {} as Joints;
  for (const k of Object.keys(j) as (keyof Joints)[]) if (k !== "far") (out as Record<string, V>)[k] = rot(j[k] as V);
  return out;
}

export const DEMOS: Record<DemoKey, Demo> = {
  squat: { a: squatJoints(0), b: squatJoints(1) },
  "chair-squat": { a: squatJoints(0, { kneeMin: 100 }), b: squatJoints(1, { kneeMin: 100, leanMax: 35 }), prop: "chair" },
  "wall-sit": { a: squatJoints(0.92, { kneeMin: 92, leanMax: 2, shinMax: 4 }), b: squatJoints(0.96, { kneeMin: 92, leanMax: 2, shinMax: 4 }), hold: true, prop: "wall" },
  pushup: { a: pushTop, b: pushBottom },
  "incline-pushup": { a: raise(pushTop, 0, pushTop.toe, 22), b: raise(pushBottom, 0, pushBottom.toe, 22), prop: "sofa" },
  "knee-pushup": {
    a: { ...pushTop, knee: v(0.22, 0.05), ankle: v(0.02, 0.07), heel: v(0.0, 0.1), toe: v(-0.02, 0.05), hip: v(0.4, 0.17) },
    b: { ...pushBottom, knee: v(0.22, 0.05), ankle: v(0.02, 0.07), heel: v(0.0, 0.1), toe: v(-0.02, 0.05), hip: v(0.4, 0.1) },
  },
  plank: { a: { ...pushTop }, b: { ...pushTop, hip: { x: pushTop.hip.x, y: pushTop.hip.y + 0.008 } }, hold: true },
  lunge: {
    a: { nose: v(0.03, 0.93), shoulder: v(0.0, 0.81), elbow: v(0.0, 0.66), wrist: v(0.01, 0.52), hip: v(0.0, 0.54), knee: v(0.08, 0.32), ankle: v(0.1, 0.08), heel: v(0.07, 0.04), toe: v(0.19, 0.035), far: { knee: v(-0.08, 0.32), ankle: v(-0.18, 0.12), heel: v(-0.2, 0.15), toe: v(-0.22, 0.035), elbow: v(-0.01, 0.66), wrist: v(0.0, 0.52) } },
    b: { nose: v(0.0, 0.73), shoulder: v(-0.02, 0.61), elbow: v(-0.02, 0.46), wrist: v(-0.01, 0.32), hip: v(-0.04, 0.34), knee: v(0.16, 0.25), ankle: v(0.1, 0.08), heel: v(0.07, 0.04), toe: v(0.19, 0.035), far: { knee: v(-0.14, 0.06), ankle: v(-0.32, 0.1), heel: v(-0.34, 0.12), toe: v(-0.3, 0.035), elbow: v(-0.03, 0.46), wrist: v(-0.02, 0.32) } },
  },
  "glute-bridge": {
    a: { nose: v(-0.36, 0.09), shoulder: v(-0.24, 0.07), elbow: v(-0.1, 0.05), wrist: v(0.03, 0.05), hip: v(0.02, 0.08), knee: v(0.2, 0.24), ankle: v(0.3, 0.07), heel: v(0.28, 0.04), toe: v(0.38, 0.04) },
    b: { nose: v(-0.36, 0.09), shoulder: v(-0.24, 0.08), elbow: v(-0.1, 0.05), wrist: v(0.03, 0.05), hip: v(0.02, 0.24), knee: v(0.22, 0.3), ankle: v(0.3, 0.07), heel: v(0.28, 0.04), toe: v(0.38, 0.04) },
  },
  superman: {
    a: { nose: v(0.38, 0.1), shoulder: v(0.28, 0.08), elbow: v(0.42, 0.08), wrist: v(0.55, 0.08), hip: v(0.0, 0.08), knee: v(-0.22, 0.06), ankle: v(-0.43, 0.06), heel: v(-0.43, 0.09), toe: v(-0.47, 0.04) },
    b: { nose: v(0.37, 0.18), shoulder: v(0.27, 0.13), elbow: v(0.41, 0.17), wrist: v(0.54, 0.2), hip: v(0.0, 0.08), knee: v(-0.21, 0.11), ankle: v(-0.42, 0.15), heel: v(-0.42, 0.18), toe: v(-0.46, 0.13) },
  },
  "calf-raise": { a: squatJoints(0), b: { ...squatJoints(0), ...Object.fromEntries(Object.entries(squatJoints(0)).filter(([k]) => k !== "toe").map(([k, p]) => [k, { x: (p as V).x + 0.02, y: (p as V).y + 0.07 }])) } as Joints },
  "chair-dip": {
    a: { nose: v(0.07, 0.86), shoulder: v(0.0, 0.73), elbow: v(-0.03, 0.59), wrist: v(-0.06, 0.46), hip: v(0.0, 0.47), knee: v(0.22, 0.42), ankle: v(0.3, 0.08), heel: v(0.27, 0.04), toe: v(0.37, 0.035) },
    b: { nose: v(0.08, 0.72), shoulder: v(0.02, 0.59), elbow: v(-0.12, 0.55), wrist: v(-0.06, 0.46), hip: v(0.02, 0.33), knee: v(0.23, 0.35), ankle: v(0.3, 0.08), heel: v(0.27, 0.04), toe: v(0.37, 0.035) },
    prop: "chair",
  },
  "mountain-climber": {
    a: { ...pushTop, far: { knee: v(0.5, 0.2), ankle: v(0.33, 0.12), heel: v(0.31, 0.14), toe: v(0.36, 0.05) } },
    b: { ...pushTop, knee: v(0.5, 0.2), ankle: v(0.33, 0.12), heel: v(0.31, 0.14), toe: v(0.36, 0.05), far: { knee: pushTop.knee, ankle: pushTop.ankle, heel: pushTop.heel, toe: pushTop.toe } },
  },
  "pike-pushup": {
    a: { nose: v(0.6, 0.2), shoulder: v(0.52, 0.27), elbow: v(0.57, 0.15), wrist: v(0.62, 0.04), hip: v(0.32, 0.5), knee: v(0.17, 0.27), ankle: v(0.03, 0.07), heel: v(0.0, 0.1), toe: v(0.05, 0.035) },
    b: { nose: v(0.64, 0.07), shoulder: v(0.54, 0.16), elbow: v(0.5, 0.11), wrist: v(0.62, 0.04), hip: v(0.32, 0.45), knee: v(0.17, 0.25), ankle: v(0.03, 0.07), heel: v(0.0, 0.1), toe: v(0.05, 0.035) },
  },
};
