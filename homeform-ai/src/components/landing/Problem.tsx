import { VideoLoop } from "@/components/media/VideoLoop";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { ClipKey } from "@/components/media/clips";

const ITEMS: { n: string; title: string; text: string; clip: ClipKey; tag: string; pos?: string }[] = [
  { n: "01", title: "Est-ce que je le fais bien ?", text: "Seul dans ton salon, sans miroir ni regard extérieur, impossible de savoir si ta descente est complète ou si ton dos reste aligné.", clip: "handsCloseup", tag: "Technique", pos: "50% 60%" },
  { n: "02", title: "Quels exercices choisir ?", text: "Des milliers de vidéos, peu de matériel, un temps limité. Difficile de construire une routine qui progresse semaine après semaine.", clip: "livingLunges", tag: "Programme", pos: "40% 50%" },
  { n: "03", title: "Est-ce que je progresse ?", text: "Sans trace de tes séances ni de tes répétitions, la motivation s’use et la progression devient invisible.", clip: "familyPushups", tag: "Suivi", pos: "45% 50%" },
];

export function Problem() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="pb-title">
      <div className="wrap">
        <SectionHead index="01" eyebrow="Le constat" title={<span id="pb-title">Tu t’entraînes seul.<br /><span className="text-bone/40">Mais tu n’as pas à progresser seul.</span></span>} />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.n} delay={i * 0.08}>
              <article className="group relative h-[460px] overflow-hidden rounded-[26px] border border-line sm:h-[520px]">
                <VideoLoop clip={it.clip} objectPosition={it.pos} className="transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
                <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-ink/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur">{it.tag}</span>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="display text-7xl text-volt">{it.n}</p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight [font-stretch:85%] sm:text-3xl">{it.title}</h3>
                  <p className="mt-3 leading-relaxed text-bone/75">{it.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
