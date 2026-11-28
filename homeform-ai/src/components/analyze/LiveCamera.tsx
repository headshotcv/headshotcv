"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ExerciseId } from "@/lib/analysis/types";
import { LiveRepCounter, type LiveState } from "@/lib/analysis/live";
import { SKELETON } from "@/lib/analysis/landmarks";
import { detectLive, getLandmarker } from "@/lib/pose/runner";
import { cn } from "@/lib/cn";

export interface LiveCameraHandle { video: HTMLVideoElement | null; reset: () => void }

/**
 * Camera preview with the skeleton detected in real time and a live rep counter.
 * Runs on-device; nothing is sent anywhere.
 */
export const LiveCamera = forwardRef<LiveCameraHandle, { stream: MediaStream; exercise: ExerciseId; mirror?: boolean; className?: string; onState?: (s: LiveState) => void; children?: React.ReactNode }>(
  function LiveCamera({ stream, exercise, mirror, className, onState, children }, ref) {
    const video = useRef<HTMLVideoElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const counter = useRef<LiveRepCounter | null>(null);
    const t0 = useRef(0);
    const [state, setState] = useState<LiveState>({ angle: null, reps: 0, hint: "Chargement du modèle…", tracking: false });
    const [modelError, setModelError] = useState(false);
    useImperativeHandle(ref, () => ({ video: video.current, reset: () => { counter.current = null; } }), []);

    useEffect(() => {
      const v = video.current;
      if (!v) return;
      v.srcObject = stream;
      v.parentElement?.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      v.play().catch(() => {});
      let raf = 0, alive = true, lastRun = 0, lastUi = 0;
      getLandmarker().then((lmk) => {
        const loop = (now: number) => {
          if (!alive) return;
          raf = requestAnimationFrame(loop);
          if (now - lastRun < 45 || !v.videoWidth || v.readyState < 2) return; // ≈20 fps
          lastRun = now;
          if (!counter.current) { counter.current = new LiveRepCounter(exercise, v.videoWidth / v.videoHeight); t0.current = now; }
          const lm = detectLive(lmk, v);
          const s = counter.current.push((now - t0.current) / 1000, lm);
          // draw (object-cover mapping)
          const c = canvas.current;
          if (c) {
            const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
            if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
            const ctx = c.getContext("2d")!;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            if (lm) {
              const sc = Math.max(w / v.videoWidth, h / v.videoHeight);
              const dw = v.videoWidth * sc, dh = v.videoHeight * sc, ox = (w - dw) / 2, oy = (h - dh) / 2;
              const P = (i: number) => [ox + lm[i].x * dw, oy + lm[i].y * dh] as const;
              ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = s.tracking ? "rgba(212,255,58,.95)" : "rgba(242,239,232,.6)";
              for (const [a, b] of SKELETON) { if (lm[a].visibility < .45 || lm[b].visibility < .45) continue; ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke(); }
              ctx.fillStyle = "#d4ff3a";
              for (let i = 11; i < 33; i++) { if (lm[i].visibility < .45) continue; const [x, y] = P(i); ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
            }
          }
          if (now - lastUi > 120) { lastUi = now; setState(s); onState?.(s); }
        };
        raf = requestAnimationFrame(loop);
      }).catch(() => setModelError(true));
      return () => { alive = false; cancelAnimationFrame(raf); };
    }, [stream, exercise, onState]);

    return (
      <div className={cn("relative overflow-hidden bg-black", className)}>
        <div className={cn("absolute inset-0", mirror && "-scale-x-100")}>
          <video ref={video} playsInline muted autoPlay className="h-full w-full object-cover" />
          <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-right backdrop-blur" aria-live="polite">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70">Répétitions</p>
          <p className="display text-5xl tabular text-volt">{state.reps}</p>
          <p className="font-mono text-[11px] text-bone/80">{state.angle !== null ? `${Math.round(state.angle)}° ${exercise === "squat" ? "genou" : "coude"}` : "—"}</p>
        </div>
        {(state.hint || modelError) && (
          <p className="pointer-events-none absolute inset-x-3 top-24 mx-auto w-fit rounded-full bg-black/70 px-4 py-2 text-center text-sm text-bone backdrop-blur">
            {modelError ? "Le modèle n’a pas pu être chargé : l’enregistrement fonctionne, le comptage en direct est indisponible." : state.hint}
          </p>
        )}
        {children}
      </div>
    );
  });
