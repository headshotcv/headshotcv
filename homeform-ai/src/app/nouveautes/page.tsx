import { MarketingShell, PageHero } from "@/components/marketing/MarketingShell";
export const metadata = { title: "Nouveautés", description: "Les dernières évolutions de HOMEFORM." };
const LOG = [
  { v: "0.3", date: "Novembre 2026", items: ["Comptage des répétitions en direct pendant le filmage", "Bilan de départ en 4 tests, avec comptage par la caméra", "Programme calculé sur ton bilan", "Séries hebdomadaires, paliers, niveau et défi du jour", "Corrections classées : « à corriger en premier »", "Une fente filmée de côté n’est plus prise pour un squat"] },
  { v: "0.2", date: "Novembre 2026", items: ["Vraies vidéos d’entraînement analysées sur la page d’accueil", "Programmes en diapositives", "Analyse de démonstration sur deux vidéos réelles"] },
  { v: "0.1", date: "Novembre 2026", items: ["Analyse vidéo du squat et des pompes dans le navigateur", "Programmes de 4 semaines, séances guidées et suivi", "Coach IA, abonnement mensuel ou annuel"] },
];
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Nouveautés" clip="darkPushups" title={<>Quoi de neuf<br /><span className="text-volt">chez HOMEFORM.</span></>} intro="Chaque version, ce qui a changé." cta={false} />
      <section className="wrap max-w-3xl py-16">
        <ol className="relative space-y-10 border-l border-line pl-8">
          {LOG.map((r) => (
            <li key={r.v}>
              <span className="absolute -left-[7px] mt-2 h-3.5 w-3.5 rounded-full bg-volt" />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-mute">{r.date}</p>
              <h2 className="display mt-1 text-5xl">Version {r.v}</h2>
              <ul className="mt-4 space-y-2 text-bone/80">{r.items.map((i) => <li key={i} className="flex gap-3"><span className="text-volt">+</span>{i}</li>)}</ul>
            </li>
          ))}
        </ol>
      </section>
    </MarketingShell>
  );
}
