import Link from "next/link";
import { MarketingShell, PageHero } from "@/components/marketing/MarketingShell";
import { CHECKPOINTS } from "@/components/marketing/checkpoints";
import { AnalysisShowcase } from "@/components/landing/AnalysisShowcase";

export const metadata = { title: "Analyse vidéo du squat et des pompes", description: "Ce que l’analyse vidéo HOMEFORM mesure sur ton squat et tes pompes, comment elle fonctionne et quand elle refuse de conclure." };

const STEPS = [
  ["Filme", "Téléphone posé à 2–3 m, de profil, corps entier dans le cadre. Les répétitions sont comptées en direct pendant que tu filmes."],
  ["Analyse sur ton appareil", "MediaPipe repère 33 points du corps, image par image, directement dans ton navigateur. La vidéo n’est pas envoyée."],
  ["Mesures", "Angles en 2D, alignement, durée de chaque phase, régularité. Chaque répétition est découpée automatiquement."],
  ["Corrections classées", "La correction qui change le plus ton mouvement passe en premier, avec les moments de la vidéo et un exercice pour la travailler."],
];

export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Analyse vidéo" clip="livingPushups" pos="55% 50%" title={<>Ta technique,<br /><span className="text-volt">mesurée.</span></>} intro="Squat au poids du corps et pompes : 5 points de contrôle chacun, des mesures précises et des corrections classées par priorité. Pas de note inventée sur 100." />
      <section className="wrap py-20">
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-[22px] border border-line p-6"><p className="display text-5xl text-volt">0{i + 1}</p><p className="mt-3 text-xl font-bold [font-stretch:85%]">{t}</p><p className="mt-2 text-bone/70">{d}</p></li>
          ))}
        </ol>
      </section>
      <AnalysisShowcase />
      <section className="wrap py-20">
        <h2 className="display text-5xl sm:text-7xl">Les points de contrôle</h2>
        <p className="mt-4 max-w-2xl text-bone/70">Les seuils ci-dessous sont ceux réellement utilisés par le moteur. Ils sont indicatifs et en cours de validation avec des professionnels qualifiés.</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {(["squat", "pushup"] as const).map((ex) => (
            <div key={ex}>
              <h3 className="display text-4xl">{ex === "squat" ? "Squat" : "Pompes"}</h3>
              <ol className="mt-4 divide-y divide-line border-y border-line">
                {CHECKPOINTS[ex].map((c, i) => (
                  <li key={c.title} className="grid grid-cols-[40px_1fr] gap-2 py-5">
                    <span className="font-mono text-sm text-volt">0{i + 1}</span>
                    <div><p className="font-semibold">{c.title}</p><p className="mt-1 text-sm text-bone/70">{c.what}</p><p className="mt-1 font-mono text-xs text-bone/60">{c.flag}</p><p className="mt-1 text-sm"><span className="text-mute">Exercice associé : </span>{c.drill}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-10 text-bone/70">Pour savoir quand l’analyse peut se tromper, lis <Link href="/forces-et-limites" className="text-volt underline">forces et limites</Link> et <Link href="/comment-filmer" className="text-volt underline">comment bien filmer</Link>.</p>
      </section>
    </MarketingShell>
  );
}
