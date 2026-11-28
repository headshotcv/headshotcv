import type { AnalysisResult, ExerciseId, Observation, PoseFrame, RepMetrics, SeriesPoint, VideoMeta } from "./types.ts";
import { sideIdx } from "./landmarks.ts";
import { angle, lineDeviation, mean, median, std, toPoint } from "./geometry.ts";
import { smooth } from "./signal.ts";
import { segmentReps } from "./reps.ts";
import { classifyExercise, estimateView, pickSide, stanceSpread, torsoInclination } from "./classify.ts";
import { assessQuality, REJECTION_TEXT } from "./quality.ts";
import { THRESHOLDS as T } from "./thresholds.ts";

const BASE_LIMITATIONS = [
  "Les angles sont estimés en 2D à partir de la vidéo : ils dépendent de l'angle de la caméra et peuvent s'écarter de quelques degrés de la réalité.",
  "L'analyse décrit uniquement ce qui est visible (positions, amplitude, rythme). Elle ne mesure ni la force, ni la douleur, ni l'activation musculaire.",
  "HOMEFORM ne détecte pas de blessure et ne pose aucun diagnostic. En cas de douleur, arrête l'exercice et consulte un professionnel de santé.",
  "Les seuils utilisés sont indicatifs et en cours de validation avec des professionnels qualifiés.",
];

const VIS = T.detection.minVisibility;

/** Primary + secondary per-frame measures for the chosen exercise and side. */
function measure(frames: PoseFrame[], exercise: ExerciseId, side: "left" | "right", aspect: number) {
  const j = sideIdx(side);
  const primary: (number | null)[] = [];
  const secondary: (number | null)[] = [];
  for (const f of frames) {
    const lm = f.landmarks;
    if (!lm) { primary.push(null); secondary.push(null); continue; }
    const p = (i: number) => toPoint(lm[i], aspect);
    if (exercise === "squat") {
      const ok = [j.hip, j.knee, j.ankle].every((i) => lm[i].visibility >= VIS);
      primary.push(ok ? angle(p(j.hip), p(j.knee), p(j.ankle)) : null);
      // trunk lean from vertical = 90 - inclination from horizontal
      secondary.push(lm[j.shoulder].visibility >= VIS && lm[j.hip].visibility >= VIS ? 90 - torsoInclination(lm, aspect) : null);
    } else {
      const ok = [j.shoulder, j.elbow, j.wrist].every((i) => lm[i].visibility >= VIS);
      primary.push(ok ? angle(p(j.shoulder), p(j.elbow), p(j.wrist)) : null);
      const okLine = [j.shoulder, j.hip, j.ankle].every((i) => lm[i].visibility >= VIS);
      secondary.push(okLine ? lineDeviation(p(j.shoulder), p(j.hip), p(j.ankle)) : null);
    }
  }
  return { primary: smooth(primary), secondary: smooth(secondary) };
}

const r0 = (x: number) => Math.round(x);
const r1 = (x: number) => Math.round(x * 10) / 10;

function share(n: number, total: number) {
  return n === total ? "Sur toutes les répétitions" : n > total / 2 ? "Sur la plupart des répétitions" : "Sur la moitié des répétitions";
}

function repsLabel(idx: number[]): string {
  if (idx.length === 0) return "";
  return idx.length === 1 ? `répétition ${idx[0]}` : `répétitions ${idx.join(", ")}`;
}

