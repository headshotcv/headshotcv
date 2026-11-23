"use client";
import type { JointName, Joints } from "@/lib/analysis/synthetic";

type V = { x: number; y: number };

export interface AthleteProps {
  joints: Joints;
  /** maps model coords (frame-height units, y up) to svg coords */
  origin: V;
  scale: number;
  facing?: 1 | -1;
  skeleton?: boolean;
  skeletonOpacity?: number;
  body?: boolean;
  highlight?: "knee" | "elbow" | "hip" | null;
  angleLabel?: string;
  accent?: string;
}

const W = { thigh: 0.092, shin: 0.064, upper: 0.06, fore: 0.05, torso: 0.13, foot: 0.034, neck: 0.055 };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function project(v: V, origin: V, scale: number, facing: 1 | -1 = 1): V {
  return { x: r2(origin.x + facing * v.x * scale), y: r2(origin.y - v.y * scale) };
}

function arcPath(c: V, a: V, b: V, r: number) {
  const a1 = Math.atan2(a.y - c.y, a.x - c.x);
  const a2 = Math.atan2(b.y - c.y, b.x - c.x);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const p1 = { x: c.x + r * Math.cos(a1), y: c.y + r * Math.sin(a1) };
  const p2 = { x: c.x + r * Math.cos(a1 + d), y: c.y + r * Math.sin(a1 + d) };
  return `M ${r2(p1.x)} ${r2(p1.y)} A ${r2(r)} ${r2(r)} 0 0 ${d > 0 ? 1 : 0} ${r2(p2.x)} ${r2(p2.y)}`;
}

