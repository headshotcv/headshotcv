"use client";
import { useMemo } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Heatmap, RepProgress, WeeklyBars, useProgressStats } from "@/components/app/ProgressCharts";
import { sampleAccount } from "@/lib/demo/sampleData";
import { EXERCISE_LABEL } from "@/components/analysis/ReportView";

const NOW = new Date("2026-11-20T18:00:00Z");

export function ProgressShowcase() {
  const data = useMemo(() => sampleAccount(NOW), []);
  const s = useProgressStats(data, NOW);
  return (
    <section id="suivi" className="border-t border-line py-24 sm:py-32" aria-labelledby="pr-title">
      <div className="wrap">
        <SectionHead index="05" eyebrow="Suivi" title={<span id="pr-title">Ta progression,<br /><span className="text-bone/40">noir sur blanc.</span></span>} intro="Chaque séance enregistrée alimente tes courbes : régularité, répétitions, analyses. Pas de promesse de transformation — des données sur ce que tu fais vraiment." />
        <div className="mt-6"><DemoBadge>Exemple d’affichage · données fictives</DemoBadge></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="rounded-[24px] border border-line bg-ink-2 p-6 lg:col-span-7">
            <p className="eyebrow">Progression des répétitions</p>
            <div className="mt-4"><RepProgress byEx={s.byEx} /></div>
          </div>
          <div className="grid gap-4 lg:col-span-5">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[24px] border border-line bg-line">
              {[["Séances", s.sessions], ["Répétitions", s.totalReps.toLocaleString("fr-FR")], ["Sem. à l'objectif", `${s.regular}/8`]].map(([k, v]) => (
                <div key={k} className="bg-ink-2 p-4 sm:p-5"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{k}</p><p className="display mt-2 text-3xl tabular sm:text-4xl">{v}</p></div>
              ))}
            </div>
            <div className="rounded-[24px] border border-line bg-ink-2 p-6"><p className="eyebrow mb-4">Régularité</p><Heatmap heat={s.heat} /></div>
          </div>
          <div className="rounded-[24px] border border-line bg-ink-2 p-6 lg:col-span-5">
            <p className="eyebrow mb-4">Séances par semaine · objectif {s.target}</p>
            <WeeklyBars weeks={s.weeks} target={s.target} />
          </div>
          <div className="rounded-[24px] border border-line bg-ink-2 p-6 lg:col-span-4">
            <p className="eyebrow mb-4">Historique des analyses</p>
            <ul className="divide-y divide-line">
              {data.analyses.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{a.exercise ? EXERCISE_LABEL[a.exercise] : "—"}<span className="block font-mono text-[11px] text-mute">{a.result.summary.repCount} rép. · {a.result.observations.filter((o) => o.kind === "improve").length} point(s) à travailler</span></span>
                  <span className="font-mono text-xs text-mute">{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-line bg-ink-2 p-6 lg:col-span-3">
            <p className="eyebrow mb-4">Objectifs personnels</p>
            <ul className="space-y-4">
              {data.goals.map((g) => {
                const best = Math.max(0, ...(s.byEx.get(g.exerciseId) ?? []).map((p) => p.best));
                const pct = Math.min(100, Math.round((best / g.target) * 100));
                return (
                  <li key={g.id}>
                    <div className="flex justify-between text-sm"><span>{g.label}</span><span className="font-mono text-xs text-mute">{pct}%</span></div>
                    <div className="mt-2 h-1.5 rounded bg-line"><div className="h-full rounded bg-volt" style={{ width: `${pct}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
