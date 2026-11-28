/** Normalised landmark from BlazePose (x, y in [0,1] relative to the frame). */
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  /** seconds from the start of the video */
  t: number;
  /** 33 BlazePose landmarks, or null when no person was detected */
  landmarks: Landmark[] | null;
  /** mean luma 0..255 sampled for this frame (optional, only on some frames) */
  luma?: number;
}

export interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

export type ExerciseId = "squat" | "pushup";

export type RejectionCode =
  | "video_too_short"
  | "video_too_long"
  | "resolution_too_low"
  | "too_dark"
  | "overexposed"
  | "no_person"
  | "body_out_of_frame"
  | "exercise_not_recognized"
  | "exercise_mismatch"
  | "no_reps"
  | "processing_error";

export interface QualityCheck {
  id: "duration" | "resolution" | "lighting" | "detection" | "framing" | "orientation";
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
}

export interface RepMetrics {
  index: number;
  start: number;
  bottom: number;
  end: number;
  /** primary joint angle at the bottom of the rep (knee for squat, elbow for push-up) */
  minAngle: number;
  /** primary joint angle at the top of the rep */
  topAngle: number;
  descent: number;
  ascent: number;
  /** squat: trunk inclination from vertical at bottom (deg). push-up: max body-line deviation (deg, + = hips sag, - = hips high) */
  secondary: number;
}

export type ObservationKind = "strength" | "improve" | "info";

export interface Observation {
  id: string;
  kind: ObservationKind;
  title: string;
  detail: string;
  /** measured evidence, human readable */
  evidence: string;
  /** timestamps (s) the user can jump to */
  moments: number[];
  drill?: { name: string; how: string };
  confidence: "élevée" | "moyenne" | "faible";
}

export interface SeriesPoint {
  t: number;
  angle: number | null;
}

export interface AnalysisResult {
  version: 1;
  status: "ok" | "uncertain" | "rejected";
  rejection?: { code: RejectionCode; message: string; advice: string };
  requestedExercise?: ExerciseId;
  exercise: ExerciseId | null;
  exerciseConfidence: number;
  view: "profil" | "face" | "trois-quarts" | "inconnue";
  side: "left" | "right";
  quality: QualityCheck[];
  reps: RepMetrics[];
  summary: {
    repCount: number;
    avgMinAngle: number | null;
    minAngleSpread: number | null;
    avgRepDuration: number | null;
    repDurationSpread: number | null;
    avgSecondary: number | null;
  };
  observations: Observation[];
  limitations: string[];
  /** primary angle time series (downsampled) for charts / timeline */
  series: SeriesPoint[];
  meta: VideoMeta & { framesAnalysed: number; detectionRate: number };
  createdAt: string;
}
