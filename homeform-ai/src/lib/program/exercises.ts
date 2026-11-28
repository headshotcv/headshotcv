import type { DemoKey } from "./poses";

export type Equipment = "none" | "chair" | "mat" | "band" | "dumbbells" | "bar";
export type Pattern = "legs" | "push" | "pull" | "core" | "posterior" | "conditioning";

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  level: 1 | 2 | 3;
  equipment: Equipment[]; // all required
  unit: "reps" | "seconds";
  /** base prescription per level 1/2/3 */
  base: [number, number, number];
  instructions: string[];
  cue: string;
  easier?: string; // exercise id
  demo?: DemoKey;
  analysable?: boolean;
}

export const EXERCISES: Exercise[] = [
  { id: "squat", name: "Squat au poids du corps", pattern: "legs", level: 1, equipment: [], unit: "reps", base: [10, 14, 20], demo: "squat", analysable: true, easier: "chair-squat",
    instructions: ["Pieds à largeur d'épaules, pointes légèrement ouvertes.", "Descends en poussant les hanches vers l'arrière et en fléchissant les genoux.", "Garde les talons au sol et la poitrine orientée vers l'avant.", "Remonte en poussant dans tout le pied."], cue: "Descends en 2 secondes, remonte en 1." },
  { id: "chair-squat", name: "Squat sur chaise", pattern: "legs", level: 1, equipment: ["chair"], unit: "reps", base: [10, 12, 15], demo: "chair-squat",
    instructions: ["Place une chaise stable derrière toi.", "Descends lentement jusqu'à effleurer l'assise sans t'y poser.", "Remonte en poussant dans les talons."], cue: "Effleure, ne t'assois pas." },
  { id: "wall-sit", name: "Chaise contre le mur", pattern: "legs", level: 1, equipment: [], unit: "seconds", base: [20, 35, 50], demo: "wall-sit", easier: "chair-squat",
    instructions: ["Dos contre un mur, descends jusqu'à ce que les cuisses soient proches de l'horizontale.", "Genoux au-dessus des chevilles.", "Respire calmement pendant le maintien."], cue: "Remonte un peu si c'est trop intense." },
  { id: "reverse-lunge", name: "Fente arrière", pattern: "legs", level: 2, equipment: [], unit: "reps", base: [6, 10, 12], demo: "lunge", easier: "squat",
    instructions: ["Debout, fais un grand pas en arrière.", "Descends le genou arrière vers le sol, buste droit.", "Pousse sur la jambe avant pour revenir.", "Répétitions indiquées par jambe."], cue: "Le genou avant reste aligné avec le pied." },
  { id: "calf-raise", name: "Montées sur pointes", pattern: "legs", level: 1, equipment: [], unit: "reps", base: [12, 18, 25], demo: "calf-raise",
    instructions: ["Debout, appuie-toi légèrement à un mur si besoin.", "Monte sur la pointe des pieds le plus haut possible.", "Marque une seconde en haut puis redescends lentement."], cue: "Monte haut, descends lentement." },
  { id: "glute-bridge", name: "Pont fessier", pattern: "posterior", level: 1, equipment: [], unit: "reps", base: [12, 15, 20], demo: "glute-bridge",
    instructions: ["Allongé sur le dos, genoux fléchis, pieds à plat.", "Pousse dans les talons pour monter le bassin.", "Serre les fessiers en haut, sans cambrer le bas du dos.", "Redescends lentement."], cue: "Une seconde de pause en haut." },
  { id: "superman", name: "Superman", pattern: "posterior", level: 1, equipment: [], unit: "reps", base: [8, 12, 15], demo: "superman",
    instructions: ["Allongé sur le ventre, bras tendus devant.", "Décolle légèrement bras, poitrine et jambes du sol.", "Regarde le sol pour garder la nuque neutre.", "Redescends doucement."], cue: "Petit mouvement, contrôlé." },
  { id: "pushup", name: "Pompes", pattern: "push", level: 2, equipment: [], unit: "reps", base: [5, 10, 15], demo: "pushup", analysable: true, easier: "knee-pushup",
    instructions: ["Mains un peu plus larges que les épaules.", "Corps aligné des épaules aux chevilles, abdos et fessiers serrés.", "Descends la poitrine vers le sol, coudes à environ 45° du corps.", "Pousse jusqu'à tendre les bras."], cue: "Le corps bouge d'un seul bloc." },
  { id: "knee-pushup", name: "Pompes sur les genoux", pattern: "push", level: 1, equipment: [], unit: "reps", base: [6, 10, 14], demo: "knee-pushup", easier: "incline-pushup",
    instructions: ["Genoux au sol, corps aligné des épaules aux genoux.", "Descends la poitrine entre les mains.", "Pousse jusqu'à tendre les bras."], cue: "Hanches dans l'alignement." },
  { id: "incline-pushup", name: "Pompes inclinées", pattern: "push", level: 1, equipment: ["chair"], unit: "reps", base: [8, 12, 15], demo: "incline-pushup",
    instructions: ["Mains sur un canapé, une table ou une chaise calée contre un mur.", "Corps aligné, descends la poitrine vers le support.", "Pousse jusqu'à tendre les bras.", "Plus le support est haut, plus c'est facile."], cue: "Support stable uniquement." },
  { id: "pike-pushup", name: "Pompes piquées", pattern: "push", level: 3, equipment: [], unit: "reps", base: [4, 6, 10], demo: "pike-pushup", easier: "pushup",
    instructions: ["Position en V inversé, hanches hautes.", "Fléchis les coudes pour approcher la tête du sol, devant les mains.", "Pousse pour revenir."], cue: "Travaille les épaules." },
  { id: "chair-dip", name: "Dips sur chaise", pattern: "push", level: 2, equipment: ["chair"], unit: "reps", base: [6, 10, 14], demo: "chair-dip", easier: "knee-pushup",
    instructions: ["Mains sur le bord d'une chaise stable calée contre un mur.", "Fléchis les coudes vers l'arrière pour descendre.", "Arrête-toi si tu ressens une gêne à l'avant de l'épaule.", "Pousse pour remonter."], cue: "Amplitude confortable uniquement." },
  { id: "plank", name: "Planche sur les mains", pattern: "core", level: 1, equipment: [], unit: "seconds", base: [20, 35, 50], demo: "plank",
    instructions: ["Position haute de pompe, mains sous les épaules.", "Serre abdos et fessiers, corps aligné.", "Respire sans bloquer."], cue: "Ligne droite des épaules aux chevilles." },
  { id: "mountain-climber", name: "Mountain climbers", pattern: "conditioning", level: 2, equipment: [], unit: "seconds", base: [20, 30, 40], demo: "mountain-climber", easier: "plank",
    instructions: ["Position haute de pompe.", "Ramène un genou vers la poitrine puis alterne.", "Garde les hanches basses et stables."], cue: "Rythme régulier plutôt que rapide." },
  { id: "band-row", name: "Tirage à l'élastique", pattern: "pull", level: 1, equipment: ["band"], unit: "reps", base: [12, 15, 20],
    instructions: ["Fixe l'élastique à une poignée de porte fermée ou autour des pieds.", "Tire les coudes vers l'arrière en serrant les omoplates.", "Reviens lentement."], cue: "Épaules basses, loin des oreilles." },
  { id: "db-row", name: "Rowing haltère", pattern: "pull", level: 1, equipment: ["dumbbells"], unit: "reps", base: [10, 12, 15],
    instructions: ["Une main en appui sur une chaise, dos plat.", "Tire l'haltère vers la hanche.", "Redescends lentement. Répétitions par bras."], cue: "Le dos reste immobile." },
  { id: "db-goblet-squat", name: "Squat goblet", pattern: "legs", level: 2, equipment: ["dumbbells"], unit: "reps", base: [8, 12, 15], demo: "squat", easier: "squat",
    instructions: ["Tiens un haltère contre la poitrine.", "Descends comme un squat, coudes entre les genoux.", "Remonte en poussant dans tout le pied."], cue: "Poitrine fière." },
  { id: "negative-pullup", name: "Tractions négatives", pattern: "pull", level: 2, equipment: ["bar"], unit: "reps", base: [3, 5, 6],
    instructions: ["Monte menton au-dessus de la barre à l'aide d'une chaise.", "Descends le plus lentement possible (3–5 s).", "Repose les pieds et recommence."], cue: "Descente lente et contrôlée." },
  { id: "pullup", name: "Tractions", pattern: "pull", level: 3, equipment: ["bar"], unit: "reps", base: [3, 5, 8], easier: "negative-pullup",
    instructions: ["Mains en pronation, un peu plus larges que les épaules.", "Tire jusqu'à passer le menton au-dessus de la barre.", "Redescends bras tendus."], cue: "Pas d'élan." },
  { id: "towel-row", name: "Tirage isométrique à la serviette", pattern: "pull", level: 1, equipment: [], unit: "seconds", base: [15, 20, 30],
    instructions: ["Assis, une serviette sous les pieds, une extrémité dans chaque main.", "Tire fort vers toi en serrant les omoplates, sans bouger.", "Maintiens la tension en respirant."], cue: "Tension progressive, sans à-coup." },
];

export const byId = (id: string) => EXERCISES.find((e) => e.id === id);
