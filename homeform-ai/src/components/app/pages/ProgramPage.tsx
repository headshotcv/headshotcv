"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { generateProgram } from "@/lib/program/generate";
import { byId } from "@/lib/program/exercises";
import { ProfileQuiz } from "@/components/program/ProfileQuiz";
import { ProgramTimeline, fmtTarget } from "@/components/program/ProgramTimeline";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Paywall, PageTitle } from "../Paywall";

export function ProgramPage() {
  return <Paywall feature="Ton programme"><Inner /></Paywall>;
}

function Inner() {
  const { data, user, repo, refresh, base } = useAccount();
  const router = useRouter();
  const [editing, setEditing] = useState(!data.program);
  const [open, setOpen] = useState<{ w: number; s: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (editing || !data.program) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageTitle eyebrow="Programme" title={data.program ? "Modifier" : "Ton profil"} />
        <ProfileQuiz initial={data.profile ?? undefined} submitLabel="Générer mon programme" onDone={async (p) => {
          try { await repo.saveProfile(user!, p, generateProgram(p)); await refresh(); setEditing(false); } catch (e) { setError((e as Error).message); }
        }} />
        {error && <p role="alert" className="mt-4 text-flare">{error}</p>}
        {data.program && <Button variant="ghost" className="mt-4" onClick={() => setEditing(false)}>Annuler</Button>}
      </div>
    );
  }
  const prog = data.program;
  const session = open ? prog.weeks[open.w].sessions.find((s) => s.id === open.s) : null;
  return (
    <div>
      <PageTitle eyebrow={`${prog.profile.days} séances / semaine · ~${prog.profile.minutes} min`} title={prog.title}>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Modifier mon profil</Button>
      </PageTitle>
      <p className="mb-8 max-w-2xl text-bone/70">{prog.summary} Si un exercice provoque une douleur, arrête-le et utilise la variante plus facile.</p>
      <ProgramTimeline program={prog} onOpenSession={(w, s) => setOpen({ w, s })} />
      {session && open && (
        <div role="dialog" aria-modal="true" aria-label={session.title} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" onClick={() => setOpen(null)}>
          <div className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-line bg-ink p-6 sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="eyebrow">Semaine {open.w + 1}</p><h2 className="display mt-1 text-5xl">{session.title}</h2></div>
              <button onClick={() => setOpen(null)} className="focus-ring rounded-full border border-line px-3 py-1.5 text-sm" aria-label="Fermer">Fermer</button>
            </div>
            <ol className="mt-6 space-y-4">
              {session.items.map((it, i) => {
                const ex = byId(it.exerciseId)!;
                const easier = ex.easier ? byId(ex.easier) : null;
                return (
                  <li key={i} className="overflow-hidden rounded-2xl border border-line sm:grid sm:grid-cols-[200px_1fr]">
                    <ExerciseDemo demo={ex.demo} className="aspect-[4/3] sm:aspect-auto sm:h-full" label={ex.name} />
                    <div className="p-5">
                      <p className="text-xl font-bold [font-stretch:85%]">{ex.name}</p>
                      <p className="mt-1 font-mono text-sm text-volt">{it.sets} séries × {fmtTarget(it)} · repos {it.rest} s</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-bone/75">{ex.instructions.map((s) => <li key={s}>{s}</li>)}</ul>
                      <p className="mt-3 text-sm"><span className="text-mute">Repère : </span>{ex.cue}</p>
                      {easier && <p className="mt-2 text-sm"><span className="text-mute">Plus facile : </span>{easier.name}</p>}
                      {it.note && it.target === 0 && <p className="mt-2 text-sm text-amber-100">{it.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <ButtonLink href={`${base}/seance/${open.w}-${session.id}`} size="lg" arrow className="mt-6 w-full">Lancer cette séance</ButtonLink>
          </div>
        </div>
      )}
      <button className="sr-only" onClick={() => router.refresh()}>rafraîchir</button>
    </div>
  );
}