function observationsFor(exercise: ExerciseId, reps: RepMetrics[], view: AnalysisResult["view"]): Observation[] {
  const obs: Observation[] = [];
  const mins = reps.map((r) => r.minAngle);
  const tops = reps.map((r) => r.topAngle);
  const durations = reps.map((r) => r.end - r.start);
  const descents = reps.map((r) => r.descent);
  const conf: Observation["confidence"] = view === "profil" ? "élevée" : view === "trois-quarts" ? "moyenne" : "faible";
  const medMin = median(mins);

  if (exercise === "squat") {
    const S = T.squat;
    const partial = reps.filter((r) => r.minAngle > S.partialDepth);
    if (medMin <= S.goodDepth) {
      obs.push({ id: "squat_depth_good", kind: "strength", title: "Amplitude de descente importante", detail: "Au point bas, l'angle du genou descend nettement : tes cuisses approchent ou dépassent l'horizontale sur la majorité des répétitions.", evidence: `Angle du genou au point bas : ${r0(medMin)}° (médiane)`, moments: reps.map((r) => r.bottom), confidence: conf });
    } else if (partial.length >= Math.ceil(reps.length / 2)) {
      obs.push({ id: "squat_depth_partial", kind: "improve", title: "Descente partielle", detail: `${share(partial.length, reps.length)}, la descente s'arrête tôt. Si c'est confortable pour toi, tu peux chercher à descendre un peu plus bas, de façon contrôlée.`, evidence: `Angle du genou au point bas : ${r0(medMin)}° (médiane), au-dessus de ${S.partialDepth}° sur ${partial.length}/${reps.length} répétitions`, moments: partial.map((r) => r.bottom), drill: { name: "Squat sur chaise", how: "Descends lentement jusqu'à effleurer une chaise, puis remonte. 3 × 8. Abaisse la hauteur de l'assise au fil des semaines." }, confidence: conf });
    } else {
      obs.push({ id: "squat_depth_mid", kind: "info", title: "Amplitude intermédiaire", detail: "Tes descentes s'arrêtent un peu au-dessus de l'horizontale des cuisses.", evidence: `Angle du genou au point bas : ${r0(medMin)}° (médiane)`, moments: reps.map((r) => r.bottom), confidence: conf });
    }
    const leanVals = reps.map((r) => r.secondary).filter((x) => !Number.isNaN(x));
    if (leanVals.length) {
      const lean = median(leanVals);
      const leaning = reps.filter((r) => r.secondary > S.strongLean);
      if (leaning.length >= Math.ceil(reps.length / 2)) {
        obs.push({ id: "squat_lean", kind: "improve", title: "Buste très penché vers l'avant", detail: "Au point bas, ton buste s'incline fortement. Une inclinaison est normale au squat ; une inclinaison marquée peut indiquer qu'il manque de la mobilité aux chevilles ou du contrôle du tronc.", evidence: `Inclinaison du buste au point bas : ${r0(lean)}° par rapport à la verticale (${repsLabel(leaning.map((r) => r.index))})`, moments: leaning.map((r) => r.bottom), drill: { name: "Squat bras tendus devant", how: "Tends les bras devant toi à hauteur d'épaules, descends lentement en gardant la poitrine orientée vers l'avant. 3 × 8." }, confidence: view === "profil" ? "moyenne" : "faible" });
      } else {
        obs.push({ id: "squat_lean_ok", kind: "strength", title: "Buste stable", detail: "L'inclinaison de ton buste reste modérée au point bas.", evidence: `Inclinaison du buste au point bas : ${r0(lean)}° par rapport à la verticale`, moments: [], confidence: view === "profil" ? "moyenne" : "faible" });
      }
    }
  } else {
    const P = T.pushup;
    const partial = reps.filter((r) => r.minAngle > P.partialDepth);
    if (medMin <= P.goodDepth) {
      obs.push({ id: "pushup_depth_good", kind: "strength", title: "Bonne amplitude de descente", detail: "Tes coudes se fléchissent nettement au point bas : la poitrine descend près du sol.", evidence: `Angle du coude au point bas : ${r0(medMin)}° (médiane)`, moments: reps.map((r) => r.bottom), confidence: conf });
    } else if (partial.length >= Math.ceil(reps.length / 2)) {
      obs.push({ id: "pushup_depth_partial", kind: "improve", title: "Descente partielle", detail: `${share(partial.length, reps.length)}, la descente s'arrête tôt. Réduire la difficulté permet souvent de travailler sur toute l'amplitude.`, evidence: `Angle du coude au point bas : ${r0(medMin)}° (médiane), au-dessus de ${P.partialDepth}° sur ${partial.length}/${reps.length} répétitions`, moments: partial.map((r) => r.bottom), drill: { name: "Pompes inclinées", how: "Mains sur un canapé ou une table solide, descends jusqu'à toucher le bord avec la poitrine. 3 × 8 à 12." }, confidence: conf });
    } else {
      obs.push({ id: "pushup_depth_mid", kind: "info", title: "Amplitude intermédiaire", detail: "Ta descente est correcte mais pourrait aller un peu plus bas si c'est confortable.", evidence: `Angle du coude au point bas : ${r0(medMin)}° (médiane)`, moments: reps.map((r) => r.bottom), confidence: conf });
    }
    const noLock = reps.filter((r) => r.topAngle < P.lockout);
    if (noLock.length >= Math.ceil(reps.length / 2)) {
      obs.push({ id: "pushup_lockout", kind: "improve", title: "Bras pas complètement tendus en haut", detail: "En haut du mouvement, tes coudes restent fléchis. Remonter jusqu'à l'extension rend chaque répétition complète et comparable.", evidence: `Angle du coude en haut : ${r0(median(tops))}° (médiane)`, moments: noLock.map((r) => r.start), drill: { name: "Pompes avec pause en haut", how: "Marque 1 seconde bras tendus à chaque répétition. 3 × 6." }, confidence: conf });
    }
    const devs = reps.map((r) => r.secondary).filter((x) => !Number.isNaN(x));
    if (devs.length) {
      const sag = reps.filter((r) => r.secondary > P.sag);
      const pike = reps.filter((r) => r.secondary < -P.pike);
      if (sag.length >= Math.ceil(reps.length / 2)) {
        obs.push({ id: "pushup_sag", kind: "improve", title: "Bassin qui descend", detail: "Tes hanches passent sous la ligne épaules–chevilles pendant la répétition. Garder le corps gainé permet de mieux transmettre l'effort.", evidence: `Écart d'alignement maximal : ${r0(median(sag.map((r) => r.secondary)))}° (${repsLabel(sag.map((r) => r.index))})`, moments: sag.map((r) => r.bottom), drill: { name: "Planche sur les mains", how: "Position haute de pompe, fessiers et abdos serrés, 3 × 20 à 30 s. Puis reprends les pompes en gardant cette ligne." }, confidence: view === "profil" ? "élevée" : "faible" });
      } else if (pike.length >= Math.ceil(reps.length / 2)) {
        obs.push({ id: "pushup_pike", kind: "improve", title: "Bassin trop haut", detail: "Tes hanches restent au-dessus de la ligne épaules–chevilles : le corps forme un « V ».", evidence: `Écart d'alignement : ${r0(Math.abs(median(pike.map((r) => r.secondary))))}° (${repsLabel(pike.map((r) => r.index))})`, moments: pike.map((r) => r.bottom), drill: { name: "Pompes sur les genoux, corps aligné", how: "Genoux au sol, épaules–hanches–genoux sur une ligne. 3 × 8." }, confidence: view === "profil" ? "élevée" : "faible" });
      } else {
        obs.push({ id: "pushup_line_ok", kind: "strength", title: "Corps aligné", detail: "Épaules, hanches et chevilles restent globalement alignées pendant la répétition.", evidence: `Écart d'alignement médian : ${r0(Math.abs(median(devs)))}°`, moments: [], confidence: view === "profil" ? "élevée" : "faible" });
      }
    }
  }

  // Consistency (both exercises)
  if (reps.length >= 3) {
    const spread = std(mins);
    if (spread > T.consistency.angleSpread) {
      const worst = [...reps].sort((a, b) => b.minAngle - a.minAngle)[0];
      obs.push({ id: "consistency_depth", kind: "improve", title: "Amplitude irrégulière", detail: "La profondeur varie d'une répétition à l'autre. Une amplitude régulière rend ta progression plus facile à mesurer.", evidence: `Écart-type de l'angle au point bas : ${r1(spread)}° — répétition la moins profonde : n°${worst.index}`, moments: [worst.bottom], drill: { name: "Répétitions avec repère", how: exercise === "squat" ? "Place une chaise ou un coussin derrière toi et effleure-le à chaque répétition." : "Pose un livre ou un coussin sous ta poitrine et effleure-le à chaque répétition." }, confidence: "moyenne" });
    } else {
      obs.push({ id: "consistency_ok", kind: "strength", title: "Répétitions régulières", detail: "Ton amplitude reste stable d'une répétition à l'autre.", evidence: `Écart-type de l'angle au point bas : ${r1(spread)}°`, moments: [], confidence: "moyenne" });
    }
    const dSpread = std(durations);
    if (dSpread > T.consistency.durationSpread) {
      obs.push({ id: "consistency_tempo", kind: "info", title: "Rythme variable", detail: "La durée des répétitions change sensiblement au cours de la série, ce qui peut traduire de la fatigue.", evidence: `Durées : ${durations.map((d) => r1(d) + " s").join(" · ")}`, moments: [], confidence: "moyenne" });
    }
  }
  const fast = reps.filter((r) => r.descent < T.tempo.fastDescent);
  if (fast.length >= Math.ceil(reps.length / 2)) {
    obs.push({ id: "tempo_fast", kind: "improve", title: "Descente rapide", detail: "La phase de descente est très rapide. La ralentir aide à contrôler le mouvement.", evidence: `Durée médiane de descente : ${r1(median(descents))} s`, moments: fast.map((r) => r.start), drill: { name: "Tempo 3-1-1", how: "Descends en 3 secondes, marque 1 seconde en bas, remonte en 1 seconde. 3 × 6." }, confidence: "élevée" });
  }
  // actionable items first, ranked by how much they change the movement
  const order = { improve: 0, strength: 1, info: 2 } as const;
  const priority: Record<string, number> = { pushup_sag: 1, pushup_pike: 1, squat_depth_partial: 2, pushup_depth_partial: 2, squat_lean: 3, pushup_lockout: 3, consistency_depth: 4, tempo_fast: 5 };
  return obs.sort((a, b) => order[a.kind] - order[b.kind] || (priority[a.id] ?? 9) - (priority[b.id] ?? 9));
}

