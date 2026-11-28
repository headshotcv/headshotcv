"use client";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { AnalysisResult, PoseFrame } from "@/lib/analysis/types";
import { SKELETON, sideIdx } from "@/lib/analysis/landmarks";
import { cn } from "@/lib/cn";

export interface PoseReplayHandle { seek: (t: number) => void }

/** The user's own video with the detected landmarks drawn on top, frame-synced. */
export const PoseReplay = forwardRef<PoseReplayHandle, { blob: Blob; frames: PoseFrame[]; result: AnalysisResult; className?: string }>(function PoseReplay({ blob, frames, result, className }, ref) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [overlay, setOverlay] = useState(true);
  const [t, setT] = useState(0);
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  useImperativeHandle(ref, () => ({ seek: (s: number) => { if (video.current) { video.current.currentTime = s; video.current.pause(); } } }), []);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const v = video.current, c = canvas.current;
      if (v && c) {
        const w = v.clientWidth, h = v.clientHeight;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
        const ctx = c.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        setT(v.currentTime);
        if (overlay && v.videoWidth) {
          // object-contain mapping
          const s = Math.min(w / v.videoWidth, h / v.videoHeight);
          const dw = v.videoWidth * s, dh = v.videoHeight * s, ox = (w - dw) / 2, oy = (h - dh) / 2;
          let best = frames[0], bd = Infinity;
          for (const f of frames) { const d = Math.abs(f.t - v.currentTime); if (d < bd) { bd = d; best = f; } }
          const lm = best?.landmarks;
          if (lm && bd < 0.2) {
            const P = (i: number) => [ox + lm[i].x * dw, oy + lm[i].y * dh] as const;
            ctx.lineWidth = 2.5; ctx.lineCap = "round";
            for (const [a, b] of SKELETON) {
              if (lm[a].visibility < 0.4 || lm[b].visibility < 0.4) continue;
              ctx.strokeStyle = "rgba(212,255,58,0.9)";
              ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke();
            }
            const j = sideIdx(result.side);
            const key: number[] = result.exercise === "pushup" ? [j.shoulder, j.elbow, j.wrist] : [j.hip, j.knee, j.ankle];
            for (let i = 11; i < 33; i++) {
              if (lm[i].visibility < 0.4) continue;
              const [x, y] = P(i);
              ctx.fillStyle = key.includes(i) ? "#f2efe8" : "#d4ff3a";
              ctx.beginPath(); ctx.arc(x, y, key.includes(i) ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
            }
            const pt = result.series.reduce((b, p) => (Math.abs(p.t - v.currentTime) < Math.abs(b.t - v.currentTime) ? p : b), result.series[0]);
            if (pt?.angle != null) {
              const [x, y] = P(key[1]);
              ctx.font = "600 13px 'JetBrains Mono Variable', monospace";
              const label = `${Math.round(pt.angle)}°`;
              ctx.fillStyle = "rgba(11,12,11,0.85)"; ctx.fillRect(x + 12, y - 12, ctx.measureText(label).width + 12, 22);
              ctx.fillStyle = "#d4ff3a"; ctx.fillText(label, x + 18, y + 4);
            }
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frames, overlay, result]);

  const rep = result.reps.find((r) => t >= r.start && t <= r.end);
  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-line bg-black", className)}>
      <div className="relative">
        <video ref={video} src={url} playsInline muted controls className="max-h-[70dvh] w-full bg-black object-contain" />
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        {rep && <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-volt">Rép. {rep.index}/{result.reps.length}</span>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line bg-ink-2 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} className="accent-[var(--color-volt)]" /> Afficher les repères
        </label>
        <span className="font-mono text-xs text-mute">Vidéo lue sur ton appareil</span>
      </div>
    </div>
  );
});
