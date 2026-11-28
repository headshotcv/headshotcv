"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { Paywall, PageTitle } from "../Paywall";
import { Button } from "@/components/ui/Button";
import { ExerciseDemo } from "@/components/figure/ExerciseDemo";
import { LiveCamera } from "@/components/analyze/LiveCamera";
import { levelFromAssessment, baselineFrom } from "@/lib/assessment";
import { generateProgram } from "@/lib/program/generate";
import type { Assessment } from "@/lib/store/types";
import { newId } from "@/lib/store/id";
import { cn } from "@/lib/cn";
import type { DemoKey } from "@/lib/program/poses";

type Key = "pushups" | "squats60" | "plank" | "wallSit";
const TESTS: { key: Key; title: string; how: string; unit: string; mode: "count" | "timer60" | "hold"; demo: DemoKey; camera?: "pushup" | "squat" }[] = [
  { key: "pushups", title: "Maximum de pompes", how: "Un maximum de répétitions propres, sans pause de plus de 2 s. Choisis la variante que tu maîtrises.", unit: "rép.", mode: "count", demo: "pushup", camera: "pushup" },
  { key: "squats60", title: "Squats en 60 secondes", how: "Un maximum de squats complets en une minute, à vitesse contrôlée.", unit: "rép.", mode: "timer60", demo: "squat", camera: "squat" },
  { key: "plank", title: "Planche sur les mains", how: "Tiens la position corps aligné le plus longtemps possible. Arrête dès que les hanches tombent.", unit: "s", mode: "hold", demo: "plank" },
  { key: "wallSit", title: "Chaise contre le mur", how: "Cuisses proches de l’horizontale, dos au mur. Arrête dès que la position se dégrade.", unit: "s", mode: "hold", demo: "wall-sit" },
];

export function AssessmentPage() {
  return <Paywall feature="Bilan de départ"><Inner /></Paywall>;
}