/** Original stylised athlete: volumetric silhouette + optional pose-estimation overlay. */
export function Athlete({ joints, origin, scale, facing = 1, skeleton = false, skeletonOpacity = 1, body = true, highlight = null, angleLabel, accent = "var(--color-volt)" }: AthleteProps) {
  const P = (v: V) => project(v, origin, scale, facing);
  const j = Object.fromEntries(Object.entries(joints).filter(([k]) => k !== "far").map(([k, v]) => [k, P(v as V)])) as Record<JointName, V>;
  const far = (v: V): V => ({ x: r2(v.x - facing * 0.012 * scale), y: r2(v.y - 0.004 * scale) });
  const F = joints.far ?? {};
  const fj = (k: "elbow" | "wrist" | "knee" | "ankle" | "heel" | "toe") => (F[k] ? P(F[k]!) : far(j[k]));
  const s = (w: number) => r2(w * scale);
  const head = { x: r2(j.nose.x - facing * 0.02 * scale), y: r2(j.nose.y - 0.005 * scale) };
  const id = `g${Math.round(origin.x)}${Math.round(origin.y)}`;

  const limb = (a: V, b: V, w: number, fill: string) => <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={fill} strokeWidth={s(w)} strokeLinecap="round" />;

  const hl = highlight === "knee" ? [j.hip, j.knee, j.ankle] : highlight === "elbow" ? [j.shoulder, j.elbow, j.wrist] : highlight === "hip" ? [j.shoulder, j.hip, j.ankle] : null;

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#262622" />
          <stop offset="0.6" stopColor="#3a3a34" />
          <stop offset="1" stopColor="#6b6a60" />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" x2="1">
          <stop offset="0" stopColor="#141412" />
          <stop offset="1" stopColor="#24241f" />
        </linearGradient>
      </defs>
      {body && (
        <g>
          {/* far side */}
          {limb(far(j.hip), fj("knee"), W.thigh, `url(#${id}-far)`)}
          {limb(fj("knee"), fj("ankle"), W.shin, `url(#${id}-far)`)}
          {limb(fj("heel"), fj("toe"), W.foot, "#121311")}
          {limb(far(j.shoulder), fj("elbow"), W.upper, `url(#${id}-far)`)}
          {limb(fj("elbow"), fj("wrist"), W.fore, `url(#${id}-far)`)}
          {/* torso + head */}
          {limb(j.shoulder, j.hip, W.torso, `url(#${id}-skin)`)}
          {limb(j.shoulder, head, W.neck, `url(#${id}-skin)`)}
          <circle cx={head.x} cy={head.y} r={s(0.056)} fill={`url(#${id}-skin)`} />
          {/* volumes: glutes, chest, calf, shoulder */}
          {(() => {
            const ang = (a: V, b: V) => r2((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
            const mid = (a: V, b: V, f: number): V => ({ x: r2(a.x + (b.x - a.x) * f), y: r2(a.y + (b.y - a.y) * f) });
            const tor = ang(j.hip, j.shoulder);
            const shin = ang(j.knee, j.ankle);
            const glute = mid(j.hip, j.shoulder, 0.08);
            const chest = mid(j.hip, j.shoulder, 0.78);
            const calf = mid(j.knee, j.ankle, 0.3);
            const n = (deg: number, d: number): V => ({ x: r2(Math.cos(((deg - 90) * Math.PI) / 180) * d), y: r2(Math.sin(((deg - 90) * Math.PI) / 180) * d) });
            const gOff = n(tor, -s(0.03) * facing);
            const cOff = n(tor, s(0.03) * facing);
            const kOff = n(shin, -s(0.016) * facing);
            return (
              <g fill={`url(#${id}-skin)`}>
                <ellipse cx={glute.x + gOff.x} cy={glute.y + gOff.y} rx={s(0.075)} ry={s(0.062)} transform={`rotate(${tor} ${glute.x + gOff.x} ${glute.y + gOff.y})`} />
                <ellipse cx={chest.x + cOff.x} cy={chest.y + cOff.y} rx={s(0.07)} ry={s(0.062)} transform={`rotate(${tor} ${chest.x + cOff.x} ${chest.y + cOff.y})`} />
                <ellipse cx={calf.x + kOff.x} cy={calf.y + kOff.y} rx={s(0.06)} ry={s(0.037)} transform={`rotate(${shin} ${calf.x + kOff.x} ${calf.y + kOff.y})`} />
                <circle cx={j.shoulder.x} cy={j.shoulder.y} r={s(0.045)} />
              </g>
            );
          })()}
          {/* near side */}
          {limb(j.hip, j.knee, W.thigh, `url(#${id}-skin)`)}
          {limb(j.knee, j.ankle, W.shin, `url(#${id}-skin)`)}
          {limb(j.heel, j.toe, W.foot, "#2a2b27")}
          {limb(j.shoulder, j.elbow, W.upper, `url(#${id}-skin)`)}
          {limb(j.elbow, j.wrist, W.fore, `url(#${id}-skin)`)}
          {/* rim light */}
          <g stroke="rgb(255 244 222 / 0.35)" strokeWidth={Math.max(1.5, s(0.007))} fill="none" strokeLinecap="round">
            {([["shoulder", "elbow", W.upper], ["elbow", "wrist", W.fore], ["hip", "knee", W.thigh], ["knee", "ankle", W.shin], ["hip", "shoulder", W.torso]] as const).map(([a, b, w]) => {
              const A = j[a], B = j[b];
              const L = Math.hypot(B.x - A.x, B.y - A.y) || 1;
              // light comes from the upper-left window: offset towards the light
              const nx = -(B.y - A.y) / L, ny = (B.x - A.x) / L;
              const sgn = nx * -1 + ny * -1 > 0 ? 1 : -1;
              const o = (s(w) / 2) * 0.82 * sgn;
              return <line key={a + b} x1={r2(A.x + nx * o)} y1={r2(A.y + ny * o)} x2={r2(B.x + nx * o)} y2={r2(B.y + ny * o)} />;
            })}
            <circle cx={head.x} cy={head.y} r={s(0.052)} strokeDasharray={`${s(0.09)} ${s(0.4)}`} transform={`rotate(180 ${head.x} ${head.y})`} />
          </g>
        </g>
      )}
      {skeleton && (
        <g opacity={skeletonOpacity} style={{ transition: "opacity .5s" }}>
          <g stroke={accent} strokeWidth={Math.max(1.2, s(0.006))} strokeLinecap="round" opacity={0.9}>
            {[["shoulder", "elbow"], ["elbow", "wrist"], ["shoulder", "hip"], ["hip", "knee"], ["knee", "ankle"], ["ankle", "heel"], ["heel", "toe"], ["ankle", "toe"], ["shoulder", "nose"]].map(([a, b]) => (
              <line key={a + b} x1={j[a as JointName].x} y1={j[a as JointName].y} x2={j[b as JointName].x} y2={j[b as JointName].y} />
            ))}
          </g>
          {(["nose", "shoulder", "elbow", "wrist", "hip", "knee", "ankle", "toe"] as const).map((k) => (
            <g key={k}>
              <circle cx={j[k].x} cy={j[k].y} r={Math.max(4, s(0.016))} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.6} />
              <circle cx={j[k].x} cy={j[k].y} r={Math.max(2, s(0.007))} fill={accent} />
            </g>
          ))}
          {hl && (
            <g>
              <path d={arcPath(hl[1], hl[0], hl[2], s(0.06))} fill="none" stroke="var(--color-bone)" strokeWidth={2} />
              {angleLabel && (
                <g transform={`translate(${hl[1].x + facing * s(0.08)}, ${hl[1].y - s(0.02)})`}>
                  <rect x={facing === 1 ? 0 : -s(0.17)} y={-s(0.035)} width={s(0.17)} height={s(0.06)} rx={4} fill="var(--color-ink)" stroke={accent} strokeWidth={1} />
                  <text x={facing === 1 ? s(0.085) : -s(0.085)} y={s(0.008)} textAnchor="middle" fill={accent} fontFamily="var(--font-mono)" fontSize={Math.max(10, s(0.032))} fontWeight={600}>{angleLabel}</text>
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
}
