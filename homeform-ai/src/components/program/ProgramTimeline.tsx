"use client";
import { useState } from "react";
import type { Program } from "@/lib/program/generate";
import { byId } from "@/lib/program/exercises";
import { cn } from "@/lib/cn";

export function fmtTarget(p: { target: number; unit: "reps" | "seconds" }) {
  if (p.target === 0) return "max";
  return p.unit === "reps" ? `${p.target} rép.` : `${p.target} s`;
}

/** Multi-week program overview: week rail + sessions of the selected week. */
export function ProgramTimeline({ program, onOpenSession }: { program: Program; onOpenSession?: (weekIdx: number, sessionId: string) => void }) {
  const [w, setW] = useState(0);
  const week = program.weeks[w];
  return (
    <div>
      <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Semaines">
        {program.weeks.map((wk, i) => (
          <button key={wk.index} role="tab" aria-selected={w === i} onClick={() => setW(i)} className={cn("focus-ring rounded-2xl border p-3 text-left transition-colors sm:p-4", w === i ? "border-volt bg-volt text-ink" : "border-line hover:border-bone/30")}>
            <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", w === i ? "text-ink/70" : "text-mute")}>Sem.</span>
            <span className="display block text-4xl sm:text-5xl">{wk.index}</span>
            <span className={cn("mt-1 hidden text-xs sm:block", w === i ? "text-ink/80" : "text-bone/60")}>{wk.theme}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-bone/60 sm:hidden">{week.theme}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {week.sessions.map((s) => (
          <article key={s.id} className="flex flex-col rounded-2xl border border-line bg-ink-2 p-5">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-bold tracking-tight [font-stretch:85%]">{s.title}</h4>
              <span className="font-mono text-xs text-mute">~{s.estMinutes} min</span>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-volt">{s.focus}</p>
            <ul className="mt-4 flex-1 divide-y divide-line">
              {s.items.map((it, k) => (
                <li key={k} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                  <span className="text-bone/90">{byId(it.exerciseId)?.name}</span>
                  <span className="shrink-0 font-mono text-xs text-bone/60 tabular">{it.sets} × {fmtTarget(it)}</span>
                </li>
              ))}
            </ul>
            {onOpenSession && <button onClick={() => onOpenSession(w, s.id)} className="focus-ring mt-4 rounded-full border border-line py-2.5 text-sm hover:border-volt hover:text-volt">Voir la séance</button>}
          </article>
        ))}
      </div>
    </div>
  );
}
