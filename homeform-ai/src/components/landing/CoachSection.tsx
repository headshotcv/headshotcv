"use client";
import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProfileQuiz } from "@/components/program/ProfileQuiz";
import { ProgramTimeline } from "@/components/program/ProgramTimeline";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
import { ButtonLink, Button } from "@/components/ui/Button";
import { generateProgram, GOALS, type Program } from "@/lib/program/generate";
import { saveDraftProfile } from "@/lib/store/draft";

const SHOWCASE = [
  ["debuter", "squat"], ["renforcement", "lunge"], ["haut", "pushup"], ["bas", "glute-bridge"], ["fullbody", "mountain-climber"], ["pompes", "incline-pushup"],
] as const;

export function CoachSection() {
  const [program, setProgram] = useState<Program | null>(null);
  return (
    <section id="programme" className="border-t border-line py-24 sm:py-32" aria-labelledby="coach-title">
      <div className="wrap">
        <SectionHead index="04" eyebrow="Ton programme" title={<span id="coach-title">Cinq questions.<br /><span className="text-volt">Un plan sur 4 semaines.</span></span>} intro="Ton objectif, ton niveau, ton temps et ton matériel. Le programme s’adapte, avec une variante plus facile pour chaque exercice." />

        {!program ? (
          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-[24px] border border-line bg-ink-2 p-6 sm:p-8">
              <ProfileQuiz onDone={(p) => { setProgram(generateProgram(p)); saveDraftProfile(p); }} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SHOWCASE.map(([g, demo]) => (
                <div key={g} className="overflow-hidden rounded-2xl border border-line bg-ink-2">
                  <ExerciseDemo demo={demo} skeleton={false} className="aspect-[4/3]" label={GOALS[g].title} />
                  <p className="p-3 text-sm font-semibold leading-tight [font-stretch:85%] sm:text-base">{GOALS[g].title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-14 rounded-[24px] border border-line bg-ink-2/50 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow !text-volt">Ton programme</p>
                <h3 className="display mt-2 text-4xl sm:text-6xl">{program.title}</h3>
                <p className="mt-2 max-w-xl text-bone/70">{program.summary} {program.profile.days} séances par semaine, environ {program.profile.minutes} minutes.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setProgram(null)}>Modifier</Button>
                <ButtonLink href="/inscription?next=/app/programme" size="sm" arrow>Enregistrer ce programme</ButtonLink>
              </div>
            </div>
            <div className="mt-8"><ProgramTimeline program={program} /></div>
          </div>
        )}
      </div>
    </section>
  );
}
