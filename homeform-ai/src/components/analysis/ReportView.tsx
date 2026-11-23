"use client";
import type { AnalysisResult, Observation } from "@/lib/analysis/types";
import { cn } from "@/lib/cn";

const KIND = {
  improve: { label: "À travailler", cls: "text-flare", bar: "bg-flare" },
  strength: { label: "Point fort", cls: "text-volt", bar: "bg-volt" },
  info: { label: "Observation", cls: "text-bone/70", bar: "bg-bone/40" },
} as const;

export const EXERCISE_LABEL = { squat: "Squat au poids du corps", pushup: "Pompes" } as const;

function fmtT(t: number) {
  const s = Math.max(0, t);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}.${Math.floor((s % 1) * 10)}`;
}

export function ObservationCard({ o, onSeek, compact }: { o: Observation; onSeek?: (t: number) => void; compact?: boolean }) {
  const k = KIND[o.kind];
  return (
    <article className="relative overflow-hidden rounded-2xl border border-line bg-ink-2 p-5">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", k.bar)} />
      <div className="flex items-center justify-between gap-3">
        <p className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", k.cls)}>{k.label}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Fiabilité {o.confidence}</p>
      </div>
      <h4 className="mt-2 text-lg font-semibold leading-snug">{o.title}</h4>
      {!compact && <p className="mt-2 text-[15px] leading-relaxed text-bone/75">{o.detail}</p>}
      <p className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs leading-relaxed text-bone/80">{o.evidence}</p>
      {o.moments.length > 0 && onSeek && (
        <div className="mt-3 flex flex-wrap gap-2">
          {o.moments.slice(0, 6).map((m) => (
            <button key={m} onClick={() => onSeek(m)} className="focus-ring rounded-full border border-line px-3 py-1 font-mono text-[11px] text-bone/80 hover:border-volt hover:text-volt">
              ▸ {fmtT(m)}
            </button>
          ))}
        </div>
      )}
      {o.drill && !compact && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="eyebrow !text-volt">Exercice proposé</p>
          <p className="mt-1 font-semibold">{o.drill.name}</p>
          <p className="mt-1 text-sm text-bone/70">{o.drill.how}</p>
        </div>
      )}
    </article>
  );
}

export function QualityList({ result }: { result: AnalysisResult }) {
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line">
      {result.quality.map((q) => (
        <li key={q.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
          <span className="text-bone/70">{q.label}</span>
          <span className={cn("text-right", q.status === "ok" ? "text-bone" : q.status === "warn" ? "text-amber-300" : "text-flare")}>
            {q.status === "ok" ? "✓ " : q.status === "warn" ? "! " : "✕ "}
            {q.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SummaryGrid({ result }: { result: AnalysisResult }) {
  const s = result.summary;
  const items = [
    ["Exercice", result.exercise ? EXERCISE_LABEL[result.exercise] : "—"],
    ["Répétitions", String(s.repCount)],
    [result.exercise === "pushup" ? "Coude · point bas" : "Genou · point bas", s.avgMinAngle !== null ? `${Math.round(s.avgMinAngle)}° moy.` : "—"],
    ["Régularité amplitude", s.minAngleSpread !== null ? `± ${s.minAngleSpread}°` : "—"],
    ["Durée / répétition", s.avgRepDuration !== null ? `${s.avgRepDuration} s` : "—"],
    ["Vue", result.view],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
      {items.map(([k, v]) => (
        <div key={k} className="bg-ink-2 p-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{k}</dt>
          <dd className="mt-1 text-lg font-semibold tabular first-letter:uppercase">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RepTable({ result, onSeek }: { result: AnalysisResult; onSeek?: (t: number) => void }) {
  const sq = result.exercise === "squat";
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[480px] text-left text-sm tabular">
        <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-normal">Rép.</th>
            <th className="px-4 py-3 font-normal">{sq ? "Genou bas" : "Coude bas"}</th>
            <th className="px-4 py-3 font-normal">{sq ? "Buste / vert." : "Alignement"}</th>
            <th className="px-4 py-3 font-normal">Descente</th>
            <th className="px-4 py-3 font-normal">Montée</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody>
          {result.reps.map((r) => (
            <tr key={r.index} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold">{r.index}</td>
              <td className="px-4 py-3">{Math.round(r.minAngle)}°</td>
              <td className="px-4 py-3">{Number.isNaN(r.secondary) || r.secondary === null ? "—" : `${Math.round(r.secondary)}°`}</td>
              <td className="px-4 py-3">{r.descent} s</td>
              <td className="px-4 py-3">{r.ascent} s</td>
              <td className="px-4 py-3 text-right">{onSeek && <button onClick={() => onSeek(r.bottom)} className="focus-ring font-mono text-xs text-volt hover:underline">voir ▸</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Limitations({ result }: { result: AnalysisResult }) {
  return (
    <details className="group rounded-2xl border border-line p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
        Limites de cette analyse
        <span className="font-mono text-mute transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-bone/70">
        {result.limitations.map((l) => (
          <li key={l} className="flex gap-3"><span className="text-mute">—</span>{l}</li>
        ))}
      </ul>
    </details>
  );
}
