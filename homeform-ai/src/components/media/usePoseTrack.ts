"use client";
import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/types";
import { clipPose, type ClipKey } from "./clips";

export interface PoseTrack {
  keep: number[];
  meta: { width: number; height: number; duration: number };
  frames: [number, [number, number, number][] | null][];
  result: AnalysisResult;
}

const cache = new Map<string, Promise<PoseTrack>>();

export function usePoseTrack(clip: ClipKey | null) {
  const [track, setTrack] = useState<PoseTrack | null>(null);
  useEffect(() => {
    if (!clip) return;
    const url = clipPose(clip);
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.json()));
    let alive = true;
    cache.get(url)!.then((t) => { if (alive) setTrack(t); }).catch(() => {});
    return () => { alive = false; };
  }, [clip]);
  return track;
}

/** Nearest frame (binary search) → map of landmark index → [x, y, visibility]. */
export function frameAt(track: PoseTrack, t: number): Map<number, [number, number, number]> | null {
  const f = track.frames;
  let lo = 0, hi = f.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (f[m][0] < t) lo = m + 1; else hi = m; }
  const i = lo > 0 && Math.abs(f[lo - 1][0] - t) < Math.abs(f[lo][0] - t) ? lo - 1 : lo;
  const fr = f[i];
  if (!fr || !fr[1] || Math.abs(fr[0] - t) > 0.25) return null;
  const m = new Map<number, [number, number, number]>();
  track.keep.forEach((idx, k) => m.set(idx, fr[1]![k]));
  return m;
}

export function angleAt(track: PoseTrack, t: number): number | null {
  const s = track.result.series;
  if (!s.length) return null;
  let best = s[0];
  for (const p of s) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p;
  return Math.abs(best.t - t) < 0.3 ? best.angle : null;
}
