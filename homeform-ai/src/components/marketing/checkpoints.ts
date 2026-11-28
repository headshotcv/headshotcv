import { THRESHOLDS as T } from "@/lib/analysis/thresholds";

/** What each check measures — numbers come from the engine's own thresholds. */
export const CHECKPOINTS = {
  squat: [
    { title: "Amplitude de descente", what: "Angle hanche–genou–cheville au point bas de chaque répétition.", flag: `Descente partielle si l’angle reste au-dessus de ${T.squat.partialDepth}° sur au moins la moitié des répétitions ; point fort sous ${T.squat.goodDepth}°.`, drill: "Squat sur chaise" },
    { title: "Inclinaison du buste", what: "Angle du buste par rapport à la verticale au point bas.", flag: `Signalé au-delà de ${T.squat.strongLean}° sur la majorité des répétitions.`, drill: "Squat bras tendus devant" },
    { title: "Régularité", what: "Écart-type de l’angle au point bas d’une répétition à l’autre.", flag: `Amplitude irrégulière au-delà de ${T.consistency.angleSpread}°.`, drill: "Répétitions avec repère" },
    { title: "Rythme", what: "Durée de descente et de montée de chaque répétition.", flag: `Descente rapide sous ${T.tempo.fastDescent} s.`, drill: "Tempo 3-1-1" },
    { title: "Qualité de la vidéo", what: "Durée, résolution, luminosité, détection, cadrage, angle de caméra.", flag: "Analyse refusée si la vidéo ne permet pas de conclure.", drill: "Conseils de tournage" },
  ],
  pushup: [
    { title: "Amplitude de descente", what: "Angle épaule–coude–poignet au point bas.", flag: `Descente partielle au-dessus de ${T.pushup.partialDepth}° ; point fort sous ${T.pushup.goodDepth}°.`, drill: "Pompes inclinées" },
    { title: "Extension en haut", what: "Angle du coude en haut de chaque répétition.", flag: `Signalé sous ${T.pushup.lockout}° (bras pas tendus).`, drill: "Pompes avec pause en haut" },
    { title: "Alignement du corps", what: "Écart de la hanche par rapport à la ligne épaules–chevilles.", flag: `Bassin qui descend au-delà de ${T.pushup.sag}°, bassin trop haut au-delà de ${T.pushup.pike}°.`, drill: "Planche / pompes sur les genoux" },
    { title: "Régularité", what: "Variation de l’amplitude d’une répétition à l’autre.", flag: `Au-delà de ${T.consistency.angleSpread}° d’écart-type.`, drill: "Répétitions avec repère" },
    { title: "Rythme", what: "Durée des phases de descente et de montée.", flag: `Descente rapide sous ${T.tempo.fastDescent} s.`, drill: "Tempo 3-1-1" },
  ],
};
