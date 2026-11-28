"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { VideoLoop } from "./VideoLoop";
import { usePoseTrack, frameAt, angleAt, type PoseTrack } from "./usePoseTrack";
import { CLIPS, type ClipKey } from "./clips";
import { SKELETON, sideIdx } from "@/lib/analysis/landmarks";
import { cn } from "@/lib/cn";

export interface PoseVideoHandle { video: HTMLVideoElement | null; seek: (t: number) => void }

interface Props {
  clip: ClipKey;
  className?: string;
  eager?: boolean;
  objectPosition?: string;
  overlay?: boolean;
  showAngle?: boolean;
  onFrame?: (t: number, track: PoseTrack | null) => void;
  children?: React.ReactNode;
  /** horizontal flip of video + overlay (composition only) */
  mirror?: boolean;
  mediaClassName?: string;
}

/** Real video + the landmarks MediaPipe actually detected on it, drawn in sync. */
export const PoseVideo = forwardRef<PoseVideoHandle, Props>(function PoseVideo({ clip, className, eager, objectPosition = "50% 50%", overlay = true, showAngle = true, onFrame, children, mirror, mediaClassName }, ref) {
  const vRef = useRef<HTMLVideoElement | null>(null);
  const cRef = useRef<HTMLCanvasElement>(null);
  const track = usePoseTrack(CLIPS[clip].pose ? clip : null);
  useImperativeHandle(ref, () => ({ video: vRef.current, seek: (t: number) => { if (vRef.current) { vRef.current.currentTime = t; vRef.current.play().catch(() => {}); } } }), []);

  const draw = useCallback((t: number) => {
    onFrame?.(t, track);
    const v = vRef.current, c = cRef.current;
    if (!v || !c) return;
    const w = c.clientWidth, h = c.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!overlay || !track || !v.videoWidth) return;
    // object-fit: cover mapping with object-position
    const [px, py] = objectPosition.split(" ").map((s) => parseFloat(s) / 100);
    const s = Math.max(w / v.videoWidth, h / v.videoHeight);
    const dw = v.videoWidth * s, dh = v.videoHeight * s;
    const ox = (w - dw) * px, oy = (h - dh) * py;
    const lm = frameAt(track, t);
    if (!lm) return;
    const P = (i: number) => { const p = lm.get(i)!; return [ox + p[0] * dw, oy + p[1] * dh] as const; };
    const ok = (i: number) => (lm.get(i)?.[2] ?? 0) > 0.45;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(212,255,58,0.6)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(212,255,58,0.95)";
    ctx.lineWidth = Math.max(2, w / 500);
    for (const [a, b] of SKELETON) {
      if (!lm.has(a) || !lm.has(b) || !ok(a) || !ok(b)) continue;
      ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    const res = track.result;
    const j = sideIdx(res.side);
    const key: number[] = res.exercise === "squat" ? [j.hip, j.knee, j.ankle] : [j.shoulder, j.elbow, j.wrist];
    for (const [i] of lm) {
      if (i === 0 || !ok(i)) continue;
      const [x, y] = P(i);
      const isKey = res.exercise ? key.includes(i) : false;
      ctx.fillStyle = isKey ? "#f2efe8" : "#d4ff3a";
      ctx.beginPath(); ctx.arc(x, y, isKey ? 5.5 : 3.5, 0, Math.PI * 2); ctx.fill();
      if (isKey) { ctx.strokeStyle = "rgba(212,255,58,0.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (showAngle && res.exercise && ok(key[1])) {
      const a = angleAt(track, t);
      if (a !== null) {
        const [x, y] = P(key[1]);
        const label = `${Math.round(a)}°`;
        ctx.font = "600 14px 'JetBrains Mono Variable', monospace";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(11,12,11,0.85)";
        ctx.beginPath(); ctx.roundRect(x + 14, y - 26, tw + 16, 24, 6); ctx.fill();
        ctx.strokeStyle = "rgba(212,255,58,0.8)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#d4ff3a";
        if (mirror) { ctx.save(); ctx.translate(x + 22 + tw / 2, 0); ctx.scale(-1, 1); ctx.fillText(label, -tw / 2, y - 9); ctx.restore(); }
        else ctx.fillText(label, x + 22, y - 9);
      }
    }
  }, [track, overlay, objectPosition, showAngle, onFrame, mirror]);

  return (
    <div className={cn("relative overflow-hidden bg-ink-2", className)}>
      <div className={cn("absolute inset-0", mirror && "-scale-x-100", mediaClassName)}>
        <VideoLoop ref={vRef} clip={clip} eager={eager} objectPosition={objectPosition} onTime={draw} />
        <canvas ref={cRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      </div>
      {children}
    </div>
  );
});
