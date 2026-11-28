"use client";
import { useRef } from "react";
import type { AnalysisResult, PoseFrame } from "@/lib/analysis/types";
import { AngleChart } from "@/components/analysis/AngleChart";
import { EXERCISE_LABEL, Limitations, ObservationCard, QualityList, RepTable, SummaryGrid } from "@/components/analysis/ReportView";
import { PoseReplay, type PoseReplayHandle } from "./PoseReplay";
import { cn } from "@/lib/cn";

export function Rejected({ result, onRetry }: { result: AnalysisResult; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow !text-flare">Analyse impossible</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight [font-stretch:85%] sm:text-4xl">{result.rejection?.message}</h2>
      <p className="mt-4 text-lg text-bone/75">{result.rejection?.advice}</p>
      <p className="mt-3 text-sm text-mute">Nous préférons ne rien afficher plutôt qu’une analyse peu fiable. Cette tentative n’est pas comptée.</p>
      <div className="mt-8"><QualityList result={result} /></div>
      <button onClick={onRetry} className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-volt px-6 font-semibold text-ink">Filmer à nouveau</button>
    </div>
  );
}

/**
 * Full report, or a preview where the first actionable observation is shown in full and the
 * other (real, already computed) observations are locked behind the subscription.
 */
export function ResultView({ result, frames, blob, locked = false, unlockSlot }: { result: AnalysisResult; frames?: PoseFrame[]; blob?: Blob | null; locked?: boolean; unlockSlot?: React.ReactNode }) {
  const replay = useRef<PoseReplayHandle>(null);
  const seek = (t: number) => { replay.current?.seek(t); document.getElementById("replay")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const free = locked ? result.observations.slice(0, 1) : result.observations;
  const hidden = locked ? result.observations.slice(1) : [];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{new Date(result.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</p>
          <h2 className="display mt-2 text-5xl sm:text-7xl">{result.exercise ? EXERCISE_LABEL[result.exercise] : "Analyse"}</h2>
        </div>
        {result.status === "uncertain" && <p className="max-w-sm rounded-2xl border border-amber-300/40 bg-amber-300/[0.06] p-3 text-sm text-amber-100">Analyse réalisée avec une fiabilité réduite (angle de caméra ou détection partielle). Lis les observations avec prudence.</p>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-24">
          {blob && frames ? <div id="replay"><PoseReplay ref={replay} blob={blob} frames={frames} result={result} /></div> : <p className="rounded-2xl border border-line p-4 text-sm text-mute">La vidéo n’est pas conservée sur cet appareil : seules les mesures sont disponibles.</p>}
          <div className="rounded-2xl border border-line p-4"><AngleChart result={result} onSeek={blob ? seek : undefined} /></div>
        </div>
        <div className="space-y-4">
          <SummaryGrid result={result} />
          {free.map((o, i) => <ObservationCard key={o.id} o={o} first={i === 0} onSeek={blob ? seek : undefined} />)}
          {hidden.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <div aria-hidden className="pointer-events-none select-none space-y-3 p-4 blur-[6px]">
                {hidden.map((o) => <ObservationCard key={o.id} o={{ ...o, detail: "••••••• ••••• ••• •••••••• ••• •••••• •••••", evidence: "••••• •• •••••• : ••°" }} compact />)}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/60 p-6 text-center">
                <p className="font-semibold">{hidden.length} autre{hidden.length > 1 ? "s" : ""} observation{hidden.length > 1 ? "s" : ""} déjà calculée{hidden.length > 1 ? "s" : ""}</p>
                <p className="text-sm text-bone/70">{hidden.filter((o) => o.kind === "improve").length} point(s) à travailler · {hidden.filter((o) => o.drill).length} exercice(s) correctif(s)</p>
                {unlockSlot}
              </div>
            </div>
          )}
          <div className={cn(locked && "hidden")}><RepTable result={result} onSeek={blob ? seek : undefined} /></div>
          <QualityList result={result} />
          <Limitations result={result} />
        </div>
      </div>
    </div>
  );
}
