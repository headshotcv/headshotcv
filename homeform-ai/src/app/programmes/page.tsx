import { MarketingShell, PageHero } from "@/components/marketing/MarketingShell";
import { ProgramSlider } from "@/components/landing/ProgramSlider";
import { EXERCISES, byId } from "@/lib/program/exercises";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
export const metadata = { title: "Programmes et leçons d’exercices", description: "Six programmes de 4 semaines à faire chez soi et une bibliothèque d’exercices détaillés." };
const EQ: Record<string, string> = { chair: "chaise", mat: "tapis", band: "élastique", dumbbells: "haltères", bar: "barre" };
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Programmes" clip="familyPushups" pos="45% 50%" title={<>4 semaines.<br /><span className="text-volt">Ton salon suffit.</span></>} intro="Un bilan de départ de 10 minutes, puis un programme calculé sur ton niveau réel, ton temps et ton matériel. Chaque semaine, les objectifs progressent ; la quatrième se termine par un test." />
      <section className="py-16"><ProgramSlider /></section>
      <section id="lecons" className="wrap pb-24">
        <h2 className="display text-5xl sm:text-7xl">Leçons d’exercices</h2>
        <p className="mt-4 max-w-2xl text-bone/70">{EXERCISES.length} exercices expliqués pas à pas, avec une démonstration animée, le point d’attention principal et la variante plus facile.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXERCISES.map((e) => (
            <article key={e.id} className="overflow-hidden rounded-[22px] border border-line bg-ink-2">
              <ExerciseDemo demo={e.demo} className="aspect-[16/10]" label={e.name} />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold [font-stretch:85%]">{e.name}</h3>
                  {e.analysable && <span className="rounded-full bg-volt px-2 py-0.5 font-mono text-[10px] uppercase text-ink">Analyse vidéo</span>}
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Niveau {e.level} · {e.equipment.length ? e.equipment.map((x) => EQ[x]).join(", ") : "sans matériel"}</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-bone/75">{e.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
                <p className="mt-3 text-sm"><span className="text-volt">Repère : </span>{e.cue}</p>
                {e.easier && <p className="mt-1 text-sm text-bone/70">Plus facile : {byId(e.easier)?.name}</p>}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-mute">Démonstrations animées générées par HOMEFORM. Des leçons filmées avec un coach diplômé sont prévues.</p>
      </section>
    </MarketingShell>
  );
}
