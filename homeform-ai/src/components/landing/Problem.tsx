import { TrainingScene } from "@/components/figure/TrainingScene";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

const ITEMS = [
  { n: "01", title: "Est-ce que je le fais bien ?", text: "Seul dans ton salon, sans miroir ni regard extérieur, impossible de savoir si ta descente est complète ou si ton dos reste aligné.", scene: { exercise: "pushup" as const, variant: "bedroom" as const, pushup: { sag: 26 }, frozenAt: 1.55 } },
  { n: "02", title: "Quels exercices choisir ?", text: "Des milliers de vidéos, peu de matériel, un temps limité. Difficile de construire une routine qui progresse semaine après semaine.", scene: { exercise: "squat" as const, variant: "living" as const, frozenAt: 0.3 } },
  { n: "03", title: "Est-ce que je progresse ?", text: "Sans trace de tes séances ni de tes répétitions, la motivation s'use et la progression devient invisible.", scene: { exercise: "squat" as const, variant: "garden" as const, frozenAt: 1.75 } },
];

export function Problem() {
  return (
    <section className="relative border-t border-line py-24 sm:py-32" aria-labelledby="pb-title">
      <div className="wrap">
        <SectionHead index="01" eyebrow="Le constat" title={<span id="pb-title">Tu t’entraînes seul.<br /><span className="text-bone/40">Mais tu n’as pas à progresser seul.</span></span>} />
        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.n} delay={i * 0.08}>
              <article className="group relative overflow-hidden rounded-[24px] border border-line bg-ink-2">
                <TrainingScene {...it.scene} ratio="square" className="aspect-[4/3] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]" />
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-transparent to-ink-2" />
                <div className="relative -mt-16 p-6 sm:p-7">
                  <p className="display text-6xl text-volt/90">{it.n}</p>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight [font-stretch:85%]">{it.title}</h3>
                  <p className="mt-3 leading-relaxed text-bone/70">{it.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
