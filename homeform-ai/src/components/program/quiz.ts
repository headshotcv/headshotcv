import type { Equipment } from "@/lib/program/exercises";
import type { Goal, Level, Profile } from "@/lib/program/generate";

export const QUESTIONS = [
  { key: "goal", q: "Quel est ton objectif ?", multi: false, options: [["debuter", "Débuter la musculation"], ["renforcement", "Renforcement musculaire"], ["haut", "Haut du corps"], ["bas", "Bas du corps"], ["fullbody", "Full body sans matériel"], ["pompes", "Progresser aux pompes"]] as [Goal, string][] },
  { key: "level", q: "Quel est ton niveau ?", multi: false, options: [[1, "Débutant · moins de 3 mois"], [2, "Intermédiaire · régulier"], [3, "Avancé · 10+ pompes propres"]] as [Level, string][] },
  { key: "days", q: "Combien de jours par semaine ?", multi: false, options: [[2, "2 jours"], [3, "3 jours"], [4, "4 jours"], [5, "5 jours"]] as [Profile["days"], string][] },
  { key: "minutes", q: "Combien de minutes par séance ?", multi: false, options: [[15, "15 min"], [25, "25 min"], [40, "40 min"]] as [Profile["minutes"], string][] },
  { key: "equipment", q: "Quel matériel as-tu ?", multi: true, options: [["chair", "Une chaise stable"], ["mat", "Un tapis"], ["band", "Un élastique"], ["dumbbells", "Des haltères"], ["bar", "Une barre de traction"]] as [Equipment, string][] },
] as const;

export const DEFAULT_PROFILE: Profile = { goal: "debuter", level: 1, days: 3, minutes: 25, equipment: ["chair", "mat"] };
