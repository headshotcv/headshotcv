import { EXERCISES, byId, type Equipment, type Exercise, type Pattern } from "./exercises";

export type Goal = "debuter" | "renforcement" | "haut" | "bas" | "fullbody" | "pompes";
export type Level = 1 | 2 | 3;

export interface Profile {
  goal: Goal;
  level: Level;
  days: 2 | 3 | 4 | 5;
  minutes: 15 | 25 | 40;
  equipment: Equipment[];
}

export interface Prescription {
  exerciseId: string;
  sets: number;
  target: number; // reps or seconds
  unit: "reps" | "seconds";
  rest: number; // seconds
  note?: string;
}

export interface Session { id: string; title: string; focus: string; items: Prescription[]; estMinutes: number }
export interface Week { index: number; theme: string; sessions: Session[] }
export interface Program { id: string; title: string; summary: string; profile: Profile; weeks: Week[]; createdAt: string }

export const GOALS: Record<Goal, { title: string; summary: string }> = {
  debuter: { title: "Débuter la musculation chez soi", summary: "Apprendre les mouvements de base, poser une routine régulière et construire une première base de force." },
  renforcement: { title: "Renforcement musculaire", summary: "Renforcer l'ensemble du corps avec une progression régulière du volume." },
  haut: { title: "Haut du corps", summary: "Priorité aux poussées, aux tirages et au gainage, avec un entretien des jambes." },
  bas: { title: "Bas du corps", summary: "Priorité aux jambes et aux fessiers : squats, fentes, ponts et maintiens." },
  fullbody: { title: "Full body sans matériel", summary: "Des séances complètes qui sollicitent tout le corps, sans matériel." },
  pompes: { title: "Progression aux pompes", summary: "Une échelle de variantes pour progresser vers des pompes complètes et plus nombreuses." },
};

const has = (eq: Equipment[], ex: Exercise) => ex.equipment.every((e) => eq.includes(e));

function pick(pattern: Pattern, profile: Profile, exclude: Set<string>): Exercise | undefined {
  const pool = EXERCISES.filter((e) => e.pattern === pattern && has(profile.equipment, e) && e.level <= profile.level && !exclude.has(e.id));
  // prefer the hardest variant allowed for the level, then analysable ones
  pool.sort((a, b) => b.level - a.level || Number(!!b.analysable) - Number(!!a.analysable));
  return pool[0];
}

/** Push-up ladder for the "pompes" goal. */
function pushVariant(level: Level, eq: Equipment[]): string {
  if (level === 1) return eq.includes("chair") ? "incline-pushup" : "knee-pushup";
  if (level === 2) return "pushup";
  return "pushup";
}

const SPLITS: Record<Goal, Pattern[][]> = {
  debuter: [["legs", "push", "posterior", "core"], ["legs", "pull", "push", "core"]],
  renforcement: [["legs", "push", "pull", "posterior", "core"], ["legs", "push", "pull", "conditioning", "core"]],
  haut: [["push", "pull", "push", "core"], ["push", "pull", "legs", "core"]],
  bas: [["legs", "posterior", "legs", "core"], ["legs", "legs", "posterior", "push"]],
  fullbody: [["legs", "push", "posterior", "conditioning", "core"], ["legs", "push", "pull", "core", "conditioning"]],
  pompes: [["push", "core", "push", "legs"], ["push", "pull", "push", "core"]],
};

function prescribe(ex: Exercise, level: Level, week: number, profile: Profile): Prescription {
  const base = ex.base[level - 1];
  // progression: +1 rep / +5 s per week, week 4 = consolidation (same as week 3)
  const w = Math.min(week, 3) - 1;
  const target = ex.unit === "reps" ? base + w * (level === 1 ? 1 : 2) : base + w * 5;
  const sets = profile.minutes === 15 ? 2 : profile.minutes === 25 ? 3 : week >= 3 ? 4 : 3;
  const rest = ex.pattern === "conditioning" || ex.pattern === "core" ? 45 : level === 3 ? 90 : 60;
  return { exerciseId: ex.id, sets, target, unit: ex.unit, rest, note: ex.easier ? `Trop difficile ? Remplace par : ${byId(ex.easier)?.name}.` : undefined };
}

function estimate(items: Prescription[]): number {
  let s = 300; // échauffement 5 min
  for (const p of items) {
    const work = p.unit === "reps" ? p.target * 3 : p.target;
    s += p.sets * (work + p.rest);
  }
  return Math.round(s / 60);
}

export function generateProgram(profile: Profile): Program {
  const meta = GOALS[profile.goal];
  const maxItems = profile.minutes === 15 ? 3 : profile.minutes === 25 ? 4 : 5;
  const themes = ["Prise en main", "Volume", "Intensité", "Consolidation et test"];
  const weeks: Week[] = [1, 2, 3, 4].map((wk) => {
    const sessions: Session[] = Array.from({ length: profile.days }, (_, d) => {
      const split = SPLITS[profile.goal][d % 2];
      const used = new Set<string>();
      const items: Prescription[] = [];
      for (const pattern of split) {
        if (items.length >= maxItems) break;
        let ex: Exercise | undefined;
        if (profile.goal === "pompes" && pattern === "push") {
          const id = items.some((i) => byId(i.exerciseId)?.pattern === "push") ? (profile.level >= 2 ? "knee-pushup" : "plank") : pushVariant(profile.level, profile.equipment);
          ex = byId(id);
          if (ex && used.has(ex.id)) ex = pick(pattern, profile, used);
        } else {
          ex = pick(pattern, profile, used);
        }
        if (!ex) {
          // no-equipment pulling fallback
          if (pattern === "pull") ex = byId("towel-row");
          else continue;
        }
        if (!ex || used.has(ex.id)) continue;
        used.add(ex.id);
        items.push(prescribe(ex, profile.level, wk, profile));
      }
      // trim until it fits the time budget
      while (items.length > 2 && estimate(items) > profile.minutes + 4) items.pop();
      while (estimate(items) > profile.minutes + 4 && items.some((i) => i.sets > 2)) items.forEach((i) => { if (i.sets > 2) i.sets--; });
      const focusMap: Record<Pattern, string> = { legs: "Jambes", push: "Poussée", pull: "Tirage", core: "Gainage", posterior: "Chaîne postérieure", conditioning: "Cardio" };
      const focus = [...new Set(items.map((i) => focusMap[byId(i.exerciseId)!.pattern]))].slice(0, 3).join(" · ");
      if (wk === 4 && d === profile.days - 1) {
        const testEx = profile.goal === "bas" ? "squat" : "pushup";
        const exT = byId(profile.level === 1 && testEx === "pushup" ? pushVariant(1, profile.equipment) : testEx)!;
        items.unshift({ exerciseId: exT.id, sets: 1, target: 0, unit: "reps", rest: 120, note: "Test : un maximum de répétitions propres. Note ton résultat pour mesurer ta progression." });
      }
      return { id: `w${wk}s${d + 1}`, title: `Séance ${String.fromCharCode(65 + (d % 26))}`, focus, items, estMinutes: estimate(items) };
    });
    return { index: wk, theme: themes[wk - 1], sessions };
  });
  return { id: `p_${Date.now().toString(36)}`, title: meta.title, summary: meta.summary, profile, weeks, createdAt: new Date().toISOString() };
}
