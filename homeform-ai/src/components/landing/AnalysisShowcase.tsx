"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { TrainingScene } from "@/components/figure/TrainingScene";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { AngleChart } from "@/components/analysis/AngleChart";
import { ObservationCard, QualityList, SummaryGrid } from "@/components/analysis/ReportView";
import { exampleAnalysis, SHOWCASE_DEPTHS, SHOWCASE_SQUAT } from "@/lib/analysis/example";
import { cn } from "@/lib/cn";

const TEMPO = { top: 0.6, down: 1.3, bottom: 0.25, up: 1.0 };

export function AnalysisShowcase() {
  const r = useMemo(() => exampleAnalysis("showcase"), []);
  const dur = r.meta.duration;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tab, setTab] = useState<"obs" | "quality">("obs");
  const last = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    last.current = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      setT((x) => (x + dt >= dur ? 0 : x + dt));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, dur]);
  const seek = (s: number) => { setT(s); setPlaying(false); };
  const currentRep = r.reps.find((x) => t >= x.start && t <= x.end);

  return (
    <section id="analyse" className="border-t border-line py-24 sm:py-32" aria-labelledby="an-title">
      <div className="wrap">
        <SectionHead index="03" eyebrow="L'analyse" title={<span id="an-title">Ce que l’IA voit.<br /><span className="text-bone/40">Et seulement ce qu’elle voit.</span></span>} intro="Chaque retour s’appuie sur une mesure : un angle, une durée, une répétition précise. Quand la vidéo ne permet pas de conclure, le rapport le dit." />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* player */}
          <div className="overflow-hidden rounded-[24px] border border-line bg-ink-2 lg:sticky lg:top-24">
            <TrainingScene exercise="squat" squat={SHOWCASE_SQUAT} depthPerRep={SHOWCASE_DEPTHS} reps={6} tempo={TEMPO} frozenAt={t} skeleton showAngle ratio="landscape" variant="living" className="aspect-video">
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="rounded-full bg-ink/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-volt backdrop-blur">Squat · profil</span>
                {currentRep && <span className="rounded-full bg-ink/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur">Rép. {currentRep.index}/{r.summary.repCount}</span>}
              </div>
              <DemoBadge className="absolute right-4 top-4">Séquence de démonstration</DemoBadge>
            </TrainingScene>
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Lecture"} className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bone text-ink">
                  {playing ? <svg viewBox="0 0 12 12" className="h-3 w-3"><rect x="2" y="1" width="3" height="10" fill="currentColor" /><rect x="7" y="1" width="3" height="10" fill="currentColor" /></svg> : <svg viewBox="0 0 12 12" className="ml-0.5 h-3 w-3"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>}
                </button>
                <div className="relative h-10 flex-1">
                  <input type="range" min={0} max={dur} step={0.05} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Position dans la vidéo" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-line" />
                  <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded bg-volt" style={{ width: `${(t / dur) * 100}%` }} />
                  {r.observations.flatMap((o) => o.moments.map((m) => ({ m, kind: o.kind, id: o.id }))).map(({ m, kind, id }) => (
                    <span key={id + m} className={cn("absolute top-1/2 h-3 w-[3px] -translate-y-1/2 rounded", kind === "improve" ? "bg-flare" : "bg-bone/50")} style={{ left: `${(m / dur) * 100}%` }} />
                  ))}
                </div>
                <span className="w-12 text-right font-mono text-xs text-mute tabular">{t.toFixed(1)}s</span>
              </div>
              <div className="mt-5"><AngleChart result={r} current={t} onSeek={seek} height={120} /></div>
            </div>
          </div>

          {/* report */}
          <div className="flex flex-col gap-4">
            <SummaryGrid result={r} />
            <div className="flex gap-1 rounded-full border border-line p-1 text-sm" role="tablist">
              {([["obs", "Observations"], ["quality", "Qualité vidéo"]] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("focus-ring flex-1 rounded-full py-2 transition-colors", tab === k ? "bg-bone text-ink" : "text-bone/70")}>{l}</button>
              ))}
            </div>
            {tab === "obs" ? (
              <div className="space-y-3">
                {r.observations.slice(0, 3).map((o) => <ObservationCard key={o.id} o={o} onSeek={seek} />)}
              </div>
            ) : (
              <QualityList result={r} />
            )}
            <p className="text-xs leading-relaxed text-mute">Angles estimés en 2D. HOMEFORM ne détecte pas de blessure et ne pose aucun diagnostic. Seuils indicatifs en cours de validation avec des professionnels qualifiés.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
