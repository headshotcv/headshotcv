"use client";
import { useEffect, useRef, useState } from "react";
import type { ExerciseId } from "@/lib/analysis/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { LiveCamera } from "./LiveCamera";

type CamError = { title: string; detail: string };

function cameraError(e: unknown): CamError {
  const name = (e as { name?: string })?.name;
  const ios = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        title: "Accès à la caméra refusé",
        detail: ios
          ? "Sur iPhone : Réglages › Safari › Caméra › Autoriser, puis recharge la page. Tu peux aussi utiliser « Ouvrir l'appareil photo » ou importer une vidéo."
          : "Clique sur l'icône de cadenas dans la barre d'adresse › Autorisations › Caméra › Autoriser, puis recharge la page. Tu peux aussi importer une vidéo.",
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return { title: "Aucune caméra détectée", detail: "Branche une caméra ou importe une vidéo filmée avec ton téléphone." };
    case "NotReadableError":
    case "AbortError":
      return { title: "La caméra est déjà utilisée", detail: "Ferme les autres applications ou onglets qui utilisent la caméra, puis réessaie." };
    default:
      return { title: "Caméra indisponible", detail: "Ton navigateur ne permet pas l'enregistrement ici (la page doit être en HTTPS). Importe plutôt une vidéo." };
  }
}

function pickMime() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const m of ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) if (MediaRecorder.isTypeSupported(m)) return m;
  return "";
}

const MAX_REC = 45;

export function FilmingGuide({ exercise }: { exercise: ExerciseId }) {
  const tips = [
    ["Distance", "2 à 3 m, téléphone posé au sol ou sur un meuble bas."],
    ["Angle", "De profil (côté), à hauteur de hanche."],
    ["Cadrage", exercise === "squat" ? "De la tête aux pieds, bras compris, pendant toute la série." : "De la tête aux pieds, mains comprises : place-toi en travers de l'image (format paysage conseillé)."],
    ["Lumière", "Lumière devant toi ou sur le côté. Évite le contre-jour."],
    ["Série", "3 à 10 répétitions, à vitesse contrôlée."],
  ];
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {tips.map(([k, v], i) => (
        <li key={k} className="flex gap-3 rounded-2xl border border-line p-4">
          <span className="font-mono text-xs text-volt">0{i + 1}</span>
          <span><span className="block text-sm font-semibold">{k}</span><span className="text-sm text-bone/70">{v}</span></span>
        </li>
      ))}
    </ul>
  );
}

