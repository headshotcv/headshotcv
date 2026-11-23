"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "@/lib/store/AccountProvider";
import type { AccountData } from "@/lib/store/types";
import { byId } from "@/lib/program/exercises";
import { GOALS } from "@/lib/program/generate";
import { Paywall, PageTitle } from "../Paywall";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

const EQUIP: Record<string, string> = { chair: "chaise", mat: "tapis", band: "élastique", dumbbells: "haltères", bar: "barre de traction" };

/** Compact, factual summary sent to the coach only with the user's consent. */
export function buildCoachContext(d: AccountData): string {
  const lines: string[] = [];
  if (d.profile) {
    lines.push(`Objectif : ${GOALS[d.profile.goal].title}. Niveau : ${["débutant", "intermédiaire", "avancé"][d.profile.level - 1]}. ${d.profile.days} séances/semaine de ${d.profile.minutes} min.`);
    lines.push(`Matériel : ${d.profile.equipment.length ? d.profile.equipment.map((e) => EQUIP[e] ?? e).join(", ") : "aucun"}.`);
  }
  const recent = d.logs.slice(0, 6);
  if (recent.length) {
    lines.push("Dernières séances :");
    for (const l of recent) lines.push(`- ${new Date(l.createdAt).toLocaleDateString("fr-FR")} ${l.title} : ${l.items.map((i) => `${byId(i.exerciseId)?.name} ${i.sets.map((s) => s.done).join("/")}${i.unit === "reps" ? " rép." : " s"}`).join(" ; ")}`);
  } else lines.push("Aucune séance enregistrée.");
  const a = d.analyses[0];
  if (a) lines.push(`Dernière analyse vidéo (${a.exercise}) : ${a.result.summary.repCount} rép., angle au point bas ${Math.round(a.result.summary.avgMinAngle ?? 0)}°. Observations : ${a.result.observations.map((o) => o.title).join(" ; ") || "aucune"}.`);
  return lines.join("\n").slice(0, 5800);
}

const SUGGESTIONS = ["Je n’ai que 15 minutes aujourd’hui, tu me proposes quoi ?", "Comment progresser vers ma première pompe complète ?", "J’ai des courbatures, je m’entraîne quand même ?", "Quel échauffement avant mes squats ?"];

export function CoachPage() {
  return <Paywall feature="Coach IA"><Chat /></Paywall>;
}

function Chat() {
  const { data, user, repo, refresh, demo } = useAccount();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/coach", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(-20), context: data.coachConsent ? buildCoachContext(data) : undefined }) });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "Le coach est indisponible.");
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMsgs(next);
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col">
      <PageTitle eyebrow="Entraînement à domicile" title="Coach IA" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={data.coachConsent} onChange={async (e) => { await repo.setCoachConsent(user!, e.target.checked); await refresh(); }} className="mt-1 accent-[var(--color-volt)]" />
          <span>Partager avec le coach mon profil, mes 6 dernières séances et ma dernière analyse <span className="text-mute">(envoyés à notre fournisseur d’IA uniquement pour générer la réponse)</span></span>
        </label>
        {demo && <span className="font-mono text-[10px] uppercase text-mute">Démo : réponses réelles du coach</span>}
      </div>
      <div className="flex-1 space-y-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="py-6">
            <p className="text-bone/70">Pose une question sur ton entraînement. Le coach ne remplace pas un professionnel de santé et ne pose aucun diagnostic.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="focus-ring rounded-full border border-line px-4 py-2 text-left text-sm text-bone/80 hover:border-volt">{s}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed", m.role === "user" ? "ml-auto bg-bone text-ink" : "border border-line bg-ink-2")}>
            {m.content || <span className="inline-flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-volt" /><span className="h-2 w-2 animate-bounce rounded-full bg-volt [animation-delay:.15s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-volt [animation-delay:.3s]" /></span>}
          </div>
        ))}
        {error && <p role="alert" className="rounded-xl border border-flare/40 p-3 text-sm text-flare">{error}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-24 mt-6 flex gap-2 rounded-full border border-line bg-ink/90 p-1.5 backdrop-blur lg:bottom-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} placeholder="Écris ta question…" aria-label="Message au coach" className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none" />
        <Button type="submit" size="sm" disabled={busy || !input.trim()}>Envoyer</Button>
      </form>
    </div>
  );
}