function Inner() {
  const { data, user, repo, refresh, base } = useAccount();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState<Record<Key, number>>({ pushups: 0, squats60: 0, plank: 0, wallSit: 0 });
  const [variant, setVariant] = useState<Assessment["pushupVariant"]>("knee-pushup");
  const [timer, setTimer] = useState<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camErr, setCamErr] = useState<string | null>(null);
  const [usedCamera, setUsedCamera] = useState(false);
  const [saved, setSaved] = useState<Assessment | null>(null);
  const test = TESTS[step];

  useEffect(() => {
    if (timer === null) return;
    const id = setInterval(() => setTimer((t) => {
      if (t === null) return null;
      if (test.mode === "timer60" && t <= 1) { clearInterval(id); return 0; }
      return test.mode === "timer60" ? t - 1 : t + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [timer !== null, test.mode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const set = (v: number) => setVals((x) => ({ ...x, [test.key]: Math.max(0, v) }));
  const stopCam = () => { stream?.getTracks().forEach((t) => t.stop()); setStream(null); };
  async function openCam() {
    setCamErr(null);
    try { setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } }, audio: false })); setUsedCamera(true); }
    catch { setCamErr("Caméra indisponible : saisis le nombre à la main."); }
  }
  function next() { stopCam(); setTimer(null); if (step < TESTS.length - 1) setStep(step + 1); else finish(); }
  async function finish() {
    const a: Assessment = { id: newId(), createdAt: new Date().toISOString(), pushupVariant: variant, ...vals, cameraCounted: usedCamera };
    await repo.addAssessment(user!, a);
    await refresh();
    setSaved(a);
  }

  if (saved) {
    const lvl = levelFromAssessment(saved);
    const prev = data.assessments.find((x) => x.id !== saved.id);
    return (
      <div className="mx-auto max-w-2xl">
        <PageTitle eyebrow="Bilan enregistré · +150 XP" title="Ton point de départ" />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line">
          {TESTS.map((t) => (
            <div key={t.key} className="bg-ink-2 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{t.title}</p>
              <p className="display mt-2 text-5xl tabular">{saved[t.key]}<span className="text-xl text-mute"> {t.unit}</span></p>
              {prev && <p className={cn("font-mono text-xs", saved[t.key] >= prev[t.key] ? "text-volt" : "text-flare")}>{saved[t.key] - prev[t.key] >= 0 ? "+" : ""}{saved[t.key] - prev[t.key]} vs bilan précédent</p>}
            </div>
          ))}
        </div>
        <p className="mt-6 text-bone/75">Niveau suggéré : <strong className="text-bone">{["débutant", "intermédiaire", "avancé"][lvl - 1]}</strong>. Les objectifs de ton programme peuvent être calculés à partir de ces résultats (environ 60 % de ton maximum par série).</p>
        <p className="mt-2 text-xs text-mute">Indicatif : un bilan ne remplace pas l’avis d’un professionnel. Refais-le toutes les 4 semaines pour mesurer ta progression.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {data.profile && <Button arrow onClick={async () => { const p = { ...data.profile!, level: lvl, baseline: baselineFrom(saved) }; await repo.saveProfile(user!, p, generateProgram(p)); await refresh(); router.push(`${base}/programme`); }}>Adapter mon programme</Button>}
          <Button variant="outline" onClick={() => router.push(base)}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle eyebrow={`Test ${step + 1}/${TESTS.length} · 10 minutes au total`} title="Bilan de départ" />
      <div className="mb-6 flex gap-1.5">{TESTS.map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-volt" : "bg-line")} />)}</div>
      <p className="mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/[0.05] p-4 text-sm text-amber-100">Échauffe-toi 5 minutes avant. Arrête un test en cas de douleur. Ces tests ne conviennent pas si tu as une blessure ou une contre-indication médicale.</p>

      {stream && test.camera ? (
        <LiveCamera stream={stream} exercise={test.camera} mirror className="aspect-[3/4] rounded-[24px] border border-line sm:aspect-video" onState={(s) => set(s.reps)}>
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/80 to-transparent p-4">
            <Button variant="outline" size="sm" onClick={stopCam}>Fermer la caméra</Button>
            <Button size="sm" onClick={stopCam}>Valider {vals[test.key]} rép.</Button>
          </div>
        </LiveCamera>
      ) : (
        <ExerciseDemo demo={test.demo} className="aspect-video rounded-[24px] border border-line" label={test.title} />
      )}

      <h2 className="display mt-6 text-5xl">{test.title}</h2>
      <p className="mt-2 text-bone/75">{test.how}</p>

      {test.key === "pushups" && (
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Variante">
          {([["pushup", "Pompes classiques"], ["knee-pushup", "Sur les genoux"], ["incline-pushup", "Inclinées"]] as const).map(([v, l]) => (
            <button key={v} role="radio" aria-checked={variant === v} onClick={() => setVariant(v)} className={cn("focus-ring rounded-full border px-4 py-2 text-sm", variant === v ? "border-volt bg-volt/10" : "border-line")}>{l}</button>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-line p-5">
        {test.mode !== "count" && (
          <div className="mb-4 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => { if (timer === null) setTimer(test.mode === "timer60" ? 60 : 0); else { if (test.mode === "hold") set(timer); setTimer(null); } }}>{timer === null ? (test.mode === "timer60" ? "Lancer 60 s" : "Démarrer le chrono") : test.mode === "hold" ? "Stop" : "Arrêter"}</Button>
            {timer !== null && <span className={cn("display text-5xl tabular", test.mode === "timer60" && timer <= 10 ? "text-flare" : "text-volt")}>{timer}s</span>}
          </div>
        )}
        <p className="text-sm text-bone/70">{test.unit === "s" ? "Secondes tenues" : "Répétitions réalisées"}</p>
        <div className="mt-2 flex items-center gap-4">
          <button onClick={() => set(vals[test.key] - 1)} className="focus-ring h-12 w-12 rounded-full border border-line text-2xl" aria-label="Moins">−</button>
          <input type="number" inputMode="numeric" value={vals[test.key]} onChange={(e) => set(Number(e.target.value))} className="w-24 bg-transparent text-center text-5xl font-bold tabular outline-none" aria-label="Résultat" />
          <button onClick={() => set(vals[test.key] + 1)} className="focus-ring h-12 w-12 rounded-full border border-line text-2xl" aria-label="Plus">+</button>
        </div>
        {test.camera && !stream && <button onClick={openCam} className="focus-ring mt-4 text-sm text-volt underline">Compter avec la caméra (de profil, téléphone posé)</button>}
        {camErr && <p role="alert" className="mt-2 text-sm text-flare">{camErr}</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => { stopCam(); setTimer(null); setStep(step - 1); }}>← Précédent</Button>
        <Button arrow onClick={next}>{step < TESTS.length - 1 ? "Test suivant" : "Voir mon bilan"}</Button>
      </div>
    </div>
  );
}
