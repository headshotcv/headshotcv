/** BlazePose 33-landmark indices used by the analysis. */
export const L = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFoot: 31,
  rightFoot: 32,
} as const;

export type Side = "left" | "right";

export function sideIdx(side: Side) {
  const l = side === "left";
  return {
    shoulder: l ? L.leftShoulder : L.rightShoulder,
    elbow: l ? L.leftElbow : L.rightElbow,
    wrist: l ? L.leftWrist : L.rightWrist,
    hip: l ? L.leftHip : L.rightHip,
    knee: l ? L.leftKnee : L.rightKnee,
    ankle: l ? L.leftAnkle : L.rightAnkle,
  };
}

/** Skeleton edges for drawing overlays. */
export const SKELETON: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32],
];
