"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { EXERCISE_LABEL } from "@/components/analysis/ReportView";
import { ResultView } from "@/components/analyze/ResultView";
import { AnalyzerFlow } from "@/components/analyze/AnalyzerFlow";
import { deleteVideo, getVideo, type LocalVideo } from "@/lib/store/videoStore";
import { ButtonLink, Button } from "@/components/ui/Button";
import { PageSkeleton, PageTitle } from "../Paywall";

export function AnalyzePage() {
  const { user, data, loading } = useAccount();
  if (loading) return <PageSkeleton />;
  return <AnalyzerFlow mode="app" user={user} fullAccess={hasAccess(data.subscription)} />;
}

export function AnalysesListPage() {
  const { data, loading, base } = useAccount();
  if (loading) return <PageSkeleton />;
  return (
    <div>
      <PageTitle eyebrow={`${data.analyses.length} analyse${data.analyses.length > 1 ? "s" : ""}`} title="Mes analyses"><ButtonLink href={`${base}/analyser`} arrow>Nouvelle analyse</ButtonLink></PageTitle>
      {data.analyses.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-line p-10 text-center">
          <p className="text-lg font-semibold">Aucune analyse pour l’instant</p>
          <p className="mt-1 text-bone/70">Filme un squat ou une série de pompes pour commencer.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.analyses.map((a) => {
            const imp = a.result.observations.filter((o) => o.kind === "improve");
            return (
              <li key={a.id}>
                <Link href={`${base}/analyses/${a.id}`} className="focus-ring block rounded-2xl border border-line bg-ink-2 p-5 transition-colors hover:border-bone/30">
                  <div className="flex items-center justify-between"><p className="font-mono text-xs text-mute">{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>{a.status === "uncertain" && <span className="font-mono text-[10px] uppercase text-amber-200">Fiabilité réduite</span>}</div>
                  <p className="mt-3 text-xl font-bold [font-stretch:85%]">{a.exercise ? EXERCISE_LABEL[a.exercise] : "—"}</p>
                  <p className="mt-1 text-sm text-bone/70">{a.result.summary.repCount} rép. · {a.exercise === "pushup" ? "coude" : "genou"} {Math.round(a.result.summary.avgMinAngle ?? 0)}° au point bas</p>
                  <p className="mt-3 text-sm">{imp.length ? <span className="text-flare">● {imp[0].title}{imp.length > 1 ? ` (+${imp.length - 1})` : ""}</span> : <span className="text-volt">● Aucun point à travailler relevé</span>}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AnalysisDetailPage({ id }: { id: string }) {
  const { data, loading, base, user, repo, refresh } = useAccount();
  const router = useRouter();
  const [video, setVideo] = useState<LocalVideo | null | undefined>(undefined);
  useEffect(() => { getVideo(id).then(setVideo); }, [id]);
  if (loading) return <PageSkeleton />;
  const a = data.analyses.find((x) => x.id === id);
  if (!a) return <div className="py-20 text-center"><p>Analyse introuvable.</p><ButtonLink href={`${base}/analyses`} className="mt-4">Mes analyses</ButtonLink></div>;
  const access = hasAccess(data.subscription);
  return (
    <div>
      <Link href={`${base}/analyses`} className="focus-ring mb-6 inline-block font-mono text-xs uppercase tracking-[0.14em] text-bone/70">← Mes analyses</Link>
      <ResultView result={a.result} frames={video?.frames} blob={video?.blob ?? null} locked={!access} unlockSlot={<ButtonLink href="/abonnement" size="sm" arrow>Débloquer le rapport complet</ButtonLink>} />
      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        {video && <Button variant="outline" size="sm" onClick={async () => { await deleteVideo(id); setVideo(null); }}>Supprimer la vidéo de cet appareil</Button>}
        <Button variant="ghost" size="sm" onClick={async () => { if (!confirm("Supprimer définitivement cette analyse ?")) return; await deleteVideo(id); await repo.deleteAnalysis(user!, id); await refresh(); router.push(`${base}/analyses`); }}>Supprimer l’analyse</Button>
      </div>
    </div>
  );
}
