"use client";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TrainingScene } from "@/components/figure/TrainingScene";
import { useClock } from "@/components/figure/useClock";
import { ButtonLink } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { exampleAnalysis, HERO_SQUAT } from "@/lib/analysis/example";
import { cn } from "@/lib/cn";

const STEPS = ["Mouvement filmé", "Articulations détectées", "Observation", "Exercice proposé"];
const STEP_S = 3.4;

export function Hero() {
  const { t, ref } = useClock(true);
  const stage = Math.floor(t / STEP_S) % 4;
  const within = (t % STEP_S) / STEP_S;
  const r = useMemo(() => exampleAnalysis("hero"), []);
  const lean = r.observations.find((o) => o.id === "squat_lean");
  const depth = r.summary.avgMinAngle;

  return (
    <section className="relative isolate overflow-hidden pt-16" aria-labelledby="hero-title">
      <div className="wrap grid items-end gap-10 pb-12 pt-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-16 lg:pt-10">
        {/* copy */}
        <div className="order-2 lg:order-1 lg:pb-6">
          <p className="eyebrow mb-6 flex items-center gap-3"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-volt" />Musculation à la maison · analyse vidéo</p>
          <h1 id="hero-title" className="display !leading-[0.9] text-[13.2vw] sm:text-[96px] lg:text-[clamp(72px,6.7vw,124px)]">
            Ton corps.<br />Ton coach.<br /><span className="text-volt">Ton évolution.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-bone/75 sm:text-xl">
            Une IA qui t’aide à analyser tes mouvements et à t’entraîner efficacement, directement depuis chez toi.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/analyser" size="lg" arrow>Analyser mon mouvement</ButtonLink>
            <ButtonLink href="#demo" size="lg" variant="outline">Voir une démonstration</ButtonLink>
          </div>
          <p className="mt-5 text-sm text-mute">Gratuit pour ta première analyse · sans carte bancaire · ta vidéo reste sur ton appareil</p>
        </div>

        {/* visual */}
        <div ref={ref} className="order-1 lg:order-2">
          <div className="relative -mx-[var(--gutter)] sm:mx-0">
            <TrainingScene exercise="squat" squat={HERO_SQUAT} ratio="portrait" skeleton={stage >= 1} skeletonOpacity={stage >= 1 ? 1 : 0} showAngle={stage >= 2} className="aspect-[4/5] max-h-[78dvh] w-full sm:rounded-[28px]">
              {/* top bar */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-5 sm:top-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur">
                  <span className={cn("h-2 w-2 rounded-full", stage === 0 ? "animate-pulse bg-flare" : "bg-volt")} />
                  {stage === 0 ? "Enregistrement" : "Squat détecté · profil"}
                </span>
                <DemoBadge>Exemple</DemoBadge>
              </div>
              {/* overlay cards */}
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                <AnimatePresence mode="wait">
                  {stage === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.45 }} className="max-w-[300px] rounded-2xl border border-line bg-ink/80 p-4 backdrop-blur-md">
                      <p className="eyebrow mb-2">Repères articulaires</p>
                      <p className="text-sm text-bone/85">33 points suivis image par image : épaules, hanches, genoux, chevilles…</p>
                    </motion.div>
                  )}
                  {stage === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.45 }} className="max-w-[340px] rounded-2xl border border-flare/40 bg-ink/85 p-4 backdrop-blur-md">
                      <p className="eyebrow mb-2 !text-flare">À travailler</p>
                      <p className="font-semibold">{lean?.title ?? "Observation"}</p>
                      <p className="mt-1 font-mono text-xs text-bone/70">{lean?.evidence}</p>
                    </motion.div>
                  )}
                  {stage === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.45 }} className="max-w-[340px] rounded-2xl border border-volt/40 bg-ink/85 p-4 backdrop-blur-md">
                      <p className="eyebrow mb-2 !text-volt">Exercice proposé</p>
                      <p className="font-semibold">{lean?.drill?.name}</p>
                      <p className="mt-1 text-sm text-bone/75">{lean?.drill?.how}</p>
                    </motion.div>
                  )}
                  {stage === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/70">
                      <span className="rounded bg-ink/70 px-2 py-1 backdrop-blur">00:{String(Math.floor(within * 9) + 3).padStart(2, "0")}</span>
                      <span className="rounded bg-ink/70 px-2 py-1 backdrop-blur">1080p · 30 i/s</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {stage >= 2 && depth && (
                <div className="absolute right-4 top-16 hidden rounded-xl border border-line bg-ink/75 px-3 py-2 font-mono text-[11px] text-bone/80 backdrop-blur sm:right-5 sm:block">
                  <div className="text-mute">RÉPÉTITIONS</div>
                  <div className="text-xl font-semibold text-bone tabular">{r.summary.repCount}</div>
                  <div className="mt-1 text-mute">GENOU · POINT BAS</div>
                  <div className="text-xl font-semibold text-volt tabular">{Math.round(depth)}°</div>
                </div>
              )}
            </TrainingScene>
          </div>
          {/* stepper */}
          <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Étapes de l'analyse">
            {STEPS.map((s, i) => (
              <li key={s} className="min-w-0">
                <div className="h-[2px] overflow-hidden rounded bg-line">
                  <div className="h-full bg-volt" style={{ width: i < stage ? "100%" : i === stage ? `${within * 100}%` : "0%" }} />
                </div>
                <p className={cn("mt-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]", i === stage ? "text-bone" : "text-mute")}>
                  <span className="text-volt">0{i + 1}</span> <span className="hidden sm:inline">{s}</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-mute sm:hidden">{STEPS[stage]}</p>
        </div>
      </div>
    </section>
  );
}
