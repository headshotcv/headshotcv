"use client";
import { useMemo } from "react";
import { Athlete } from "./Athlete";
import { useClock } from "./useClock";
import { DEMOS, lerpJoints, type DemoKey } from "@/lib/program/poses";
import type { Joints } from "@/lib/analysis/synthetic";
import { cn } from "@/lib/cn";

/** Looping, original stick-volume demonstration of an exercise (side view). */
export function ExerciseDemo({ demo, className, skeleton = true, label }: { demo?: DemoKey; className?: string; skeleton?: boolean; label?: string }) {
  const { t, ref } = useClock(!!demo, 1);
  const d = demo ? DEMOS[demo] : undefined;
  const W = 600, H = 420, ground = H * 0.86;

  const { joints, scale, origin } = useMemo(() => {
    if (!d) return { joints: null, scale: 1, origin: { x: 0, y: 0 } };
    const period = 2.6;
    const u = (t % period) / period;
    const phase = d.hold ? 0.5 - 0.5 * Math.cos(2 * Math.PI * u) : u < 0.12 ? 0 : u < 0.5 ? 0.5 - 0.5 * Math.cos(Math.PI * ((u - 0.12) / 0.38)) : u < 0.58 ? 1 : 0.5 + 0.5 * Math.cos(Math.PI * ((u - 0.58) / 0.42));
    const j: Joints = lerpJoints(d.a, d.b, phase);
    // fit both keyframes in the viewport
    const pts = [d.a, d.b].flatMap((k) => [...Object.entries(k).filter(([n]) => n !== "far").map(([, v]) => v as { x: number; y: number }), ...Object.values(k.far ?? {})]);
    const minX = Math.min(...pts.map((p) => p.x)) - 0.08, maxX = Math.max(...pts.map((p) => p.x)) + 0.08;
    const maxY = Math.max(...pts.map((p) => p.y)) + 0.08;
    const sc = Math.min((W * 0.9) / (maxX - minX), (ground - 20) / maxY);
    const ox = W / 2 - ((minX + maxX) / 2) * sc;
    return { joints: j, scale: sc, origin: { x: ox, y: ground + 0.035 * sc } };
  }, [t, d]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-ink-2", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={label ? `Démonstration : ${label}` : "Démonstration indisponible"}>
        <defs>
          <radialGradient id="demo-glow" cx="0.5" cy="0.9" r="0.7">
            <stop offset="0" stopColor="rgb(212 255 58 / 0.08)" />
            <stop offset="1" stopColor="rgb(212 255 58 / 0)" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#demo-glow)" />
        <line x1={0} x2={W} y1={ground} y2={ground} stroke="rgb(242 239 232 / 0.12)" />
        {d?.prop === "wall" && <rect x={origin.x - 0.13 * scale} y={20} width={8} height={ground - 20} fill="rgb(242 239 232 / 0.1)" />}
        {d?.prop === "chair" && demo === "chair-squat" && (
          <g fill="none" stroke="rgb(242 239 232 / 0.22)" strokeWidth={3}>
            <path d={`M ${origin.x - 0.32 * scale} ${ground} V ${ground - 0.45 * scale} M ${origin.x - 0.32 * scale} ${ground - 0.4 * scale} H ${origin.x - 0.08 * scale} V ${ground}`} />
          </g>
        )}
        {d?.prop === "chair" && demo === "chair-dip" && (
          <g fill="none" stroke="rgb(242 239 232 / 0.22)" strokeWidth={3}>
            <path d={`M ${origin.x - 0.3 * scale} ${ground} V ${ground - 0.42 * scale} H ${origin.x - 0.04 * scale} V ${ground} M ${origin.x - 0.3 * scale} ${ground - 0.42 * scale} V ${ground - 0.85 * scale}`} />
          </g>
        )}
        {d?.prop === "sofa" && joints && (
          <rect x={origin.x + joints.wrist.x * scale - 30} y={origin.y - joints.wrist.y * scale} width={W} height={ground} rx={10} fill="rgb(242 239 232 / 0.07)" />
        )}
        {joints && <Athlete joints={joints} origin={origin} scale={scale} skeleton={skeleton} />}
        {!joints && <text x={W / 2} y={H / 2} textAnchor="middle" fill="var(--color-mute)" fontFamily="var(--font-mono)" fontSize={14}>Démonstration à venir — suis les instructions</text>}
      </svg>
    </div>
  );
}
