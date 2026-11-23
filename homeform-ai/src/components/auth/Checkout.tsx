"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountProvider, useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { repo } from "@/lib/store/repo";
import { allowDevUnlock } from "@/lib/supabase/config";
import { INCLUDED, PLANS, annualSaving, formatPrice, type PlanId } from "@/config/pricing";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LocalModeBanner } from "@/components/app/LocalModeBanner";
import { cn } from "@/lib/cn";

function Inner({ stripeReady }: { stripeReady: boolean }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { user, data, loading, refresh } = useAccount();
  const [plan, setPlan] = useState<PlanId>((sp.get("plan") as PlanId) === "monthly" ? "monthly" : "annual");
  const [terms, setTerms] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelled = sp.get("checkout") === "cancel";
  const p = PLANS[plan];
  const s = annualSaving();

  if (loading) return null;
  if (hasAccess(data.subscription)) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="display text-5xl">Tu es déjà abonné</h1>
        <Link href="/app" className="mt-6 inline-block underline">Aller à mon espace</Link>
      </div>
    );
  }

  async function pay() {
    setError(null);
    if (!terms || !immediate) return setError("Merci de cocher les deux cases pour continuer.");
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan, acceptedTerms: true }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Paiement indisponible.");
      window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  }
  async function devUnlock() {
    if (!user) return;
    await repo.setDevSubscription(user, { status: "dev", plan });
    await refresh();
    router.push("/app?checkout=dev");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 py-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="eyebrow !text-volt">Étape finale</p>
        <h1 className="display mt-3 text-5xl sm:text-7xl">Ton abonnement</h1>
        <ul className="mt-8 space-y-3 text-[15px]">
          {INCLUDED.map((f) => <li key={f} className="flex gap-3"><span className="text-volt">✓</span>{f}</li>)}
        </ul>
      </div>
      <div className="rounded-[24px] border border-line bg-ink-2 p-6 sm:p-8">
        {cancelled && <p className="mb-4 rounded-xl border border-line p-3 text-sm text-bone/80">Paiement annulé : aucun montant n’a été débité.</p>}
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Formule">
          {(["monthly", "annual"] as PlanId[]).map((id) => (
            <button key={id} role="radio" aria-checked={plan === id} onClick={() => setPlan(id)} className={cn("focus-ring rounded-2xl border p-4 text-left", plan === id ? "border-volt bg-volt/[0.06]" : "border-line")}>
              <span className="block text-sm text-bone/70">{PLANS[id].label}</span>
              <span className="text-2xl font-bold tabular">{formatPrice(PLANS[id].price)}</span>
              <span className="text-sm text-mute"> {PLANS[id].periodShort}</span>
            </button>
          ))}
        </div>
        <dl className="mt-6 space-y-2 border-y border-line py-5 text-sm">
          <div className="flex justify-between"><dt className="text-bone/70">À payer aujourd’hui</dt><dd className="font-semibold tabular">{formatPrice(p.price)} TTC</dd></div>
          <div className="flex justify-between"><dt className="text-bone/70">Renouvellement</dt><dd>{plan === "annual" ? "chaque année" : "chaque mois"}, même prix</dd></div>
          {plan === "annual" && <div className="flex justify-between"><dt className="text-bone/70">Équivalent mensuel</dt><dd className="tabular">{formatPrice(s.perMonth)}</dd></div>}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-bone/70">{p.renewal}</p>
        <label className="mt-5 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 accent-[var(--color-volt)]" />
          <span>J’accepte les <Link href="/legal/cgv" target="_blank" className="underline">conditions générales de vente</Link>, y compris le renouvellement automatique décrit ci-dessus.</span>
        </label>
        <label className="mt-3 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={immediate} onChange={(e) => setImmediate(e.target.checked)} className="mt-1 accent-[var(--color-volt)]" />
          <span>Je demande l’accès immédiat au service. Je peux me rétracter sous 14 jours ; dans ce cas, un montant proportionnel à la période déjà utilisée pourra être retenu.</span>
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl border border-flare/40 p-3 text-sm text-flare">{error}</p>}
        {stripeReady ? (
          <Button size="lg" arrow className="mt-6 w-full" disabled={busy} onClick={pay}>{busy ? "Redirection…" : `Payer ${formatPrice(p.price)} avec Stripe`}</Button>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="rounded-xl border border-amber-300/40 bg-amber-300/[0.06] p-3 text-sm text-amber-100">Le paiement n’est pas encore configuré sur ce site. Aucun paiement ne peut être effectué.</p>
            {allowDevUnlock && <Button variant="outline" className="w-full" onClick={devUnlock}>Mode développement : activer un accès de test (gratuit)</Button>}
          </div>
        )}
        <p className="mt-4 text-center text-xs text-mute">Paiement sécurisé par Stripe. HOMEFORM ne stocke jamais tes données bancaires.</p>
      </div>
    </div>
  );
}

export function Checkout({ stripeReady }: { stripeReady: boolean }) {
  return (
    <AccountProvider>
      <LocalModeBanner />
      <header className="border-b border-line"><div className="wrap flex h-16 items-center"><Logo /></div></header>
      <main className="wrap"><Inner stripeReady={stripeReady} /></main>
    </AccountProvider>
  );
}
