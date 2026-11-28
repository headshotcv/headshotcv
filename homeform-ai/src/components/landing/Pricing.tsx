"use client";
import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { FREE, INCLUDED, PLANS, annualSaving, formatPrice, type PlanId } from "@/config/pricing";
import { cn } from "@/lib/cn";

export function PricingCards({ next = "/analyser" }: { next?: string }) {
  const [plan, setPlan] = useState<PlanId>("annual");
  const s = annualSaving();
  const p = PLANS[plan];
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <div className="rounded-[24px] border border-line p-6 sm:p-8">
        <p className="eyebrow">Gratuit</p>
        <p className="display mt-4 text-6xl">0 €</p>
        <p className="mt-2 text-bone/60">Sans compte, sans carte bancaire.</p>
        <ul className="mt-8 space-y-3 text-[15px]">
          {FREE.map((f) => <li key={f} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-bone/50" />{f}</li>)}
        </ul>
        <ButtonLink href={next} variant="outline" className="mt-8 w-full">Essayer une analyse</ButtonLink>
      </div>
      <div className="relative overflow-hidden rounded-[24px] border border-volt/40 bg-gradient-to-b from-volt/[0.07] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="eyebrow !text-volt">HOMEFORM complet</p>
          <div className="flex rounded-full border border-line p-1 text-sm" role="radiogroup" aria-label="Période de facturation">
            {(["monthly", "annual"] as PlanId[]).map((id) => (
              <button key={id} role="radio" aria-checked={plan === id} onClick={() => setPlan(id)} className={cn("focus-ring rounded-full px-4 py-1.5 transition-colors", plan === id ? "bg-bone text-ink" : "text-bone/70")}>{PLANS[id].label}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="display text-7xl tabular">{formatPrice(p.price)}</span>
          <span className="text-bone/60">TTC {p.period}</span>
        </div>
        <p className="mt-2 h-6 text-sm text-bone/70">
          {plan === "annual" ? <>Soit {formatPrice(s.perMonth)} par mois · {formatPrice(s.amount)} de moins que 12 mois au tarif mensuel.</> : <>Sans engagement de durée.</>}
        </p>
        <ul className="mt-6 grid gap-3 text-[15px] sm:grid-cols-2">
          {INCLUDED.map((f) => <li key={f} className="flex gap-3"><svg viewBox="0 0 12 12" className="mt-1 h-3.5 w-3.5 shrink-0 text-volt"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>{f}</li>)}
        </ul>
        <ButtonLink href={`/inscription?plan=${plan}&next=/abonnement`} size="lg" arrow className="mt-8 w-full sm:w-auto">Choisir l’offre {p.label.toLowerCase()}</ButtonLink>
        <p className="mt-4 text-xs leading-relaxed text-mute">{p.renewal} Paiement sécurisé par Stripe. Prix TTC.</p>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="tarifs" className="border-t border-line py-24 sm:py-32" aria-labelledby="price-title">
      <div className="wrap">
        <SectionHead index="06" eyebrow="Tarifs" title={<span id="price-title">Un prix clair.<br /><span className="text-bone/40">Annulable en deux clics.</span></span>} />
        <div className="mt-14"><PricingCards /></div>
      </div>
    </section>
  );
}
