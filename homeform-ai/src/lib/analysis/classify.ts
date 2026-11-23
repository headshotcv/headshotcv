import type { Landmark, PoseFrame, ExerciseId } from "./types.ts";
import { L, type Side } from "./landmarks.ts";
import { inclinationFromHorizontal, toPoint, mean } from "./geometry.ts";

export const KEY_JOINTS = [L.leftShoulder, L.rightShoulder, L.leftHip, L.rightHip, L.leftKnee, L.rightKnee, L.leftAnkle, L.rightAnkle, L.leftElbow, L.rightElbow, L.leftWrist, L.rightWrist];

const SIDE_JOINTS: Record<Side, number[]> = {
  left: [L.leftShoulder, L.leftElbow, L.leftWrist, L.leftHip, L.leftKnee, L.leftAnkle],
  right: [L.rightShoulder, L.rightElbow, L.rightWrist, L.rightHip, L.rightKnee, L.rightAnkle],
};

/** Pick the body side that is best seen by the camera across the clip. */
export function pickSide(frames: PoseFrame[]): Side {
  let l = 0, r = 0;
  for (const f of frames) {
    if (!f.landmarks) continue;
    l += mean(SIDE_JOINTS.left.map((i) => f.landmarks![i].visibility));
    r += mean(SIDE_JOINTS.right.map((i) => f.landmarks![i].visibility));
  }
  return l >= r ? "left" : "right";
}

function mid(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, visibility: Math.min(a.visibility, b.visibility) };
}

/** Torso inclination from horizontal (90 = upright, 0 = lying) for one frame. */
export function torsoInclination(lm: Landmark[], aspect: number): number {
  const sh = toPoint(mid(lm[L.leftShoulder], lm[L.rightShoulder]), aspect);
  const hip = toPoint(mid(lm[L.leftHip], lm[L.rightHip]), aspect);
  return inclinationFromHorizontal(hip, sh);
}

/** Shoulder→ankle line inclination from horizontal (90 = standing/squatting, ~20 = plank). */
export function bodyInclination(lm: Landmark[], aspect: number): number {
  const sh = toPoint(mid(lm[L.leftShoulder], lm[L.rightShoulder]), aspect);
  const an = toPoint(mid(lm[L.leftAnkle], lm[L.rightAnkle]), aspect);
  return inclinationFromHorizontal(an, sh);
}

/**
 * Camera view estimate: ratio between shoulder width and torso length in the image.
 * Side view → shoulders overlap (small ratio). Front view → wide shoulders.
 * Only meaningful when the person is upright (squat). For push-ups we use the
 * horizontal spread of the body instead.
 */
export function estimateView(frames: PoseFrame[], aspect: number, exercise: ExerciseId | null): "profil" | "face" | "trois-quarts" | "inconnue" {
  const ratios: number[] = [];
  for (const f of frames) {
    const lm = f.landmarks;
    if (!lm) continue;
    const ls = toPoint(lm[L.leftShoulder], aspect), rs = toPoint(lm[L.rightShoulder], aspect);
    const lh = toPoint(lm[L.leftHip], aspect), rh = toPoint(lm[L.rightHip], aspect);
    const shoulderW = Math.hypot(ls.x - rs.x, ls.y - rs.y);
    const hipC = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
    const shC = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const torso = Math.hypot(shC.x - hipC.x, shC.y - hipC.y);
    if (torso > 0) ratios.push(shoulderW / torso);
  }
  if (ratios.length < 5) return "inconnue";
  ratios.sort((a, b) => a - b);
  const r = ratios[Math.floor(ratios.length / 2)];
  // thresholds calibrated on synthetic and recorded clips; push-up torsos foreshorten less.
  const [side, front] = exercise === "pushup" ? [0.35, 0.7] : [0.3, 0.6];
  if (r < side) return "profil";
  if (r > front) return "face";
  return "trois-quarts";
}

/**
 * Exercise recognition from posture: squat = shoulders stacked above the feet throughout,
 * push-up = shoulder→ankle line close to horizontal throughout. Returns confidence = share
 * of frames consistent with the predicted posture.
 */
export function classifyExercise(frames: PoseFrame[], aspect: number): { exercise: ExerciseId | null; confidence: number } {
  const incl = frames.filter((f) => f.landmarks).map((f) => bodyInclination(f.landmarks!, aspect));
  if (incl.length < 10) return { exercise: null, confidence: 0 };
  const upright = incl.filter((a) => a > 60).length / incl.length;
  const horizontal = incl.filter((a) => a < 40).length / incl.length;
  if (upright >= 0.7) return { exercise: "squat", confidence: upright };
  if (horizontal >= 0.7) return { exercise: "pushup", confidence: horizontal };
  return { exercise: null, confidence: Math.max(upright, horizontal) };
}
