import type { Landmark } from "./types.ts";

export interface P { x: number; y: number }

/** Convert a normalised landmark into an aspect-correct 2D point (units of frame height). */
export function toPoint(l: Landmark, aspect: number): P {
  return { x: l.x * aspect, y: l.y };
}

/** Interior angle ABC in degrees (0..180). */
export function angle(a: P, b: P, c: P): number {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (n === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Angle of segment from→to relative to the horizontal, in degrees 0..90. */
export function inclinationFromHorizontal(from: P, to: P): number {
  const dx = Math.abs(to.x - from.x), dy = Math.abs(to.y - from.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Signed perpendicular deviation of point p from line a→c, expressed as the angle at p (180 = aligned).
 * Returns positive when p is BELOW the line in image space (larger y), negative when above.
 */
export function lineDeviation(a: P, p: P, c: P): number {
  const ang = angle(a, p, c);
  if (Number.isNaN(ang)) return NaN;
  // y of the line a→c at p.x
  const t = c.x === a.x ? 0.5 : (p.x - a.x) / (c.x - a.x);
  const yLine = a.y + t * (c.y - a.y);
  const sign = p.y > yLine ? 1 : -1;
  return sign * (180 - ang);
}

export function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function std(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function percentile(xs: number[], p: number): number {
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))));
  return s[i];
}
