"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { byId } from "@/lib/program/exercises";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
import { ButtonLink } from "@/components/ui/Button";
import { PageSkeleton, PageTitle } from "../Paywall";
import { fmtTarget } from "@/components/program/ProgramTimeline";
import { nextSession, thisWeekCount } from "../nextSession";
import { EXERCISE_LABEL } from "@/components/analysis/ReportView";

export function TodayPage() {
  const { data, loading, base, user } = useAccount();
  const sp = useSearchParams();
  if (loading) return <PageSkeleton />;
  const access = hasAccess(data.subscription);
  const next = nextSession(data);
  const week = thisWeekCount(data);
  const target = data.profile?.days ?? 3;
  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-8">
      {sp.get("checkout") === "success" && <p role="status" className="rounded-2xl border border-volt/40 bg-volt/[0.06] p-4">Paiement confirmé. Bienvenue ! L’activation peut prendre quelques secondes — recharge la page si besoin.</p>}
      {sp.get("checkout") === "dev" && <p role="status" className="rounded-2xl border border-amber-300/40 p-4 text-amber-100">Accès de test activé (mode développement, aucun paiement).</p>}
      <PageTitle eyebrow={`${greeting}${user?.email ? ` · ${user.email.split("@")[0]}` : ""}`} title="Aujourd’hui" />

      {!access && (
        <div className="rounded-[24px] border border-volt/40 bg-volt/[0.05] p-6">
          <p className="text-lg font-semibold">Ton compte est créé.</p>
          <p className="mt-1 text-bone/70">Avec l’abonnement : rapport complet de tes analyses, programme sur 4 semaines, suivi et coach IA.</p>
          <div className="mt-4 flex flex-wrap gap-3"><ButtonLink href="/abonnement" arrow>Voir l’offre</ButtonLink><ButtonLink href={`${base}/analyses`} variant="outline">Mes analyses</ButtonLink></div>
        </div>
      )}

      {access && !data.program && (
        <div className="rounded-[24px] border border-line p-6">
          <p className="text-lg font-semibold">Crée ton programme</p>
          <p className="mt-1 text-bone/70">Cinq questions pour un plan adapté à ton temps et ton matériel.</p>
          <ButtonLink href={`${base}/programme`} className="mt-4" arrow>Commencer</ButtonLink>
        </div>
      )}

      {access && next && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="overflow-hidden rounded-[24px] border border-line bg-ink-2" aria-labelledby="next-title">
            <div className="flex flex-wrap items-end justify-between gap-4 p-6">
              <div>
                <p className="eyebrow !text-volt">{next.done ? "Programme terminé · séance libre" : `Prochaine séance · semaine ${next.weekIdx + 1}`}</p>
                <h2 id="next-title" className="display mt-2 text-5xl">{next.session.title}</h2>
                <p className="mt-1 text-bone/70">{next.session.focus} · ~{next.session.estMinutes} min · {next.session.items.length} exercices</p>
              </div>
              <ButtonLink href={`${base}/seance/${next.weekIdx}-${next.session.id}`} size="lg" arrow>Lancer la séance</ButtonLink>
            </div>
            <ul className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
              {next.session.items.map((it, i) => {
                const ex = byId(it.exerciseId)!;
                return (
                  <li key={i} className="flex items-center gap-4 bg-ink-2 p-4">
                    <ExerciseDemo demo={ex.demo} skeleton={false} className="h-16 w-20 shrink-0 rounded-xl" label={ex.name} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{ex.name}</p>
                      <p className="font-mono text-xs text-mute">{it.sets} × {fmtTarget(it)} · repos {it.rest} s</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="grid gap-4">
            <section className="rounded-[24px] border border-line p-6">
              <p className="eyebrow">Cette semaine</p>
              <p className="display mt-3 text-6xl tabular">{week}<span className="text-bone/30">/{target}</span></p>
              <div className="mt-4 flex gap-1.5">{Array.from({ length: target }).map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < week ? "bg-volt" : "bg-line"}`} />)}</div>
              <p className="mt-3 text-sm text-mute">Programme : {next.completed}/{next.total} séances réalisées</p>
            </section>
            <section className="rounded-[24px] border border-line p-6">
              <p className="eyebrow">Dernière analyse</p>
              {data.analyses[0] ? (
                <Link href={`${base}/analyses/${data.analyses[0].id}`} className="mt-3 block hover:text-volt">
                  <p className="text-lg font-semibold">{data.analyses[0].exercise ? EXERCISE_LABEL[data.analyses[0].exercise] : "—"}</p>
                  <p className="text-sm text-mute">{data.analyses[0].result.observations.find((o) => o.kind === "improve")?.title ?? "Aucun point à travailler relevé"}</p>
                </Link>
              ) : <p className="mt-3 text-sm text-mute">Aucune analyse pour l’instant.</p>}
              <ButtonLink href={`${base}/analyser`} variant="outline" size="sm" className="mt-4">Analyser un mouvement</ButtonLink>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
