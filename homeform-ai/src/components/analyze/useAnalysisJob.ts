"use client";
import { useCallback, useRef, useState } from "react";
import { analyze } from "@/lib/analysis/analyze";
import type { AnalysisResult, ExerciseId, PoseFrame } from "@/lib/analysis/types";
import { REJECTION_TEXT } from "@/lib/analysis/quality";
import { extractPoses, PoseError } from "@/lib/pose/runner";

export type JobState =
  | { phase: "idle" }
  | { phase: "running"; stage: "model" | "frames" | "analysis"; progress: number }
  | { phase: "done"; result: AnalysisResult; frames: PoseFrame[]; blob: Blob }
  | { phase: "error"; message: string; advice: string };

const MAX_BYTES = 300 * 1024 * 1024;

export function useAnalysisJob() {
  const [state, setState] = useState<JobState>({ phase: "idle" });
  const abort = useRef<AbortController | null>(null);

  const run = useCallback(async (blob: Blob, exercise: ExerciseId) => {
    if (blob.size > MAX_BYTES) {
      setState({ phase: "error", message: "La vidéo est trop lourde (plus de 300 Mo).", advice: "Filme une seule série de 3 à 10 répétitions (moins de 60 s)." });
      return;
    }
    if (blob.type && !blob.type.startsWith("video/")) {
      setState({ phase: "error", message: "Ce fichier n'est pas une vidéo.", advice: "Choisis un fichier MP4, MOV ou WebM." });
      return;
    }
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    const url = URL.createObjectURL(blob);
    setState({ phase: "running", stage: "model", progress: 0 });
    try {
      const { frames, meta } = await extractPoses(url, (p) => setState({ phase: "running", stage: p.stage, progress: p.stage === "model" ? 0 : p.done / p.total }), ac.signal);
      setState({ phase: "running", stage: "analysis", progress: 1 });
      await new Promise((r) => setTimeout(r, 50));
      const result = analyze({ frames, meta, requestedExercise: exercise });
      setState({ phase: "done", result, frames, blob });
    } catch (e) {
      if ((e as Error).name === "AbortError") { setState({ phase: "idle" }); return; }
      if (e instanceof PoseError) setState({ phase: "error", message: e.message, advice: e.code === "unsupported_format" ? "Sur iPhone, choisis « Le plus compatible » dans Réglages › Appareil photo › Formats, ou importe la vidéo depuis l'app Photos." : "Réessaie dans un instant." });
      else setState({ phase: "error", ...REJECTION_TEXT.processing_error });
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  const cancel = useCallback(() => { abort.current?.abort(); setState({ phase: "idle" }); }, []);
  const reset = useCallback(() => setState({ phase: "idle" }), []);
  return { state, run, cancel, reset };
}
