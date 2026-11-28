"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Profile } from "@/lib/program/generate";
import { QUESTIONS, DEFAULT_PROFILE } from "./quiz";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** Step-by-step questionnaire with visible progress. */
export function ProfileQuiz({ initial, onDone, submitLabel = "Voir mon programme", compact }: { initial?: Partial<Profile>; onDone: (p: Profile) => void; submitLabel?: string; compact?: boolean }) {
  const [p, setP] = useState<Profile>({ ...DEFAULT_PROFILE, equipment: [], ...initial });
  const [i, setI] = useState(0);
  const q = QUESTIONS[i];
  const last = i === QUESTIONS.length - 1;

  const choose = (val: unknown) => {
    if (q.multi) {
      const eq = p.equipment.includes(val as never) ? p.equipment.filter((e) => e !== val) : [...p.equipment, val as never];
      setP({ ...p, equipment: eq });
      return;
    }
    setP({ ...p, [q.key]: val } as Profile);
    if (!last) setTimeout(() => setI((x) => x + 1), 180);
  };
  const selected = (val: unknown) => (q.multi ? p.equipment.includes(val as never) : (p as unknown as Record<string, unknown>)[q.key] === val);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-mute">Question {i + 1}/{QUESTIONS.length}</p>
        {i > 0 && <button onClick={() => setI(i - 1)} className="focus-ring font-mono text-xs uppercase tracking-[0.14em] text-bone/70 hover:text-bone">← Retour</button>}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {QUESTIONS.map((_, k) => <span key={k} className={cn("h-1 flex-1 rounded-full transition-colors", k <= i ? "bg-volt" : "bg-line")} />)}
      </div>
      <AnimatePresence mode="wait">
        <motion.fieldset key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mt-6">
          <legend className={cn("font-bold tracking-tight [font-stretch:85%]", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>{q.q}</legend>
          {q.multi && <p className="mt-2 text-sm text-mute">Plusieurs choix possibles. Rien ? Laisse vide : tout fonctionne au poids du corps.</p>}
          <div className={cn("mt-5 grid gap-2", q.options.length > 4 ? "sm:grid-cols-2" : "")}>
            {q.options.map(([val, label]) => (
              <button key={String(val)} type="button" role={q.multi ? "checkbox" : "radio"} aria-checked={selected(val)} onClick={() => choose(val)}
                className={cn("focus-ring flex min-h-14 items-center justify-between rounded-2xl border px-5 py-3 text-left text-[15px] transition-colors", selected(val) ? "border-volt bg-volt/10 text-bone" : "border-line hover:border-bone/30")}>
                {label}
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center border", q.multi ? "rounded-md" : "rounded-full", selected(val) ? "border-volt bg-volt" : "border-bone/30")}>
                  {selected(val) && <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
                </span>
              </button>
            ))}
          </div>
        </motion.fieldset>
      </AnimatePresence>
      {last && (
        <Button className="mt-6 w-full sm:w-auto" size="lg" arrow onClick={() => onDone(p)}>{submitLabel}</Button>
      )}
    </div>
  );
}
