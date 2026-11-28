/** Motivation layer computed from real activity only (sessions, analyses, assessments, challenges). */
import type { AccountData } from "@/lib/store/types";

const DAY = 86400000;
export const TIERS = [
  { weeks: 1, name: "Lancé" },
  { weeks: 3, name: "Régulier" },
  { weeks: 6, name: "Solide" },
  { weeks: 12, name: "Inarrêtable" },
  { weeks: 26, name: "Pilier" },
] as const;

export const XP = { session: 100, set: 10, analysis: 50, assessment: 150, challenge: 30 };
const LEVEL_XP = 500;

export function weekStart(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

export function computeXp(d: AccountData) {
  const sets = d.logs.reduce((s, l) => s + l.items.reduce((a, i) => a + i.sets.filter((x) => x.done > 0).length, 0), 0);
  const xp = d.logs.length * XP.session + sets * XP.set + d.analyses.filter((a) => a.status !== "rejected").length * XP.analysis + d.assessments.length * XP.assessment + d.challenges.length * XP.challenge;
  return { xp, level: Math.floor(xp / LEVEL_XP) + 1, into: xp % LEVEL_XP, next: LEVEL_XP };
}

/** Weekly commitment streak: consecutive weeks where the weekly goal was met. */
export function weeklyStreak(d: AccountData, now = new Date()) {
  const goal = d.profile?.days ?? 3;
  const counts = new Map<number, number>();
  for (const l of d.logs) { const k = weekStart(new Date(l.createdAt)).getTime(); counts.set(k, (counts.get(k) ?? 0) + 1); }
  const thisWeek = weekStart(now).getTime();
  const thisCount = counts.get(thisWeek) ?? 0;
  let current = 0;
  for (let w = thisWeek - 7 * DAY; (counts.get(w) ?? 0) >= goal; w -= 7 * DAY) current++;
  if (thisCount >= goal) current++;
  let best = 0, run = 0;
  const weeks = [...counts.keys()].sort((a, b) => a - b);
  if (weeks.length) for (let w = weeks[0]; w <= thisWeek; w += 7 * DAY) { if ((counts.get(w) ?? 0) >= goal) { run++; best = Math.max(best, run); } else run = 0; }
  const tier = [...TIERS].reverse().find((t) => current >= t.weeks) ?? null;
  const nextTier = TIERS.find((t) => t.weeks > current) ?? null;
  return { goal, thisCount, current, best: Math.max(best, current), tier, nextTier };
}

export const CHALLENGES = [
  { id: "plank-30", title: "30 s de planche", detail: "Position haute de pompe, corps aligné, 30 secondes d’affilée." },
  { id: "squat-20", title: "20 squats contrôlés", detail: "Descends en 2 secondes, remonte en 1. Pause si besoin." },
  { id: "pushup-incline-10", title: "10 pompes inclinées", detail: "Mains sur un support stable, corps gainé." },
  { id: "wallsit-40", title: "40 s de chaise contre le mur", detail: "Genoux au-dessus des chevilles, dos plaqué." },
  { id: "bridge-15", title: "15 ponts fessiers", detail: "Une seconde de pause en haut à chaque répétition." },
  { id: "analysis", title: "Analyse une série", detail: "Filme 3 à 10 squats ou pompes de profil et lance l’analyse." },
  { id: "mobility-5", title: "5 minutes de mobilité", detail: "Cercles de bras, fentes lentes, rotations du buste." },
] as const;

export function dailyChallenge(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { date: key, ...CHALLENGES[h % CHALLENGES.length] };
}