export function Capture({ exercise, onVideo }: { exercise: ExerciseId; onVideo: (blob: Blob) => void }) {
  const [mode, setMode] = useState<"choose" | "camera">("choose");
  const [err, setErr] = useState<CamError | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rec, setRec] = useState<{ start: number; elapsed: number } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const nativeInput = useRef<HTMLInputElement>(null);

  const stop = () => { stream?.getTracks().forEach((t) => t.stop()); setStream(null); };
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  async function openCamera(f = facing) {
    setErr(null);
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) { setErr(cameraError(null)); return; }
    if (pickMime() === null) { setErr({ title: "Enregistrement non pris en charge", detail: "Ce navigateur ne sait pas enregistrer la caméra. Utilise « Ouvrir l'appareil photo » ou importe une vidéo." }); return; }
    try {
      stream?.getTracks().forEach((t) => t.stop());
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: f, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: false });
      } catch (e) {
        if ((e as { name?: string }).name === "OverconstrainedError") s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        else throw e;
      }
      setStream(s);
      setMode("camera");
    } catch (e) {
      setErr(cameraError(e));
    }
  }

  function startRecording() {
    if (!stream) return;
    let n = 5;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      if (n > 0) { setCountdown(n); return; }
      clearInterval(id);
      setCountdown(null);
      const mime = pickMime() || undefined;
      const r = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 4_000_000 } : undefined);
      chunks.current = [];
      r.ondataavailable = (ev) => { if (ev.data.size) chunks.current.push(ev.data); };
      r.onstop = () => {
        const blob = new Blob(chunks.current, { type: r.mimeType || mime || "video/webm" });
        stop();
        setRec(null);
        setMode("choose");
        onVideo(blob);
      };
      r.start(250);
      recorder.current = r;
      const start = performance.now();
      setRec({ start, elapsed: 0 });
    }, 1000);
  }

  useEffect(() => {
    if (!rec) return;
    const id = setInterval(() => {
      const el = (performance.now() - rec.start) / 1000;
      setRec((x) => (x ? { ...x, elapsed: el } : x));
      if (el >= MAX_REC) recorder.current?.state === "recording" && recorder.current.stop();
    }, 200);
    return () => clearInterval(id);
  }, [rec?.start]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickFile = (f?: File | null) => { if (f) onVideo(f); };

  if (mode === "camera" && stream) {
    return (
      <LiveCamera stream={stream} exercise={exercise} mirror={facing === "user"} className="aspect-[3/4] rounded-[24px] border border-line sm:aspect-video">
        <div className="pointer-events-none absolute inset-5 rounded-2xl border-2 border-dashed border-volt/40" />
        {countdown !== null && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="display text-[160px] text-volt">{countdown}</span></div>}
        {rec && <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 font-mono text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-flare" />REC {rec.elapsed.toFixed(0)} s / {MAX_REC}</span>}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
          <Button variant="outline" size="sm" onClick={() => { if (recorder.current?.state === "recording") { recorder.current.onstop = null; recorder.current.stop(); } stop(); setRec(null); setCountdown(null); setMode("choose"); }}>Annuler</Button>
          {!rec ? (
            <button onClick={startRecording} disabled={countdown !== null} aria-label="Démarrer l'enregistrement (compte à rebours de 5 secondes)" className="focus-ring flex h-16 w-16 items-center justify-center rounded-full border-4 border-bone"><span className="h-11 w-11 rounded-full bg-flare" /></button>
          ) : (
            <button onClick={() => recorder.current?.stop()} aria-label="Arrêter l'enregistrement" className="focus-ring flex h-16 w-16 items-center justify-center rounded-full border-4 border-bone"><span className="h-7 w-7 rounded-md bg-flare" /></button>
          )}
          <Button variant="outline" size="sm" disabled={!!rec} onClick={() => { const f = facing === "user" ? "environment" : "user"; setFacing(f); openCamera(f); }}>Retourner</Button>
        </div>
      </LiveCamera>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <button onClick={() => openCamera()} className="focus-ring group flex flex-col items-start gap-6 rounded-[20px] border border-volt/40 bg-volt/[0.06] p-5 text-left hover:bg-volt/10">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-volt">Recommandé</span>
          <span><span className="block text-lg font-semibold">Filmer ici</span><span className="text-sm text-bone/70">Répétitions comptées en direct, squelette affiché, compte à rebours de 5 s.</span></span>
        </button>
        <button onClick={() => nativeInput.current?.click()} className="focus-ring flex flex-col items-start gap-6 rounded-[20px] border border-line p-5 text-left hover:border-bone/30">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-mute">Mobile</span>
          <span><span className="block text-lg font-semibold">Ouvrir l’appareil photo</span><span className="text-sm text-bone/70">Utilise l’app caméra de ton téléphone.</span></span>
        </button>
        <button onClick={() => fileInput.current?.click()} className="focus-ring flex flex-col items-start gap-6 rounded-[20px] border border-line p-5 text-left hover:border-bone/30">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-mute">Fichier</span>
          <span><span className="block text-lg font-semibold">Importer une vidéo</span><span className="text-sm text-bone/70">MP4, MOV ou WebM · 3 à 90 s.</span></span>
        </button>
      </div>
      <input ref={fileInput} type="file" accept="video/*" className="sr-only" aria-label="Importer une vidéo" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={nativeInput} type="file" accept="video/*" capture="environment" className="sr-only" aria-label="Filmer avec l'appareil photo" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
      {err && (
        <div role="alert" className="rounded-2xl border border-flare/40 bg-flare/[0.06] p-4">
          <p className="font-semibold text-flare">{err.title}</p>
          <p className="mt-1 text-sm text-bone/80">{err.detail}</p>
        </div>
      )}
      <p className="text-xs text-mute">L’analyse se fait sur ton appareil. Ta vidéo n’est pas envoyée sur nos serveurs.</p>
    </div>
  );
}