export interface AnalyzeInput {
  frames: PoseFrame[];
  meta: VideoMeta;
  requestedExercise?: ExerciseId;
}

/** Full deterministic pipeline: quality → recognition → landmarks → measures → reps → observations. */
export function analyze({ frames, meta, requestedExercise }: AnalyzeInput): AnalysisResult {
  const aspect = meta.width / meta.height;
  const q = assessQuality(frames, meta);
  const base: AnalysisResult = {
    version: 1,
    status: "rejected",
    requestedExercise,
    exercise: null,
    exerciseConfidence: 0,
    view: "inconnue",
    side: "left",
    quality: q.checks,
    reps: [],
    summary: { repCount: 0, avgMinAngle: null, minAngleSpread: null, avgRepDuration: null, repDurationSpread: null, avgSecondary: null },
    observations: [],
    limitations: BASE_LIMITATIONS,
    series: [],
    meta: { ...meta, framesAnalysed: frames.length, detectionRate: q.detectionRate },
    createdAt: new Date().toISOString(),
  };
  if (q.rejection) return { ...base, rejection: q.rejection };

  const usable = frames.filter((f) => f.landmarks);
  const { exercise, confidence } = classifyExercise(usable, aspect);
  if (!exercise) return { ...base, exerciseConfidence: confidence, rejection: { code: "exercise_not_recognized", ...REJECTION_TEXT.exercise_not_recognized } };
  if (requestedExercise && requestedExercise !== exercise) {
    return { ...base, exercise, exerciseConfidence: confidence, rejection: { code: "exercise_mismatch", ...REJECTION_TEXT.exercise_mismatch } };
  }

  const side = pickSide(usable);
  const view = estimateView(usable, aspect, exercise);
  // A split stance seen from the side (lunge, step) also bends the knees: do not call it a squat.
  if (exercise === "squat" && view !== "face" && stanceSpread(usable, aspect) > 0.6) {
    return { ...base, exercise: null, exerciseConfidence: confidence, view, side, rejection: { code: "exercise_not_recognized", ...REJECTION_TEXT.exercise_not_recognized } };
  }
  const { primary, secondary } = measure(frames, exercise, side, aspect);
  const times = frames.map((f) => f.t);
  const windows = segmentReps(primary, times, { minRange: exercise === "squat" ? T.squat.minRange : T.pushup.minRange });

  const series: SeriesPoint[] = frames.map((f, i) => ({ t: r1(f.t * 10) / 10, angle: primary[i] === null ? null : r1(primary[i]!) }));
  const orientation = {
    id: "orientation" as const,
    label: "Angle de caméra",
    status: view === "profil" ? ("ok" as const) : ("warn" as const),
    detail: view === "profil" ? "De profil — idéal pour mesurer les angles" : view === "face" ? "De face — les angles de flexion sont moins fiables" : view === "trois-quarts" ? "De trois-quarts — mesures moins précises qu'en profil" : "Non déterminé",
  };
  const quality = [...q.checks, orientation];

  if (windows.length === 0) {
    return { ...base, exercise, exerciseConfidence: confidence, view, side, quality, series, rejection: { code: "no_reps", ...REJECTION_TEXT.no_reps } };
  }

  const reps: RepMetrics[] = windows.map((w, k) => {
    const seg = primary.slice(w.start, w.end + 1).filter((x): x is number => x !== null);
    const secSeg = secondary.slice(w.start, w.end + 1).filter((x): x is number => x !== null);
    let sec = NaN;
    if (exercise === "squat") sec = secondary[w.bottom] ?? NaN;
    else if (secSeg.length) sec = secSeg.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m), 0);
    return {
      index: k + 1,
      start: r1(times[w.start]),
      bottom: r1(times[w.bottom]),
      end: r1(times[w.end]),
      minAngle: r1(primary[w.bottom]!),
      topAngle: r1(Math.max(...seg)),
      descent: r1(times[w.bottom] - times[w.start]),
      ascent: r1(times[w.end] - times[w.bottom]),
      secondary: Number.isNaN(sec) ? NaN : r1(sec),
    };
  });

  const mins = reps.map((r) => r.minAngle);
  const durs = reps.map((r) => r.end - r.start);
  const secs = reps.map((r) => r.secondary).filter((x) => !Number.isNaN(x));
  const lowConfidence = view === "face" || q.detectionRate < 0.8 || confidence < 0.8;
  const limitations = [...BASE_LIMITATIONS];
  if (view !== "profil") limitations.unshift("La vidéo n'est pas filmée de profil : les angles de flexion mesurés sont moins fiables. Pour une analyse plus précise, filme-toi de côté.");

  return {
    ...base,
    status: lowConfidence ? "uncertain" : "ok",
    rejection: undefined,
    exercise,
    exerciseConfidence: r1(confidence * 100) / 100,
    view,
    side,
    quality,
    reps,
    summary: {
      repCount: reps.length,
      avgMinAngle: r1(mean(mins)),
      minAngleSpread: reps.length > 1 ? r1(std(mins)) : null,
      avgRepDuration: r1(mean(durs)),
      repDurationSpread: reps.length > 1 ? r1(std(durs)) : null,
      avgSecondary: secs.length ? r1(mean(secs)) : null,
    },
    observations: observationsFor(exercise, reps, view),
    limitations,
    series,
  };
}
