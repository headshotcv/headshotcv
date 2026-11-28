"use client";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PoseVideo } from "@/components/media/PoseVideo";
import type { PoseTrack } from "@/components/media/usePoseTrack";
import { angleAt } from "@/components/media/usePoseTrack";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Live { t: number; reps: number; total: number; angle: number | null; inRep: boolean; spark: number[]; dur: number }

function Gauge({ value }: { value: number | null }) {
  // 40°..180° mapped on a 220° arc
  const v = value ?? 180;
  const f = Math.min(1, Math.max(0, (v - 40) / 140));
  const R = 34, C = 2 * Math.PI * R, arc = C * (220 / 360);
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 -rotate-[200deg]" aria-hidden>
      <circle cx="40" cy="40" r={R} fill="none" stroke="rgb(242 239 232 / 0.12)" strokeWidth="6" strokeDasharray={`${arc} ${C}`} strokeLinecap="round" />
      <circle cx="40" cy="40" r={R} fill="none" stroke="var(--color-volt)" strokeWidth="6" strokeDasharray={`${arc * f} ${C}`} strokeLinecap="round" style={{ transition: "stroke-dasharray .12s linear" }} />
    </svg>
  );
}

function Spark({ data }: { data: number[] }) {
  if (data.length < 2) return <div className="h-10" />;
  const W = 160, H = 40, min = 50, max = 180;
  const d = data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * W).toFixed(1)},${(H - ((v - min) / (max - min)) * H).toFixed(1)}`).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden><path d={d} fill="none" stroke="var(--color-volt)" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

const glass = "rounded-2xl border border-white/10 bg-ink/55 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,.7)]";

export function Hero() {
  const [live, setLive] = useState<Live>({ t: 0, reps: 0, total: 0, angle: null, inRep: false, spark: [], dur: 1 });
  const [result, setResult] = useState<PoseTrack["result"] | null>(null);
  const last = useRef(0);
  const onFrame = useCallback((t: number, track: PoseTrack | null) => {
    if (!track) return;
    const now = performance.now();
    if (now - last.current < 66) return; // ~15 updates/s is enough for widgets
    last.current = now;
    const r = track.result;
    if (!result) setResult(r);
    const reps = r.reps.filter((x) => x.end <= t).length;
    const inRep = r.reps.some((x) => t >= x.start && t <= x.end);
    const spark = r.series.filter((p) => p.angle !== null && p.t <= t && p.t > t - 4).map((p) => p.angle as number);
    setLive({ t, reps, total: r.reps.length, angle: angleAt(track, t), inRep, spark, dur: r.meta.duration });
  }, [result]);

  const improve = result?.observations.find((o) => o.kind === "improve");
  const strength = result?.observations.find((o) => o.kind === "strength");
  const showObs = result && result.reps[1] && live.t >= result.reps[1].end;
  const showStrength = result && result.reps[0] && live.t >= result.reps[0].end && !showObs;

  const toast = (
    <AnimatePresence mode="wait">
      {showObs && improve ? (
        <motion.div key="imp" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className={cn(glass, "border-flare/40 p-4")}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-flare">À travailler</p>
          <p className="mt-1 font-semibold">{improve.title}</p>
          <p className="mt-1 font-mono text-[11px] text-bone/70">{improve.evidence}</p>
          {improve.drill && <p className="mt-2 border-t border-white/10 pt-2 text-sm text-bone/85"><span className="text-volt">→ </span>{improve.drill.name}</p>}
        </motion.div>
      ) : showStrength && strength ? (
        <motion.div key="str" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.45 }} className={cn(glass, "border-volt/40 p-4")}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-volt">Point fort</p>
          <p className="mt-1 font-semibold">{strength.title}</p>
          <p className="mt-1 font-mono text-[11px] text-bone/70">{strength.evidence}</p>
        </motion.div>
      ) : (
        <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(glass, "flex items-center gap-3 p-4 text-sm text-bone/80")}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-volt" />Repérage de 33 points du corps, image par image…
        </motion.div>
      )}
    </AnimatePresence>
  );

  const widgets = (
    <>
      {/* status chip */}
      <div className={cn(glass, "absolute left-3 top-3 flex items-center gap-2 !rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] sm:left-auto sm:right-6 sm:top-24 sm:text-[11px]")}>
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-60" /><span className="relative h-2 w-2 rounded-full bg-volt" /></span>
        Pompes · profil {result ? `· ${Math.round(result.exerciseConfidence * 100)} %` : ""}
      </div>
      {/* rep counter + gauge */}
      <div className={cn(glass, "absolute right-3 top-3 flex items-center gap-2 p-2 sm:right-6 sm:top-40 sm:gap-3 sm:p-4")}>
        <div className="relative">
          <div className="scale-75 sm:scale-100"><Gauge value={live.angle} /></div>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold text-volt tabular">{live.angle !== null ? `${Math.round(live.angle)}°` : "—"}</span>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone/60">Répétitions</p>
          <p className="display text-3xl tabular sm:text-5xl">{String(live.reps).padStart(2, "0")}<span className="text-bone/30">/{String(live.total || 0).padStart(2, "0")}</span></p>
          <p className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-bone/60 sm:block">Angle du coude</p>
        </div>
      </div>
      {/* sparkline */}
      <div className={cn(glass, "absolute right-6 top-[19rem] hidden w-56 p-3 lg:block")}>
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-bone/60"><span>Coude · 4 dernières s</span><span className={live.inRep ? "text-volt" : ""}>{live.inRep ? "● rép." : "repos"}</span></div>
        <Spark data={live.spark} />
      </div>
      {/* observation toast */}
      <div className="hidden sm:absolute sm:bottom-28 sm:right-6 sm:block sm:w-[340px]">
        {toast}
      </div>
      {/* timeline */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full bg-volt" style={{ width: `${(live.t / live.dur) * 100}%` }} />
        {result?.reps.map((r) => <span key={r.index} className="absolute -top-1 h-3 w-[3px] rounded bg-bone" style={{ left: `${(r.bottom / live.dur) * 100}%` }} />)}
      </div>
    </>
  );

  return (
    <section className="relative isolate overflow-hidden bg-ink pt-16 lg:pt-0" aria-labelledby="hero-title">
      {/* Desktop: full-bleed video */}
      <div className="relative lg:h-[100svh] lg:min-h-[720px]">
        <PoseVideo clip="livingPushups" eager mirror objectPosition="50% 50%" onFrame={onFrame} mediaClassName="lg:[mask-image:linear-gradient(to_left,transparent,black_28%)]" className="relative aspect-video w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[78%] lg:bg-ink">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" />
          {widgets}
        </PoseVideo>
        <div className="wrap relative z-10 -mt-3 sm:hidden">{toast}</div>

        <div className="wrap relative z-10 lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="max-w-2xl pb-10 pt-8 lg:pb-0 lg:pt-16">
            <p className="eyebrow mb-5 flex items-center gap-3 !text-bone/70"><span className="h-px w-8 bg-volt" />Coach de musculation à la maison · analyse vidéo IA</p>
            <h1 id="hero-title" className="display !leading-[0.88] text-[14vw] sm:text-[88px] lg:text-[clamp(84px,7.4vw,138px)]">
              Ton corps.<br />Ton coach.<br /><span className="text-volt">Ton évolution.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone/80 sm:text-xl">Une IA qui t’aide à analyser tes mouvements et à t’entraîner efficacement, directement depuis chez toi.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/analyser" size="lg" arrow>Analyser mon mouvement</ButtonLink>
              <ButtonLink href="#demo" size="lg" variant="outline" className="backdrop-blur">Voir une démonstration</ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-bone/60">
              <span>✓ 1re analyse gratuite</span><span>✓ Sans carte bancaire</span><span>✓ Vidéo traitée sur ton téléphone</span>
            </div>
          </div>
        </div>
      </div>
      <p className="wrap pb-3 text-[11px] text-mute lg:absolute lg:bottom-4 lg:left-0 lg:pb-0">Vidéo réelle (Mixkit) analysée par le moteur HOMEFORM : repères, angles et observation sont ceux calculés sur cette vidéo.</p>
    </section>
  );
}
