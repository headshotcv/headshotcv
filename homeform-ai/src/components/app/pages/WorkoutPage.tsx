"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { byId } from "@/lib/program/exercises";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
import { Button } from "@/components/ui/Button";
import { Paywall } from "../Paywall";
import { fmtTarget } from "@/components/program/ProgramTimeline";
import { newId } from "@/lib/store/id";
import type { SetLog } from "@/lib/store/types";

export function WorkoutPage({ slug }: { slug: string }) {
  return <Paywall feature="Séance guidée"><Player slug={slug} /></Paywall>;
}

function Player({ slug }: { slug: string }) {
  const { data, user, repo, refresh, base } = useAccount();
  const router = useRouter();
  const [wStr, ...rest] = slug.split("-");
  const sid = rest.join("-");
  const session = data.program?.weeks[Number(wStr)]?.sessions.find((s) => s.id === sid);
  const [started] = useState(() => Date.now());
  const [ex, setEx] = useState(0);
  const [set, setSet] = useState(0);
  const [logs, setLogs] = useState<SetLog[][]>(() => session?.items.map((it) => Array.from({ length: it.sets }, () => ({ target: it.target, done: it.target }))) ?? []);
  const [rest_, setRest] = useState<number | null>(null);
  const [hold, setHold] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rest_ === null) return;
    if (rest_ <= 0) { setRest(null); return; }
    const id = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(id);
  }, [rest_]);
  useEffect(() => {
    if (hold === null) return;
    const id = setTimeout(() => setHold((h) => (h === null ? null : h + 1)), 1000);
    return () => clearTimeout(id);
  }, [hold]);

  const total = useMemo(() => session?.items.reduce((s, i) => s + i.sets, 0) ?? 0, [session]);
  if (!session) return <div className="py-20 text-center"><p>Séance introuvable.</p><Button className="mt-4" onClick={() => router.push(`${base}/programme`)}>Mon programme</Button></div>;

  const it = session.items[ex];
  const exo = byId(it.exerciseId)!;
  const doneSets = session.items.slice(0, ex).reduce((s, i) => s + i.sets, 0) + set;
  const value = logs[ex][set].done;
  const setValue = (v: number) => setLogs((L) => L.map((row, i) => (i !== ex ? row : row.map((c, k) => (k === set ? { ...c, done: Math.max(0, v) } : c)))));

  function validate() {
    setHold(null);
    if (set + 1 < it.sets) { setSet(set + 1); setRest(it.rest); return; }
    if (ex + 1 < session!.items.length) { setEx(ex + 1); setSet(0); setRest(it.rest); return; }
    setFinished(true);
  }
  async function save() {
    setSaving(true);
    await repo.addLog(user!, { id: newId(), sessionId: session!.id, week: Number(wStr) + 1, title: session!.title, durationMin: Math.max(1, Math.round((Date.now() - started) / 60000)), createdAt: new Date().toISOString(), items: session!.items.map((x, i) => ({ exerciseId: x.exerciseId, unit: x.unit, sets: logs[i] })) });
    await refresh();
    router.push(`${base}/progression?saved=1`);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="eyebrow !text-volt">Séance terminée</p>
        <h1 className="display mt-3 text-6xl">Bien joué.</h1>
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line text-left">
          {session.items.map((x, i) => (
            <li key={i} className="flex justify-between px-4 py-3 text-sm"><span>{byId(x.exerciseId)?.name}</span><span className="font-mono text-bone/70">{logs[i].map((s) => s.done).join(" · ")} {x.unit === "reps" ? "rép." : "s"}</span></li>
          ))}
        </ul>
        <Button size="lg" className="mt-8 w-full" onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer la séance"}</Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => router.push(base)}>Quitter sans enregistrer</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => { if (confirm("Quitter la séance ? Ta progression ne sera pas enregistrée.")) router.push(base); }} className="focus-ring font-mono text-xs uppercase tracking-[0.14em] text-bone/70">✕ Quitter</button>
        <p className="font-mono text-xs text-mute">{doneSets}/{total} séries</p>
      </div>
      <div className="mt-3 h-1 rounded bg-line"><div className="h-full rounded bg-volt transition-[width]" style={{ width: `${(doneSets / total) * 100}%` }} /></div>

      {rest_ !== null ? (
        <div className="py-16 text-center" aria-live="polite">
          <p className="eyebrow">Repos</p>
          <p className="display mt-4 text-[160px] leading-none tabular text-volt">{rest_}</p>
          <p className="mt-4 text-bone/70">Suivant : {byId(session.items[ex].exerciseId)?.name} · série {set + 1}/{session.items[ex].sets}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setRest((r) => (r ?? 0) + 15)}>+15 s</Button>
            <Button onClick={() => setRest(null)}>Passer</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <ExerciseDemo demo={exo.demo} className="aspect-video rounded-[24px] border border-line" label={exo.name} />
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="display text-5xl">{exo.name}</h1>
            <p className="font-mono text-sm text-volt">Série {set + 1}/{it.sets} · objectif {fmtTarget(it)}</p>
          </div>
          <p className="mt-2 text-bone/70">{exo.cue}</p>
          <details className="mt-3 text-sm text-bone/75"><summary className="cursor-pointer text-bone">Instructions</summary><ul className="mt-2 list-disc space-y-1 pl-5">{exo.instructions.map((s) => <li key={s}>{s}</li>)}</ul>{exo.easier && <p className="mt-2">Plus facile : {byId(exo.easier)?.name}</p>}</details>

          {it.unit === "seconds" && (
            <div className="mt-6 flex items-center gap-4">
              <Button variant="outline" onClick={() => setHold(hold === null ? 0 : null)}>{hold === null ? "Démarrer le chrono" : "Arrêter"}</Button>
              {hold !== null && <span className="display text-5xl tabular text-volt">{hold}s</span>}
              {hold !== null && <Button variant="ghost" size="sm" onClick={() => { setValue(hold); setHold(null); }}>Utiliser ce temps</Button>}
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-line p-5">
            <p className="text-sm text-bone/70">{it.unit === "reps" ? "Répétitions réalisées" : "Secondes tenues"}</p>
            <div className="mt-3 flex items-center gap-4">
              <button onClick={() => setValue(value - 1)} className="focus-ring h-14 w-14 rounded-full border border-line text-2xl" aria-label="Moins">−</button>
              <input type="number" inputMode="numeric" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-24 bg-transparent text-center text-5xl font-bold tabular outline-none" aria-label="Valeur réalisée" />
              <button onClick={() => setValue(value + 1)} className="focus-ring h-14 w-14 rounded-full border border-line text-2xl" aria-label="Plus">+</button>
            </div>
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={validate} arrow>Valider la série</Button>
        </div>
      )}
    </div>
  );
}
