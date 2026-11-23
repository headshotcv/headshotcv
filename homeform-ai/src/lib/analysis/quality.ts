import type { PoseFrame, QualityCheck, RejectionCode, VideoMeta } from "./types.ts";
import { THRESHOLDS as T } from "./thresholds.ts";
import { KEY_JOINTS } from "./classify.ts";
import { mean } from "./geometry.ts";

export interface QualityOutcome {
  checks: QualityCheck[];
  rejection?: { code: RejectionCode; message: string; advice: string };
  detectionRate: number;
}

export const REJECTION_TEXT: Record<RejectionCode, { message: string; advice: string }> = {
  video_too_short: { message: "La vidéo est trop courte pour observer une répétition complète.", advice: "Filme au moins 3 répétitions, soit environ 8 à 30 secondes." },
  video_too_long: { message: "La vidéo dépasse 90 secondes.", advice: "Coupe la vidéo ou filme une seule série de 3 à 10 répétitions." },
  resolution_too_low: { message: "La résolution de la vidéo est trop faible.", advice: "Utilise la caméra arrière en 720p ou plus." },
  too_dark: { message: "La vidéo est trop sombre pour repérer les articulations de façon fiable.", advice: "Allume la lumière ou place-toi face à une fenêtre, sans contre-jour." },
  overexposed: { message: "L'image est surexposée (trop de lumière).", advice: "Évite de filmer face à une fenêtre ou une lampe directe." },
  no_person: { message: "Aucune personne n'a été détectée de façon stable.", advice: "Place ton téléphone à 2–3 m, corps entier visible, et vérifie que rien ne masque l'objectif." },
  body_out_of_frame: { message: "Une partie du corps sort du cadre pendant le mouvement.", advice: "Recule le téléphone : tête, mains et pieds doivent rester visibles pendant toute la série." },
  exercise_not_recognized: { message: "Le mouvement n'a pas été reconnu comme un squat ou une pompe.", advice: "La version actuelle analyse uniquement le squat au poids du corps et les pompes. Filme de profil." },
  exercise_mismatch: { message: "Le mouvement détecté ne correspond pas à l'exercice choisi.", advice: "Vérifie l'exercice sélectionné ou filme à nouveau." },
  no_reps: { message: "Aucune répétition complète n'a été identifiée.", advice: "Fais au moins 3 répétitions complètes, à vitesse contrôlée, de profil." },
  processing_error: { message: "Une erreur est survenue pendant le traitement.", advice: "Réessaie. Si le problème persiste, essaie une vidéo plus courte ou un autre navigateur." },
};

function reject(code: RejectionCode) {
  return { code, ...REJECTION_TEXT[code] };
}

export function assessQuality(frames: PoseFrame[], meta: VideoMeta): QualityOutcome {
  const checks: QualityCheck[] = [];
  const detected = frames.filter((f) => f.landmarks);
  const detectionRate = frames.length ? detected.length / frames.length : 0;
  let rejection: QualityOutcome["rejection"];

  // 1. duration
  if (meta.duration < T.video.minDuration) {
    checks.push({ id: "duration", label: "Durée", status: "fail", detail: `${meta.duration.toFixed(1)} s — minimum ${T.video.minDuration} s` });
    rejection ??= reject("video_too_short");
  } else if (meta.duration > T.video.maxDuration) {
    checks.push({ id: "duration", label: "Durée", status: "fail", detail: `${Math.round(meta.duration)} s — maximum ${T.video.maxDuration} s` });
    rejection ??= reject("video_too_long");
  } else {
    checks.push({ id: "duration", label: "Durée", status: "ok", detail: `${meta.duration.toFixed(1)} s` });
  }

  // 2. resolution
  const shortSide = Math.min(meta.width, meta.height);
  if (shortSide < T.video.minShortSide) {
    checks.push({ id: "resolution", label: "Résolution", status: "fail", detail: `${meta.width}×${meta.height}` });
    rejection ??= reject("resolution_too_low");
  } else {
    checks.push({ id: "resolution", label: "Résolution", status: "ok", detail: `${meta.width}×${meta.height}` });
  }

  // 3. lighting
  const lumas = frames.map((f) => f.luma).filter((x): x is number => typeof x === "number");
  if (lumas.length) {
    const m = mean(lumas);
    if (m < T.light.tooDark) {
      checks.push({ id: "lighting", label: "Luminosité", status: detectionRate < T.detection.minRate ? "fail" : "warn", detail: `Image sombre (luminance moyenne ${Math.round(m)}/255)` });
      if (detectionRate < T.detection.minRate) rejection ??= reject("too_dark");
    } else if (m > T.light.overexposed) {
      checks.push({ id: "lighting", label: "Luminosité", status: detectionRate < T.detection.minRate ? "fail" : "warn", detail: `Image surexposée (${Math.round(m)}/255)` });
      if (detectionRate < T.detection.minRate) rejection ??= reject("overexposed");
    } else {
      checks.push({ id: "lighting", label: "Luminosité", status: "ok", detail: `Correcte (${Math.round(m)}/255)` });
    }
  }

  // 4. detection rate
  if (detectionRate < T.detection.minRate) {
    checks.push({ id: "detection", label: "Détection du corps", status: "fail", detail: `Corps détecté sur ${Math.round(detectionRate * 100)} % des images` });
    rejection ??= reject("no_person");
  } else {
    checks.push({ id: "detection", label: "Détection du corps", status: detectionRate < 0.85 ? "warn" : "ok", detail: `Corps détecté sur ${Math.round(detectionRate * 100)} % des images` });
  }

  // 5. framing: key joints visible and inside the frame
  if (detected.length) {
    let outFrames = 0;
    for (const f of detected) {
      const lm = f.landmarks!;
      const bad = KEY_JOINTS.some((i) => {
        const p = lm[i];
        const m = T.detection.edgeMargin;
        return p.x < m || p.x > 1 - m || p.y < m || p.y > 1 - m;
      });
      if (bad) outFrames++;
    }
    const share = outFrames / detected.length;
    if (share > T.detection.maxOutOfFrameShare) {
      checks.push({ id: "framing", label: "Cadrage", status: "fail", detail: `Articulations hors champ sur ${Math.round(share * 100)} % des images` });
      rejection ??= reject("body_out_of_frame");
    } else {
      checks.push({ id: "framing", label: "Cadrage", status: share > 0.05 ? "warn" : "ok", detail: share > 0.05 ? `Corps partiellement hors champ par moments (${Math.round(share * 100)} %)` : "Corps entier visible" });
    }
  }

  return { checks, rejection, detectionRate };
}
