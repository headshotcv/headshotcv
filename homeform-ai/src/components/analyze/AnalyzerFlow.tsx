"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseId } from "@/lib/analysis/types";
import { ProfileQuiz } from "@/components/program/ProfileQuiz";
import { PoseVideo } from "@/components/media/PoseVideo";
import { Capture, FilmingGuide } from "./Capture";
import { Processing } from "./Processing";
import { Rejected, ResultView } from "./ResultView";
import { useAnalysisJob } from "./useAnalysisJob";
import { ButtonLink, Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/landing/Pricing";
import { getDraftProfile, saveDraftProfile, savePendingAnalysis } from "@/lib/store/draft";
import { saveVideo } from "@/lib/store/videoStore";
import { newId } from "@/lib/store/id";
import { useAccount } from "@/lib/store/AccountProvider";
import type { User } from "@/lib/store/types";
import { cn } from "@/lib/cn";

type Step = "quiz" | "exercise" | "capture" | "analysis";
const FUNNEL: { key: Step; label: string }[] = [
  { key: "quiz", label: "Profil" },
  { key: "exercise", label: "Exercice" },
  { key: "capture", label: "Vidéo" },
  { key: "analysis", label: "Analyse" },
];

export function ExercisePicker({ value, onPick }: { value?: ExerciseId; onPick: (e: ExerciseId) => void }) {
  const opts: { id: ExerciseId; title: string; text: string; clip: "loftSquats" | "livingPushups"; pos: string }[] = [
    { id: "squat", title: "Squat au poids du corps", text: "Amplitude, inclinaison du buste, régularité, rythme.", clip: "loftSquats", pos: "50% 45%" },
    { id: "pushup", title: "Pompes", text: "Amplitude, extension en haut, alignement du corps, rythme.", clip: "livingPushups", pos: "50% 55%" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {opts.map((o) => (
        <button key={o.id} onClick={() => onPick(o.id)} aria-pressed={value === o.id} className={cn("focus-ring group overflow-hidden rounded-[24px] border text-left transition-colors", value === o.id ? "border-volt" : "border-line hover:border-bone/30")}>
          <PoseVideo clip={o.clip} objectPosition={o.pos} showAngle={false} className="aspect-video" />
          <div className="p-5">
            <p className="text-xl font-bold tracking-tight [font-stretch:85%]">{o.title}</p>
            <p className="mt-1 text-sm text-bone/70">{o.text}</p>
          </div>
        </button>
      ))}
      <p className="text-sm text-mute sm:col-span-2">D’autres exercices seront ajoutés une fois ces deux-là validés avec des professionnels.</p>
    </div>
  );
}

export function AnalyzerFlow({ mode = "public", user, fullAccess = false }: { mode?: "public" | "app"; user?: User | null; fullAccess?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(mode === "app" ? "exercise" : "quiz");
  const [exercise, setExercise] = useState<ExerciseId>();
  const [keepVideo, setKeepVideo] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const job = useAnalysisJob();
  const { repo, base, refresh } = useAccount();

  useEffect(() => { if (mode === "public" && getDraftProfile()) setStep("exercise"); }, [mode]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step, job.state.phase]);

  // persist finished analyses
  useEffect(() => {
    if (job.state.phase !== "done" || job.state.result.status === "rejected" || savedId) return;
    const { result, frames, blob } = job.state;
    const id = newId();
    setSavedId(id);
    (async () => {
      const kept = keepVideo ? await saveVideo(id, blob, frames) : false;
      if (user) {
        try { await repo.addAnalysis(user, { id, exercise: result.exercise, status: result.status, result, createdAt: result.createdAt, hasLocalVideo: kept }); } catch { /* shown in app */ }
        await refresh();
        if (fullAccess) router.push(`${base}/analyses/${id}`);
      } else {
        savePendingAnalysis({ id, result, hasLocalVideo: kept });
      }
    })();
  }, [job.state, keepVideo, user, fullAccess, savedId, router, repo, base, refresh]);

  const restart = () => { job.reset(); setSavedId(null); setStep("capture"); };
  const idx = FUNNEL.findIndex((f) => f.key === step);
  const steps = mode === "app" ? FUNNEL.slice(1) : FUNNEL;

  return (
    <div>
      <ol className="mb-10 flex gap-2" aria-label="Progression">
        {steps.map((f) => {
          const i = FUNNEL.findIndex((x) => x.key === f.key);
          return (
            <li key={f.key} className="flex-1">
              <div className={cn("h-1 rounded-full", i <= idx ? "bg-volt" : "bg-line")} />
              <p className={cn("mt-2 font-mono text-[10px] uppercase tracking-[0.14em]", i === idx ? "text-bone" : "text-mute")}>{f.label}</p>
            </li>
          );
        })}
      </ol>

      {step === "quiz" && (
        <div className="mx-auto max-w-2xl">
          <ProfileQuiz submitLabel="Continuer" onDone={(p) => { saveDraftProfile(p); setStep("exercise"); }} />
        </div>
      )}

      {step === "exercise" && (
        <div>
          <h1 className="display text-5xl sm:text-7xl">Quel exercice ?</h1>
          <p className="mb-8 mt-3 text-bone/70">Version actuelle : deux exercices, analysés avec soin.</p>
          <ExercisePicker value={exercise} onPick={(e) => { setExercise(e); setStep("capture"); }} />
          {mode === "public" && <button onClick={() => setStep("quiz")} className="focus-ring mt-6 text-sm text-mute underline">Modifier mon profil</button>}
        </div>
      )}

      {step === "capture" && exercise && job.state.phase === "idle" && (
        <div className="space-y-8">
          <div>
            <button onClick={() => setStep("exercise")} className="focus-ring mb-4 font-mono text-xs uppercase tracking-[0.14em] text-bone/70">← {exercise === "squat" ? "Squat" : "Pompes"}</button>
            <h1 className="display text-5xl sm:text-7xl">Filme ta série</h1>
          </div>
          <FilmingGuide exercise={exercise} />
          <Capture exercise={exercise} onVideo={(b) => { setStep("analysis"); job.run(b, exercise); }} />
          <label className="flex items-start gap-3 text-sm text-bone/80">
            <input type="checkbox" checked={keepVideo} onChange={(e) => setKeepVideo(e.target.checked)} className="mt-1 accent-[var(--color-volt)]" />
            <span>Garder la vidéo <strong>sur cet appareil uniquement</strong> pour la revoir avec les repères. Tu pourras la supprimer à tout moment.</span>
          </label>
        </div>
      )}

      {step === "analysis" && job.state.phase === "running" && <Processing state={job.state} onCancel={() => { job.cancel(); setStep("capture"); }} />}

      {job.state.phase === "error" && (
        <div role="alert" className="mx-auto max-w-xl">
          <p className="eyebrow !text-flare">Erreur</p>
          <h2 className="mt-3 text-3xl font-bold">{job.state.message}</h2>
          <p className="mt-3 text-bone/75">{job.state.advice}</p>
          <Button className="mt-6" onClick={restart}>Réessayer</Button>
        </div>
      )}

      {job.state.phase === "done" && job.state.result.status === "rejected" && <Rejected result={job.state.result} onRetry={restart} />}

      {job.state.phase === "done" && job.state.result.status !== "rejected" && !(user && fullAccess) && (
        <div className="space-y-16">
          <ResultView
            result={job.state.result}
            frames={job.state.frames}
            blob={job.state.blob}
            locked
            unlockSlot={<ButtonLink href="#offre" size="sm" arrow>Débloquer le rapport complet</ButtonLink>}
          />
          <section id="offre" className="scroll-mt-24 border-t border-line pt-12">
            <p className="eyebrow !text-volt">Rapport complet + programme + suivi</p>
            <h2 className="display mt-3 text-5xl sm:text-7xl">Continue avec HOMEFORM</h2>
            <p className="mt-4 max-w-2xl text-bone/70">Ton analyse est conservée{user ? " dans ton compte" : " dans ce navigateur"}. Après inscription et paiement, elle est rattachée à ton compte avec le rapport complet. Prix et conditions affichés avant tout paiement.</p>
            <div className="mt-10"><PricingCards next="/analyser" /></div>
          </section>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={restart}>Analyser une autre vidéo</Button>
          </div>
        </div>
      )}
      {job.state.phase === "done" && user && fullAccess && job.state.result.status !== "rejected" && <p className="py-20 text-center text-mute">Ouverture du rapport…</p>}
    </div>
  );
}
