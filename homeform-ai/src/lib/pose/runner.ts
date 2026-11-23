"use client";
/**
 * On-device pose extraction with MediaPipe PoseLandmarker (BlazePose, 33 landmarks).
 * The video never leaves the browser: frames are decoded locally, landmarks are extracted
 * locally and only the numeric results are kept.
 */
import type { PoseLandmarker as PL } from "@mediapipe/tasks-vision";
import type { PoseFrame, VideoMeta } from "@/lib/analysis/types";

let landmarkerPromise: Promise<PL> | null = null;

export async function getLandmarker(): Promise<PL> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const make = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/pose_landmarker_full.task", delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    })().catch((e) => {
      landmarkerPromise = null;
      throw e;
    });
  }
  return landmarkerPromise;
}

export class PoseError extends Error {
  constructor(public code: "unsupported_format" | "model_load" | "decode", message: string) {
    super(message);
  }
}

export function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";
    v.src = src;
    const t = setTimeout(() => reject(new PoseError("decode", "Le navigateur n'a pas pu lire la vidéo.")), 20000);
    v.onloadeddata = () => { clearTimeout(t); resolve(v); };
    v.onerror = () => { clearTimeout(t); reject(new PoseError("unsupported_format", "Format vidéo non pris en charge par ce navigateur. Essaie un fichier MP4 ou MOV.")); };
  });
}

function seek(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => { v.removeEventListener("seeked", done); resolve(); };
    v.addEventListener("seeked", done);
    v.currentTime = t;
  });
}

export interface ExtractProgress { done: number; total: number; stage: "model" | "frames" }

function lumaOf(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, w: number, h: number) {
  ctx.drawImage(video, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  let s = 0;
  for (let k = 0; k < d.length; k += 4) s += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
  return s / (d.length / 4);
}

type RVFC = (cb: (now: number, meta: { mediaTime: number }) => void) => number;

/**
 * Extract landmarks from every decoded frame while the video plays (requestVideoFrameCallback).
 * Processing time ≈ video duration, on every container format. Falls back to seeking when the
 * browser lacks requestVideoFrameCallback.
 */
export async function extractPoses(
  src: string,
  onProgress: (p: ExtractProgress) => void,
  signal?: AbortSignal,
): Promise<{ frames: PoseFrame[]; meta: VideoMeta }> {
  onProgress({ done: 0, total: 1, stage: "model" });
  let landmarker: PL;
  try {
    landmarker = await getLandmarker();
  } catch {
    throw new PoseError("model_load", "Le modèle d'analyse n'a pas pu être chargé. Vérifie ta connexion et réessaie.");
  }
  const video = await loadVideo(src);
  // keep it in the DOM (invisible) so mobile browsers keep decoding
  Object.assign(video.style, { position: "fixed", left: "0", top: "0", width: "2px", height: "2px", opacity: "0", pointerEvents: "none" });
  document.body.appendChild(video);

  const canvas = document.createElement("canvas");
  const lumaW = 48;
  canvas.width = lumaW;
  canvas.height = Math.max(1, Math.round((lumaW * video.videoHeight) / Math.max(1, video.videoWidth)));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const frames: PoseFrame[] = [];
  const knownDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
  const est = knownDuration ? Math.floor(knownDuration * 15) : 300;
  let lastTs = -1;

  const process = (t: number) => {
    if (frames.length && t - frames[frames.length - 1].t < 1 / 16) return; // ≈15 fps max
    const ts = Math.max(lastTs + 1, Math.round(t * 1000));
    lastTs = ts;
    const res = landmarker.detectForVideo(video, ts);
    const lm = res.landmarks?.[0];
    frames.push({
      t,
      luma: ctx && frames.length % 5 === 0 ? lumaOf(ctx, video, canvas.width, canvas.height) : undefined,
      landmarks: lm ? lm.map((p) => ({ x: p.x, y: p.y, z: p.z, visibility: p.visibility ?? 0 })) : null,
    });
    onProgress({ done: Math.min(frames.length, est), total: est, stage: "frames" });
  };

  try {
    const rvfc = (video as unknown as { requestVideoFrameCallback?: RVFC }).requestVideoFrameCallback?.bind(video);
    if (rvfc) {
      await new Promise<void>((resolve, reject) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        const onFrame = (_now: number, meta: { mediaTime: number }) => {
          if (done) return;
          if (signal?.aborted) { done = true; video.pause(); reject(new DOMException("aborted", "AbortError")); return; }
          try { process(meta.mediaTime); } catch (e) { done = true; reject(e); return; }
          rvfc(onFrame);
        };
        video.addEventListener("ended", () => setTimeout(finish, 50));
        video.addEventListener("error", () => { if (!done) { done = true; reject(new PoseError("decode", "La lecture de la vidéo a échoué.")); } });
        rvfc(onFrame);
        video.currentTime = 0;
        video.play().catch(() => reject(new PoseError("decode", "Le navigateur a refusé de lire la vidéo.")));
      });
    } else {
      // Fallback: seek frame by frame
      const duration = knownDuration ?? 30;
      const total = Math.min(450, Math.floor(duration * 10));
      for (let i = 0; i < total; i++) {
        if (signal?.aborted) throw new DOMException("aborted", "AbortError");
        await seek(video, (i * duration) / total);
        process(video.currentTime);
      }
    }
  } finally {
    video.pause();
    video.remove();
  }
  const dims = { width: video.videoWidth, height: video.videoHeight };
  video.removeAttribute("src");
  video.load();
  const duration = knownDuration ?? (frames.length ? frames[frames.length - 1].t : 0);
  onProgress({ done: est, total: est, stage: "frames" });
  return { frames, meta: { ...dims, duration } };
}
