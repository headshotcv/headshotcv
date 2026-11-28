/**
 * Stock clips (Mixkit Free License — commercial use allowed, no redistribution as standalone files).
 * Files are re-encoded in /public/media/v. Pose tracks in /public/media/poses were computed by running
 * the same MediaPipe model + HOMEFORM analysis engine on these clips.
 */
export const CLIPS = {
  livingPushups: { id: "15080", alt: "Femme faisant des pompes sur le tapis de son salon", pose: true },
  terracePushups: { id: "50762", alt: "Homme faisant des pompes sur un tapis, sur une terrasse", pose: true },
  livingLunges: { id: "42898", alt: "Femme faisant des fentes dans son salon", pose: true },
  familyPushups: { id: "4525", alt: "Père et fils faisant des pompes dans une chambre", pose: true },
  loftSquats: { id: "52106", alt: "Femme faisant des squats dans un loft", pose: true },
  handsCloseup: { id: "50763", alt: "Gros plan sur des mains posées sur un tapis pendant des pompes", pose: false },
  faceCloseup: { id: "5048", alt: "Homme faisant des pompes, vu de face", pose: false },
  womanPushups: { id: "24383", alt: "Femme faisant des pompes, vue de face", pose: false },
  loftWorkout: { id: "52110", alt: "Femme s'entraînant dans un loft", pose: false },
  darkPushups: { id: "11765", alt: "Pompes sur fond noir, éclairage dramatique", pose: false },
  terraceFront: { id: "50761", alt: "Homme faisant des pompes face caméra sur une terrasse", pose: false },
} as const;

export type ClipKey = keyof typeof CLIPS;
export const clipSrc = (k: ClipKey) => `/media/v/${CLIPS[k].id}.mp4`;
export const clipPoster = (k: ClipKey) => `/media/v/${CLIPS[k].id}.webp`;
export const clipPose = (k: ClipKey) => `/media/poses/${CLIPS[k].id}.json`;
