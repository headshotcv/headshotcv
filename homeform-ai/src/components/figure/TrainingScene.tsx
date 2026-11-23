"use client";
import { useMemo } from "react";
import { Athlete } from "./Athlete";
import { Room } from "./Room";
import { useClock } from "./useClock";
import { phaseAt, pushupJoints, squatJoints, type PushupParams, type SquatParams } from "@/lib/analysis/synthetic";
import { angle } from "@/lib/analysis/geometry";
import { cn } from "@/lib/cn";

export type SceneExercise = "squat" | "pushup" | "lunge" | "plank" | "glute-bridge";

export interface TrainingSceneProps {
  exercise?: "squat" | "pushup";
  ratio?: "portrait" | "landscape" | "square" | "tall";
  variant?: "living" | "bedroom" | "garden";
  skeleton?: boolean;
  skeletonOpacity?: number;
  showAngle?: boolean;
  squat?: SquatParams;
  pushup?: PushupParams;
  speed?: number;
  /** freeze at a given time (s) instead of animating */
  frozenAt?: number;
  className?: string;
  children?: React.ReactNode;
  /** render the figure only (no room) */
  bare?: boolean;
  tempo?: { top: number; down: number; bottom: number; up: number };
  depthPerRep?: number[];
  reps?: number;
}

const RATIOS = { portrait: 1.25, landscape: 0.5625, square: 1, tall: 1.6 };

export const DEFAULT_TEMPO = {
  squat: { top: 0.6, down: 1.3, bottom: 0.25, up: 1.0 },
  pushup: { top: 0.6, down: 1.0, bottom: 0.2, up: 0.8 },
};

export function TrainingScene({ exercise = "squat", ratio = "portrait", variant = "living", skeleton = false, skeletonOpacity = 1, showAngle = false, squat, pushup, speed = 1, frozenAt, className, children, bare, tempo: tempoProp, depthPerRep, reps }: TrainingSceneProps) {
  const { t: clock, ref } = useClock(frozenAt === undefined, speed);
  const t = frozenAt ?? clock;
  const W = 1000;
  const H = W * RATIOS[ratio];
  const floorY = H * (ratio === "landscape" ? 0.74 : 0.7);

  const { joints, measured } = useMemo(() => {
    const tempo = tempoProp ?? DEFAULT_TEMPO[exercise];
    const ph = phaseAt(t, tempo);
    const p = reps !== undefined && ph.repIndex >= reps ? 0 : ph.p;
    const d = depthPerRep?.[Math.min(ph.repIndex, depthPerRep.length - 1)];
    const j = exercise === "squat" ? squatJoints(p, { ...squat, ...(d ? { kneeMin: d } : {}) }) : pushupJoints(p, { ...pushup, ...(d ? { elbowMin: d } : {}) });
    const m = exercise === "squat" ? angle(j.hip, j.knee, j.ankle) : angle(j.shoulder, j.elbow, j.wrist);
    return { joints: j, measured: m };
  }, [t, exercise, squat, pushup, tempoProp, depthPerRep, reps]);

  const scale = exercise === "squat"
    ? Math.min(H * 0.7, W * (ratio === "landscape" ? 0.6 : 0.85))
    : Math.min(W * (ratio === "landscape" ? 0.7 : 0.98), H * 1.2);
  const origin = exercise === "squat"
    ? { x: W * 0.5, y: floorY + (H - floorY) * 0.45 }
    : { x: W * (ratio === "landscape" ? 0.22 : 0.06), y: floorY + (H - floorY) * 0.5 };

  return (
    <div ref={ref} className={cn("relative overflow-hidden grain", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={exercise === "squat" ? "Illustration : squat au poids du corps dans un salon" : "Illustration : pompes sur un tapis dans un appartement"}>
        {!bare && <Room w={W} h={H} floorY={floorY} variant={variant} />}
        <ellipse cx={origin.x + (exercise === "pushup" ? scale * 0.35 : 0)} cy={origin.y + 6} rx={exercise === "squat" ? scale * 0.18 : scale * 0.5} ry={scale * 0.02} fill="rgb(0 0 0 / 0.55)" />
        <Athlete joints={joints} origin={origin} scale={scale} skeleton={skeleton} skeletonOpacity={skeletonOpacity} highlight={showAngle ? (exercise === "squat" ? "knee" : "elbow") : null} angleLabel={showAngle ? `${Math.round(measured)}°` : undefined} />
      </svg>
      {children}
    </div>
  );
}
