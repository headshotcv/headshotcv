"use client";
import { useMemo, useState } from "react";
import type { AccountData } from "@/lib/store/types";
import { byId } from "@/lib/program/exercises";
import { cn } from "@/lib/cn";

const DAY = 86400000;
function startOfWeek(d: Date) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x; }

export function useProgressStats(data: AccountData, now = new Date()) {
  return useMemo(() => {
    const logs = data.logs;
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = startOfWeek(new Date(now.getTime() - (7 - i) * 7 * DAY));
      const end = new Date(start.getTime() + 7 * DAY);
      const n = logs.filter((l) => { const t = new Date(l.createdAt); return t >= start && t < end; }).length;
      return { start, n };
    });
    const days = new Set(logs.map((l) => new Date(l.createdAt).toDateString()));
    const heat = Array.from({ length: 56 }, (_, i) => { const d = new Date(startOfWeek(now).getTime() - 49 * DAY + i * DAY); return { d, on: days.has(d.toDateString()), future: d > now }; });
    // best set per exercise per session → progression
    const byEx = new Map<string, { t: number; best: number }[]>();
    for (const l of [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      for (const it of l.items) {
        const best = Math.max(0, ...it.sets.map((s) => s.done));
        if (!byEx.has(it.exerciseId)) byEx.set(it.exerciseId, []);
        byEx.get(it.exerciseId)!.push({ t: new Date(l.createdAt).getTime(), best });
      }
    }
    const totalReps = logs.reduce((s, l) => s + l.items.filter((i) => i.unit === "reps").reduce((a, i) => a + i.sets.reduce((b, x) => b + x.done, 0), 0), 0);
    const target = data.profile?.days ?? 3;
    const thisWeek = weeks[7].n;
    const regular = weeks.filter((w) => w.n >= target).length;
    return { weeks, heat, byEx, totalReps, thisWeek, target, regular, sessions: logs.length };
  }, [data, now]);
}

export function WeeklyBars({ weeks, target }: { weeks: { start: Date; n: number }[]; target: number }) {
  const max = Math.max(target, ...weeks.map((w) => w.n), 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[10px] text-mute tabular">{w.n}</span>
            <div className={cn("w-full rounded-t-md", w.n >= target ? "bg-volt" : w.n > 0 ? "bg-bone/40" : "bg-line")} style={{ height: `${Math.max(4, (w.n / max) * 120)}px` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">{weeks.map((w, i) => <span key={i} className="flex-1 text-center font-mono text-[9px] text-mute">{i === 7 ? "cette sem." : `S-${7 - i}`}</span>)}</div>
    </div>
  );
}

export function Heatmap({ heat }: { heat: { d: Date; on: boolean; future: boolean }[] }) {
  return (
    <div>
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1.5">
        {heat.map((h, i) => <span key={i} title={h.d.toLocaleDateString("fr-FR")} className={cn("h-3.5 w-3.5 rounded-[3px] sm:h-4 sm:w-4", h.future ? "bg-transparent" : h.on ? "bg-volt" : "bg-white/[0.06]")} />)}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">8 dernières semaines · une case = un jour</p>
    </div>
  );
}

export function RepProgress({ byEx }: { byEx: Map<string, { t: number; best: number }[]> }) {
  const ids = [...byEx.keys()].filter((k) => (byEx.get(k)?.length ?? 0) >= 2);
  const [sel, setSel] = useState(ids[0]);
  const id = ids.includes(sel) ? sel : ids[0];
  if (!id) return <p className="text-sm text-mute">Enregistre au moins deux séances pour voir ta courbe de progression.</p>;
  const pts = byEx.get(id)!;
  const unit = byId(id)?.unit === "seconds" ? "s" : "rép.";
  const W = 600, H = 170, pad = 24;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t || t0 + 1;
  const vmax = Math.max(...pts.map((p) => p.best)) * 1.15, vmin = 0;
  const x = (t: number) => pad + ((t - t0) / Math.max(1, t1 - t0)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - vmin) / (vmax - vmin || 1)) * (H - pad * 2);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.best).toFixed(1)}`).join(" ");
  const first = pts[0].best, last = pts[pts.length - 1].best;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ids.map((k) => <button key={k} onClick={() => setSel(k)} className={cn("focus-ring rounded-full border px-3 py-1.5 text-xs", k === id ? "border-volt text-volt" : "border-line text-bone/70")}>{byId(k)?.name ?? k}</button>)}
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="display text-5xl tabular">{last}</span><span className="text-mute">{unit} · meilleure série</span>
        <span className={cn("ml-auto font-mono text-sm", last >= first ? "text-volt" : "text-flare")}>{last - first >= 0 ? "+" : ""}{last - first} depuis le début</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={`Progression : ${byId(id)?.name}`}>
        <path d={`${path} L${x(t1)},${H - pad} L${x(t0)},${H - pad} Z`} fill="rgb(212 255 58 / 0.08)" />
        <path d={path} fill="none" stroke="var(--color-volt)" strokeWidth={2.2} strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={x(p.t)} cy={y(p.best)} r={2.5} fill="var(--color-volt)" />)}
        <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} stroke="rgb(242 239 232 / 0.12)" />
      </svg>
    </div>
  );
}
