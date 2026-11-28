"use client";
import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProfileQuiz } from "@/components/program/ProfileQuiz";
import { ProgramTimeline } from "@/components/program/ProgramTimeline";
import { ProgramSlider } from "./ProgramSlider";
import { VideoLoop } from "@/components/media/VideoLoop";
import { ButtonLink, Button } from "@/components/ui/Button";
import { generateProgram, type Program } from "@/lib/program/generate";
import { saveDraftProfile } from "@/lib/store/draft";

export function CoachSection() {
  const [program, setProgram] = useState<Program | null>(null);
  return (
    <section id="programme" className="py-24 sm:py-32" aria-labelledby="coach-title">
      <div className="wrap">
        <SectionHead index="04" eyebrow="Ton programme" title={<span id="coach-title">Cinq questions.<br /><span className="text-volt">Un plan sur 4 semaines.</span></span>} intro="Ton objectif, ton niveau, ton temps et ton matériel. Le programme s’adapte, avec une variante plus facile pour chaque exercice." />
      </div>
      <div className="mt-12"><ProgramSlider /></div>
      <div className="wrap">

        {!program ? (
          <div className="relative mt-16 grid overflow-hidden rounded-[28px] border border-line lg:grid-cols-[1.1fr_1fr]">
            <div className="relative z-10 bg-ink-2 p-6 sm:p-10">
              <p className="eyebrow mb-6 !text-volt">Crée ton plan · 30 secondes</p>
              <ProfileQuiz onDone={(p) => { setProgram(generateProgram(p)); saveDraftProfile(p); }} />
            </div>
            <div className="relative hidden min-h-[520px] lg:block">
              <VideoLoop clip="terracePushups" objectPosition="40% 50%" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-2 via-ink-2/30 to-transparent" />
              <div className="absolute bottom-8 right-8 max-w-[260px] rounded-2xl border border-white/10 bg-ink/60 p-4 backdrop-blur-xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-volt">Ton programme</p>
                <p className="mt-1 text-sm text-bone/85">4 semaines · progression de +1 à +2 répétitions par semaine · test en fin de cycle.</p>
              </div>
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
