"use client";
import { useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS, formatPrice } from "@/config/pricing";

/** Gate for paid features. Explains exactly what is unlocked and for how much. */
export function Paywall({ feature, children }: { feature: string; children: React.ReactNode }) {
  const { data, loading } = useAccount();
  if (loading) return <PageSkeleton />;
  if (hasAccess(data.subscription)) return <>{children}</>;
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="eyebrow !text-volt">Abonnement requis</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">{feature}</h1>
      <p className="mt-4 text-bone/70">Cette partie est incluse dans l’abonnement HOMEFORM : {formatPrice(PLANS.monthly.price)} par mois ou {formatPrice(PLANS.annual.price)} par an, résiliable à tout moment.</p>
      <ButtonLink href="/abonnement" size="lg" arrow className="mt-8">Voir l’offre</ButtonLink>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="h-12 w-2/3 rounded-xl bg-white/[0.05]" />
      <div className="h-40 rounded-2xl bg-white/[0.04]" />
      <div className="h-40 rounded-2xl bg-white/[0.04]" />
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display mt-2 text-5xl sm:text-7xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
