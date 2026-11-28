"use client";
import Link from "next/link";
import { useAccount } from "@/lib/store/AccountProvider";
import { computeXp, dailyChallenge, TIERS, weeklyStreak } from "@/lib/gamification";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function StreakCard() {
  const { data } = useAccount();
  const s = weeklyStreak(data);
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-line p-6">
      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-volt/10 blur-3xl" />
      <p className="eyebrow">Série · objectif {s.goal} séances / semaine</p>
      <div className="mt-3 flex items-end gap-3">
        <p className="display text-7xl tabular text-volt">{s.current}</p>
        <p className="pb-2 text-bone/70">semaine{s.current > 1 ? "s" : ""} d’affilée{ s.tier ? <> · palier <strong className="text-bone">{s.tier.name}</strong></> : null}</p>
      </div>
      <div className="mt-4 flex gap-1.5" aria-label={`${s.thisCount} séances sur ${s.goal} cette semaine`}>{Array.from({ length: s.goal }).map((_, i) => <span key={i} className={cn("h-2 flex-1 rounded-full", i < s.thisCount ? "bg-volt" : "bg-line")} />)}</div>
      <p className="mt-3 text-sm text-mute">{s.thisCount >= s.goal ? "Objectif de la semaine atteint. Le repos fait partie de l’entraînement." : `Encore ${s.goal - s.thisCount} séance${s.goal - s.thisCount > 1 ? "s" : ""} cette semaine pour prolonger la série.`}{s.nextTier ? ` Prochain palier : ${s.nextTier.name} (${s.nextTier.weeks} sem.).` : ""}</p>
    </section>
  );
}

export function XpCard() {
  const { data } = useAccount();
  const x = computeXp(data);
  return (
    <section className="rounded-[24px] border border-line p-6">
      <p className="eyebrow">Niveau</p>
      <div className="mt-3 flex items-baseline justify-between"><p className="display text-6xl tabular">{x.level}</p><p className="font-mono text-sm text-mute tabular">{x.xp.toLocaleString("fr-FR")} XP</p></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-volt" style={{ width: `${(x.into / x.next) * 100}%` }} /></div>
      <p className="mt-2 text-xs text-mute">{x.next - x.into} XP avant le niveau {x.level + 1} · séance +100, série +10, analyse +50, bilan +150, défi +30</p>
    </section>
  );
}

export function ChallengeCard() {
  const { data, user, repo, refresh, base } = useAccount();
  const c = dailyChallenge();
  const today = c.date;
  const analysedToday = data.analyses.some((a) => a.createdAt.slice(0, 10) === today && a.status !== "rejected");
  const done = data.challenges.some((x) => x.date === today && x.id === c.id) || (c.id === "analysis" && analysedToday);
  return (
    <section className={cn("rounded-[24px] border p-6", done ? "border-volt/40 bg-volt/[0.05]" : "border-line")}>
      <p className="eyebrow !text-volt">Défi du jour</p>
      <p className="mt-3 text-2xl font-bold [font-stretch:85%]">{c.title}</p>
      <p className="mt-1 text-sm text-bone/70">{c.detail}</p>
      {done ? <p className="mt-4 font-mono text-sm text-volt">✓ Réussi · +30 XP</p> : c.id === "analysis" ? (
        <Link href={`${base}/analyser`} className="focus-ring mt-4 inline-flex min-h-10 items-center rounded-full bg-volt px-4 text-sm font-semibold text-ink">Analyser maintenant</Link>
      ) : (
        <Button size="sm" className="mt-4" onClick={async () => { await repo.completeChallenge(user!, { date: today, id: c.id }); await refresh(); }}>C’est fait</Button>
      )}
    </section>
  );
}

export function TierBadges() {
  const { data } = useAccount();
  const s = weeklyStreak(data);
  return (
    <ul className="grid grid-cols-5 gap-2">
      {TIERS.map((t) => {
        const on = s.best >= t.weeks;
        return (
          <li key={t.name} className={cn("rounded-2xl border p-3 text-center", on ? "border-volt/50 bg-volt/[0.06]" : "border-line opacity-50")}>
            <p className={cn("display text-3xl", on && "text-volt")}>{t.weeks}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide">{t.name}</p>
          </li>
        );
      })}
    </ul>
  );
}
