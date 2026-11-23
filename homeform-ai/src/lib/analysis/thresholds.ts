/**
 * Seuils indicatifs utilisés pour produire les observations.
 * ⚠️ Ces valeurs sont des points de départ techniques. Elles doivent être revues et validées
 * par des professionnels qualifiés (coach diplômé, kinésithérapeute) avant mise en production.
 * Les angles sont mesurés en 2D à partir de l'image : ils dépendent de l'angle de caméra.
 */
export const THRESHOLDS = {
  video: { minDuration: 3, maxDuration: 90, minShortSide: 360 },
  light: { tooDark: 45, overexposed: 225 },
  detection: { minRate: 0.6, minVisibility: 0.5, edgeMargin: 0.01, maxOutOfFrameShare: 0.25 },
  squat: {
    // angle hanche-genou-cheville au point bas
    partialDepth: 115,
    goodDepth: 100,
    // inclinaison du buste par rapport à la verticale au point bas
    strongLean: 55,
    minRange: 30,
  },
  pushup: {
    // angle épaule-coude-poignet au point bas
    partialDepth: 110,
    goodDepth: 95,
    // extension en haut
    lockout: 150,
    // écart de l'alignement épaule-hanche-cheville (degrés)
    sag: 15,
    pike: 15,
    minRange: 30,
  },
  consistency: { angleSpread: 10, durationSpread: 0.6 },
  tempo: { fastDescent: 0.5 },
} as const;
