"use client";
import type { JobState } from "./useAnalysisJob";
import { Button } from "@/components/ui/Button";

const STAGES = [
  ["model", "Chargement du modèle de pose (une seule fois)"],
  ["frames", "Repérage des articulations image par image"],
  ["analysis", "Découpage des répétitions et mesures"],
] as const;

export function Processing({ state, onCancel }: { state: Extract<JobState, { phase: "running" }>; onCancel: () => void }) {
  const idx = STAGES.findIndex(([k]) => k === state.stage);
  const pct = Math.round((state.stage === "model" ? 0.03 : state.stage === "frames" ? 0.05 + state.progress * 0.9 : 0.98) * 100);
  return (
    <div className="mx-auto max-w-xl py-10 text-center" aria-live="polite">
      <p className="display text-[96px] tabular text-volt">{pct}%</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-volt transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
      <ol className="mt-8 space-y-3 text-left">
        {STAGES.map(([k, l], i) => (
          <li key={k} className="flex items-center gap-3 text-sm">
            <span className={i < idx ? "text-volt" : i === idx ? "animate-pulse text-bone" : "text-mute"}>{i < idx ? "✓" : i === idx ? "●" : "○"}</span>
            <span className={i <= idx ? "text-bone" : "text-mute"}>{l}</span>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-mute">Traitement local sur ton appareil. Garde cet onglet ouvert — cela prend environ la durée de la vidéo.</p>
      <Button variant="ghost" size="sm" className="mt-4" onClick={onCancel}>Annuler</Button>
    </div>
  );
}
