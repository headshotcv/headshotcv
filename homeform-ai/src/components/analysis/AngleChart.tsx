"use client";
import type { AnalysisResult } from "@/lib/analysis/types";

/** Primary joint angle over time with rep bottoms marked. Clicking a marker seeks. */
export function AngleChart({ result, current, onSeek, height = 140 }: { result: AnalysisResult; current?: number; onSeek?: (t: number) => void; height?: number }) {
  const pts = result.series.filter((p) => p.angle !== null) as { t: number; angle: number }[];
  if (pts.length < 2) return null;
  const W = 600, H = height, pad = 6;
  const tMax = result.meta.duration || pts[pts.length - 1].t;
  const aMin = Math.min(...pts.map((p) => p.angle)) - 5, aMax = Math.max(...pts.map((p) => p.angle)) + 5;
  const x = (t: number) => pad + (t / tMax) * (W - pad * 2);
  const y = (a: number) => pad + (1 - (a - aMin) / (aMax - aMin)) * (H - pad * 2 - 14);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.angle).toFixed(1)}`).join(" ");
  const label = result.exercise === "squat" ? "Angle du genou" : "Angle du coude";
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${label} au fil de la vidéo`}>
        {[aMin + 5, (aMin + aMax) / 2, aMax - 5].map((a) => (
          <g key={a}>
            <line x1={pad} x2={W - pad} y1={y(a)} y2={y(a)} stroke="rgb(242 239 232 / 0.07)" />
            <text x={W - pad} y={y(a) - 3} textAnchor="end" fontSize={10} fill="var(--color-mute)" fontFamily="var(--font-mono)">{Math.round(a)}°</text>
          </g>
        ))}
        {result.reps.map((r) => (
          <rect key={r.index} x={x(r.start)} width={Math.max(1, x(r.end) - x(r.start))} y={pad} height={H - pad * 2 - 14} fill="rgb(242 239 232 / 0.025)" />
        ))}
        <path d={d} fill="none" stroke="var(--color-volt)" strokeWidth={2} strokeLinejoin="round" />
        {result.reps.map((r) => (
          <g key={`m${r.index}`} className={onSeek ? "cursor-pointer" : ""} onClick={() => onSeek?.(r.bottom)}>
            <circle cx={x(r.bottom)} cy={y(r.minAngle)} r={9} fill="transparent" />
            <circle cx={x(r.bottom)} cy={y(r.minAngle)} r={4} fill="var(--color-ink)" stroke="var(--color-volt)" strokeWidth={2} />
            <text x={x(r.bottom)} y={H - 2} textAnchor="middle" fontSize={10} fill="var(--color-mute)" fontFamily="var(--font-mono)">R{r.index}</text>
          </g>
        ))}
        {current !== undefined && <line x1={x(current)} x2={x(current)} y1={pad} y2={H - 16} stroke="var(--color-bone)" strokeWidth={1.2} />}
      </svg>
      <figcaption className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{label} (°) · R = répétition, point = point bas</figcaption>
    </figure>
  );
}
