"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { Heatmap, RepProgress, WeeklyBars, useProgressStats } from "../ProgressCharts";
import { Paywall, PageTitle } from "../Paywall";
import { EXERCISES, byId } from "@/lib/program/exercises";
import { Button } from "@/components/ui/Button";
import { newId } from "@/lib/store/id";
import { TierBadges, XpCard } from "../Motivation";
import { ButtonLink } from "@/components/ui/Button";

export function ProgressPage() {
  return <Paywall feature="Ta progression"><Inner /></Paywall>;
}

function Inner() {
  const { data, user, repo, refresh, base } = useAccount();
  const sp = useSearchParams();
  const [now] = useState(() => new Date());
  const s = useProgressStats(data, now);
  const [adding, setAdding] = useState(false);
  const [gEx, setGEx] = useState("pushup");
  const [gT, setGT] = useState(10);

  async function addGoal() {
    const ex = byId(gEx)!;
    await repo.saveGoals(user!, [...data.goals, { id: newId(), exerciseId: gEx, target: gT, unit: ex.unit, label: `${gT} ${ex.unit === "reps" ? "rép." : "s"} — ${ex.name}`, createdAt: new Date().toISOString() }]);
    await refresh(); setAdding(false);
  }
  async function removeGoal(id: string) { await repo.saveGoals(user!, data.goals.filter((g) => g.id !== id)); await refresh(); }

  return (
    <div className="space-y-4">
      {sp.get("saved") && <p role="status" className="rounded-2xl border border-volt/40 bg-volt/[0.06] p-4">Séance enregistrée.</p>}
      <PageTitle eyebrow="Suivi" title="Ma progression" />
      {s.sessions === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-bone/70">Tes graphiques apparaîtront après ta première séance enregistrée.</p>}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-4">
        {[["Séances", s.sessions], ["Cette semaine", `${s.thisWeek}/${s.target}`], ["Répétitions", s.totalReps.toLocaleString("fr-FR")], ["Analyses", data.analyses.length]].map(([k, v]) => (
          <div key={k} className="bg-ink-2 p-5"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{k}</p><p className="display mt-2 text-4xl tabular">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[24px] border border-line bg-ink-2 p-6"><p className="eyebrow mb-4">Progression des répétitions</p><RepProgress byEx={s.byEx} /></section>
        <section className="rounded-[24px] border border-line bg-ink-2 p-6"><p className="eyebrow mb-4">Régularité</p><Heatmap heat={s.heat} /><p className="mt-6 text-sm text-bone/70">{s.regular} semaine(s) sur 8 à ton objectif de {s.target} séances.</p></section>
        <section className="rounded-[24px] border border-line bg-ink-2 p-6"><p className="eyebrow mb-4">Séances par semaine</p><WeeklyBars weeks={s.weeks} target={s.target} /></section>
        <section className="rounded-[24px] border border-line bg-ink-2 p-6">
          <div className="mb-4 flex items-center justify-between"><p className="eyebrow">Objectifs personnels</p>{!adding && <button onClick={() => setAdding(true)} className="focus-ring text-sm text-volt">+ Ajouter</button>}</div>
          {adding && (
            <div className="mb-4 space-y-3 rounded-2xl border border-line p-4">
              <select value={gEx} onChange={(e) => setGEx(e.target.value)} className="w-full rounded-xl border border-line bg-ink p-3" aria-label="Exercice">{EXERCISES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
              <div className="flex items-center gap-3"><input type="number" min={1} value={gT} onChange={(e) => setGT(Number(e.target.value))} className="w-24 rounded-xl border border-line bg-ink p-3" aria-label="Objectif" /><span className="text-sm text-mute">{byId(gEx)?.unit === "reps" ? "répétitions d’affilée" : "secondes"}</span></div>
              <div className="flex gap-2"><Button size="sm" onClick={addGoal}>Ajouter</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Annuler</Button></div>
            </div>
          )}
          {data.goals.length === 0 && !adding && <p className="text-sm text-mute">Fixe-toi un objectif mesurable, par exemple « 10 pompes d’affilée ».</p>}
          <ul className="space-y-4">
            {data.goals.map((g) => {
              const best = Math.max(0, ...(s.byEx.get(g.exerciseId) ?? []).map((p) => p.best));
              const pct = Math.min(100, Math.round((best / g.target) * 100));
              return (
                <li key={g.id}>
                  <div className="flex justify-between gap-3 text-sm"><span>{g.label}</span><span className="flex gap-3 font-mono text-xs text-mute">{best}/{g.target}<button onClick={() => removeGoal(g.id)} aria-label="Supprimer l’objectif" className="hover:text-flare">✕</button></span></div>
                  <div className="mt-2 h-1.5 rounded bg-line"><div className="h-full rounded bg-volt" style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[24px] border border-line bg-ink-2 p-6">
          <div className="mb-4 flex items-center justify-between"><p className="eyebrow">Bilans</p><ButtonLink href={`${base}/bilan`} size="sm" variant="outline">Refaire le bilan</ButtonLink></div>
          {data.assessments.length === 0 ? <p className="text-sm text-mute">Aucun bilan pour l’instant.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm tabular">
                <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute"><tr><th className="py-2 font-normal">Date</th><th className="font-normal">Pompes</th><th className="font-normal">Squats/60 s</th><th className="font-normal">Planche</th><th className="font-normal">Chaise</th></tr></thead>
                <tbody>{data.assessments.map((a) => (
                  <tr key={a.id} className="border-t border-line"><td className="py-3">{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</td><td>{a.pushups}{a.pushupVariant !== "pushup" && <span className="text-mute"> ({a.pushupVariant === "knee-pushup" ? "genoux" : "inclinées"})</span>}</td><td>{a.squats60}</td><td>{a.plank} s</td><td>{a.wallSit} s</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <div className="grid gap-4"><XpCard /><section className="rounded-[24px] border border-line bg-ink-2 p-6"><p className="eyebrow mb-4">Paliers de régularité</p><TierBadges /></section></div>
      </div>
      <section className="rounded-[24px] border border-line bg-ink-2 p-6">
        <p className="eyebrow mb-4">Historique des séances</p>
        {data.logs.length === 0 ? <p className="text-sm text-mute">Aucune séance enregistrée.</p> : (
          <ul className="divide-y divide-line">
            {data.logs.slice(0, 15).map((l) => (
              <li key={l.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>{l.title} <span className="text-mute">· sem. {l.week} · {l.durationMin} min</span></span>
                <span className="font-mono text-xs text-mute">{new Date(l.createdAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
