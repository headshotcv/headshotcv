"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionHead } from "@/components/ui/SectionHead";
import { TrainingScene } from "@/components/figure/TrainingScene";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { exampleAnalysis } from "@/lib/analysis/example";
import { cn } from "@/lib/cn";

const STEPS = [
  { title: "Filme ton mouvement", text: "Téléphone posé au sol à 2–3 m, de profil, corps entier dans le cadre. 3 à 10 répétitions suffisent." },
  { title: "Importe ta vidéo", text: "Depuis ta galerie ou directement depuis la caméra du navigateur. Rien à installer." },
  { title: "L'IA repère tes articulations", text: "33 points du corps sont estimés image par image, directement sur ton appareil. L'exercice est identifié et chaque répétition est découpée." },
  { title: "Reçois ton retour", text: "Amplitude, alignement, rythme, régularité : des observations mesurées, les moments clés de ta vidéo et des exercices adaptés." },
];

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[9/18.5] w-[min(300px,82vw)] rounded-[44px] border border-white/15 bg-black p-2.5 shadow-[0_40px_120px_-30px_rgba(212,255,58,0.18)]">
      <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-ink">{children}</div>
    </div>
  );
}

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const r = useMemo(() => exampleAnalysis("hero"), []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 4200);
    return () => clearInterval(id);
  }, [auto]);
  const [upload, setUpload] = useState(0);
  useEffect(() => {
    if (step !== 1) return;
    setUpload(0);
    const id = setInterval(() => setUpload((u) => Math.min(100, u + 4)), 80);
    return () => clearInterval(id);
  }, [step]);

  return (
    <section id="demo" className="border-t border-line py-24 sm:py-32" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead index="02" eyebrow="Comment ça marche" title={<span id="how-title">Quatre étapes.<br />Moins de deux minutes.</span>} />
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1fr_auto_1fr]">
          <ol className="space-y-2" role="tablist" aria-label="Étapes">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button role="tab" aria-selected={step === i} onClick={() => { setStep(i); setAuto(false); }} className={cn("focus-ring w-full rounded-2xl border p-5 text-left transition-colors", step === i ? "border-volt/40 bg-white/[0.03]" : "border-transparent hover:bg-white/[0.02]")}>
                  <div className="flex items-baseline gap-4">
                    <span className={cn("font-mono text-sm", step === i ? "text-volt" : "text-mute")}>0{i + 1}</span>
                    <span className="text-xl font-bold tracking-tight [font-stretch:85%]">{s.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {step === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-9 text-bone/70">
                        <span className="block pt-2 leading-relaxed">{s.text}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            ))}
          </ol>

          <Phone>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                {step === 0 && (
                  <TrainingScene exercise="squat" ratio="tall" className="h-full w-full">
                    <div className="absolute inset-6 top-14 rounded-[20px] border-2 border-dashed border-volt/50" />
                    <p className="absolute inset-x-0 top-16 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-volt">Corps entier dans le cadre</p>
                    <div className="absolute bottom-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-bone/80"><span className="h-10 w-10 animate-pulse rounded-full bg-flare" /></div>
                  </TrainingScene>
                )}
                {step === 1 && (
                  <div className="flex h-full flex-col justify-center gap-5 p-6">
                    <p className="eyebrow">Import</p>
                    <div className="rounded-2xl border border-line bg-ink-2 p-4">
                      <p className="font-semibold">squat_salon.mp4</p>
                      <p className="font-mono text-xs text-mute">00:16 · 1080p</p>
                      <div className="mt-4 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-volt transition-[width]" style={{ width: `${upload}%` }} /></div>
                      <p className="mt-2 font-mono text-[11px] text-mute">Lecture locale {upload}% · aucun envoi serveur</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <span className="rounded-xl border border-line py-3">Galerie</span>
                      <span className="rounded-xl border border-volt/50 py-3 text-volt">Caméra</span>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <TrainingScene exercise="squat" ratio="tall" skeleton showAngle className="h-full w-full">
                    <span className="absolute left-4 top-12 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-volt">Squat · 98 %</span>
                  </TrainingScene>
                )}
                {step === 3 && (
                  <div className="h-full space-y-3 overflow-hidden p-5 pt-12">
                    <div className="flex items-center justify-between"><p className="eyebrow">Rapport</p><DemoBadge /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-ink-2 p-3"><p className="font-mono text-[9px] uppercase text-mute">Répétitions</p><p className="text-2xl font-bold">{r.summary.repCount}</p></div>
                      <div className="rounded-xl bg-ink-2 p-3"><p className="font-mono text-[9px] uppercase text-mute">Genou bas</p><p className="text-2xl font-bold text-volt">{Math.round(r.summary.avgMinAngle ?? 0)}°</p></div>
                    </div>
                    {r.observations.slice(0, 2).map((o) => (
                      <div key={o.id} className="rounded-xl border border-line bg-ink-2 p-3">
                        <p className={cn("font-mono text-[9px] uppercase tracking-[0.12em]", o.kind === "improve" ? "text-flare" : "text-volt")}>{o.kind === "improve" ? "À travailler" : "Point fort"}</p>
                        <p className="mt-1 text-sm font-semibold leading-tight">{o.title}</p>
                        {o.drill && <p className="mt-2 text-[11px] text-bone/70">→ {o.drill.name}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Phone>

          <div className="hidden lg:block">
            <p className="display text-[180px] leading-none text-white/[0.04]">0{step + 1}</p>
            <p className="max-w-xs text-sm leading-relaxed text-mute">Les écrans ci-contre reprennent l’interface réelle. Les valeurs proviennent du moteur d’analyse appliqué à une séquence de démonstration.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
