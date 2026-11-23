"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { clearVideos } from "@/lib/store/videoStore";
import { PLANS, formatPrice } from "@/config/pricing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageSkeleton, PageTitle } from "../Paywall";

export function AccountPage() {
  const { user, data, loading, repo, refresh, demo } = useAccount();
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  if (loading) return <PageSkeleton />;
  const s = data.subscription;

  async function portal() {
    const r = await fetch("/api/billing-portal", { method: "POST" });
    const j = await r.json();
    if (r.ok) window.location.href = j.url; else setMsg(j.error);
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ user, ...data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "homeform-mes-donnees.json"; a.click();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle eyebrow={user?.email} title="Mon compte" />
      <section className="rounded-[24px] border border-line p-6">
        <p className="eyebrow">Abonnement</p>
        {hasAccess(s) ? (
          <>
            <p className="mt-3 text-xl font-semibold">{s.status === "dev" ? "Accès de test (développement)" : `${s.plan ? PLANS[s.plan].label : "Actif"} · ${s.plan ? formatPrice(PLANS[s.plan].price) + " " + PLANS[s.plan].period : ""}`}</p>
            {s.currentPeriodEnd && <p className="mt-1 text-sm text-bone/70">{s.cancelAtPeriodEnd ? "Se termine le" : "Prochain renouvellement le"} {new Date(s.currentPeriodEnd).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>}
            {s.status !== "dev" && <Button variant="outline" size="sm" className="mt-4" onClick={portal}>Gérer, changer ou résilier</Button>}
            {s.status === "dev" && !demo && <Button variant="outline" size="sm" className="mt-4" onClick={async () => { await repo.setDevSubscription(user!, { status: "none" }); await refresh(); }}>Désactiver l’accès de test</Button>}
          </>
        ) : (
          <>
            <p className="mt-3 text-bone/70">{s.status === "past_due" ? "Paiement en échec : mets à jour ton moyen de paiement." : s.status === "canceled" ? "Abonnement résilié." : "Aucun abonnement actif."}</p>
            <div className="mt-4 flex gap-2">{s.status === "past_due" ? <Button size="sm" onClick={portal}>Mettre à jour</Button> : <ButtonLink href="/abonnement" size="sm" arrow>Voir l’offre</ButtonLink>}</div>
          </>
        )}
        {msg && <p role="alert" className="mt-3 text-sm text-flare">{msg}</p>}
      </section>
      <section className="rounded-[24px] border border-line p-6">
        <p className="eyebrow">Données et confidentialité</p>
        <ul className="mt-3 space-y-2 text-sm text-bone/75">
          <li>Tes vidéos sont analysées sur ton appareil et ne sont pas envoyées sur nos serveurs.</li>
          <li>Seuls les résultats chiffrés des analyses, ton programme et tes séances sont enregistrés dans ton compte.</li>
          <li>Partage avec le coach IA : {data.coachConsent ? "activé" : "désactivé"} (modifiable dans Coach IA).</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>Exporter mes données (JSON)</Button>
          <Button variant="outline" size="sm" onClick={async () => { await clearVideos(); setMsg("Vidéos supprimées de cet appareil."); }}>Supprimer les vidéos de cet appareil</Button>
        </div>
      </section>
      <section className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={async () => { await repo.signOut(); router.push("/"); router.refresh(); }}>Se déconnecter</Button>
        <Button variant="ghost" className="text-flare" onClick={async () => {
          if (!confirm("Supprimer définitivement ton compte et toutes tes données ? Ton abonnement sera résilié.")) return;
          try { await clearVideos(); await repo.deleteAccount(user!); router.push("/"); } catch (e) { setMsg((e as Error).message); }
        }}>Supprimer mon compte</Button>
      </section>
    </div>
  );
}
