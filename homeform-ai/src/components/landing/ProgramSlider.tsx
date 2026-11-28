"use client";
import { useEffect, useRef, useState } from "react";
import { VideoLoop } from "@/components/media/VideoLoop";
import type { ClipKey } from "@/components/media/clips";
import { GOALS, type Goal } from "@/lib/program/generate";
import { cn } from "@/lib/cn";

const SLIDES: { goal: Goal; clip: ClipKey; pos?: string; weeks: string; focus: string[]; level: string }[] = [
  { goal: "debuter", clip: "familyPushups", pos: "45% 50%", weeks: "4 sem.", focus: ["Squat", "Pompes inclinées", "Pont fessier"], level: "Débutant" },
  { goal: "pompes", clip: "livingPushups", pos: "55% 50%", weeks: "4 sem.", focus: ["Pompes inclinées", "Sur les genoux", "Test max"], level: "Tous niveaux" },
  { goal: "bas", clip: "livingLunges", pos: "40% 50%", weeks: "4 sem.", focus: ["Fentes", "Chaise", "Pont fessier"], level: "Tous niveaux" },
  { goal: "haut", clip: "faceCloseup", weeks: "4 sem.", focus: ["Pompes", "Dips sur chaise", "Tirage"], level: "Intermédiaire" },
  { goal: "fullbody", clip: "loftWorkout", weeks: "4 sem.", focus: ["Squat", "Mountain climbers", "Planche"], level: "Tous niveaux" },
  { goal: "renforcement", clip: "loftSquats", weeks: "4 sem.", focus: ["Squat", "Fentes", "Gainage"], level: "Intermédiaire" },
];

/** Horizontal, swipeable slides with autoplay progress, arrows and dots. */
export function ProgramSlider() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + SLIDES.length) % SLIDES.length;
    const child = el.children[n] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - (el.children[0] as HTMLElement).offsetLeft, behavior: "smooth" });
    setActive(n);
    setProgress(0);
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      const x = el.scrollLeft;
      let best = 0;
      const base = kids[0].offsetLeft;
      kids.forEach((k, i) => { if (Math.abs(k.offsetLeft - base - x) < Math.abs(kids[best].offsetLeft - base - x)) best = i; });
      setActive(best);
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setProgress((p) => {
      if (p >= 100) { go(active + 1); return 0; }
      return p + 2;
    }), 120);
    return () => clearInterval(id);
  }, [paused, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
      <div className="wrap mb-6 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-mute"><span className="text-volt">{String(active + 1).padStart(2, "0")}</span> / {String(SLIDES.length).padStart(2, "0")} · Programmes</p>
        <div className="flex gap-2">
          <button onClick={() => go(active - 1)} aria-label="Programme précédent" className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-volt hover:text-volt">←</button>
          <button onClick={() => go(active + 1)} aria-label="Programme suivant" className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-volt hover:text-volt">→</button>
        </div>
      </div>
      <div ref={track} className="flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto scroll-smooth px-[var(--gutter)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="region" aria-roledescription="carrousel" aria-label="Programmes">
        {SLIDES.map((s, i) => (
          <article key={s.goal} aria-roledescription="diapositive" aria-label={`${i + 1} sur ${SLIDES.length} : ${GOALS[s.goal].title}`}
            className={cn("relative h-[480px] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[28px] border transition-[border-color] sm:h-[560px] sm:w-[520px] lg:w-[600px]", i === active ? "border-volt/50" : "border-line")}>
            <VideoLoop clip={s.clip} objectPosition={s.pos} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/20" />
            <div className="absolute left-5 right-5 top-5 flex flex-wrap gap-2">
              {[s.weeks, s.level].map((t) => <span key={t} className="rounded-full border border-white/15 bg-ink/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur">{t}</span>)}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="display text-5xl sm:text-6xl">{GOALS[s.goal].title}</h3>
              <p className="mt-3 max-w-md text-bone/75">{GOALS[s.goal].summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">{s.focus.map((f) => <li key={f} className="rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur">{f}</li>)}</ul>
            </div>
            {i === active && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"><div className="h-full bg-volt transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>}
          </article>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((s, i) => <button key={s.goal} onClick={() => go(i)} aria-label={`Aller au programme ${i + 1}`} aria-current={i === active} className="focus-ring flex h-8 items-center px-1"><span className={cn("block h-2 rounded-full transition-all", i === active ? "w-8 bg-volt" : "w-2 bg-bone/25")} /></button>)}
      </div>
    </div>
  );
}
