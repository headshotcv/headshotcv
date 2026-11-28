"use client";
import { useCallback, useRef, useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { PoseVideo, type PoseVideoHandle } from "@/components/media/PoseVideo";
import { usePoseTrack } from "@/components/media/usePoseTrack";
import { AngleChart } from "@/components/analysis/AngleChart";
import { ObservationCard, QualityList, SummaryGrid } from "@/components/analysis/ReportView";
import { cn } from "@/lib/cn";

const CLIPS = [
  { key: "livingPushups" as const, label: "Pompes · salon · profil", pos: "55% 50%" },
  { key: "loftSquats" as const, label: "Squat · loft · face", pos: "50% 50%" },
];

export function AnalysisShowcase() {
  const [ci, setCi] = useState(0);
  const clip = CLIPS[ci];
  const track = usePoseTrack(clip.key);
  const r = track?.result;
  const player = useRef<PoseVideoHandle>(null);
  const [t, setT] = useState(0);
  const [tab, setTab] = useState<"obs" | "quality">("obs");
  const lastSet = useRef(0);
  const onFrame = useCallback((time: number) => {
    const now = performance.now();
    if (now - lastSet.current > 80) { lastSet.current = now; setT(time); }
  }, []);
  const seek = (s: number) => player.current?.seek(s);
  const dur = r?.meta.duration ?? 1;
  const currentRep = r?.reps.find((x) => t >= x.start && t <= x.end);

  return (
    <section id="analyse" className="relative py-24 sm:py-32" aria-labelledby="an-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(212,255,58,0.08),transparent_60%)]" />
      <div className="wrap">
        <SectionHead index="03" eyebrow="L'analyse" title={<span id="an-title">Ce que l’IA voit.<br /><span className="text-bone/40">Et seulement ce qu’elle voit.</span></span>} intro="Ci-dessous, de vraies vidéos passées dans le moteur HOMEFORM. Chaque retour s’appuie sur une mesure : un angle, une durée, une répétition précise. Quand la vidéo ne permet pas de conclure, le rapport le dit." />

        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Vidéo analysée">
          {CLIPS.map((c, i) => (
            <button key={c.key} role="tab" aria-selected={ci === i} onClick={() => { setCi(i); setT(0); }} className={cn("focus-ring rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors", ci === i ? "border-volt bg-volt text-ink" : "border-line text-bone/70 hover:border-bone/40")}>{c.label}</button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div className="overflow-hidden rounded-[26px] border border-line bg-ink-2 lg:sticky lg:top-24">
            <PoseVideo key={clip.key} ref={player} clip={clip.key} objectPosition={clip.pos} onFrame={onFrame} className="aspect-video">
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-ink/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-volt backdrop-blur">{r?.exercise === "squat" ? "Squat" : "Pompes"} · {r?.view ?? "…"}</span>
                {currentRep && <span className="rounded-full bg-ink/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur">Rép. {currentRep.index}/{r?.summary.repCount}</span>}
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70 backdrop-blur">Vidéo réelle · analyse réelle</span>
            </PoseVideo>
            <div className="p-4 sm:p-5">
              <div className="relative h-8">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-line" />
                <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded bg-volt" style={{ width: `${(t / dur) * 100}%` }} />
                {r?.reps.map((rep) => (
                  <button key={rep.index} onClick={() => seek(Math.max(0, rep.bottom - 0.6))} aria-label={`Aller à la répétition ${rep.index}`} className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${(rep.bottom / dur) * 100}%` }}>
                    <span className="mx-auto block h-3 w-3 rounded-full border-2 border-volt bg-ink" />
                  </button>
                ))}
              </div>
              {r && <div className="mt-3"><AngleChart result={r} current={t} onSeek={(s) => seek(Math.max(0, s - 0.6))} height={110} /></div>}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r ? (
              <>
                <SummaryGrid result={r} />
                {r.status === "uncertain" && <p className="rounded-2xl border border-amber-300/40 bg-amber-300/[0.06] p-3 text-sm text-amber-100">Fiabilité réduite : vidéo filmée de face. Le rapport le signale au lieu de l’ignorer.</p>}
                <div className="flex gap-1 rounded-full border border-line p-1 text-sm" role="tablist">
                  {([["obs", "Observations"], ["quality", "Qualité vidéo"]] as const).map(([k, l]) => (
                    <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("focus-ring flex-1 rounded-full py-2 transition-colors", tab === k ? "bg-bone text-ink" : "text-bone/70")}>{l}</button>
                  ))}
                </div>
                {tab === "obs" ? <div className="space-y-3">{r.observations.slice(0, 3).map((o, i) => <ObservationCard key={o.id} o={o} first={i === 0} onSeek={(s) => seek(Math.max(0, s - 0.6))} />)}</div> : <QualityList result={r} />}
              </>
            ) : <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />}
            <p className="text-xs leading-relaxed text-mute">Angles estimés en 2D. HOMEFORM ne détecte pas de blessure et ne pose aucun diagnostic. Seuils indicatifs en cours de validation avec des professionnels qualifiés. Vidéos : Mixkit.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
