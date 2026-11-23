/**
 * Offres — modifie ici les prix affichés. Les prix réellement facturés sont ceux des
 * Price IDs Stripe (STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL) : garde-les synchronisés.
 */
export type PlanId = "monthly" | "annual";

export const PLANS: Record<PlanId, { id: PlanId; label: string; price: number; period: string; periodShort: string; renewal: string; note?: string }> = {
  monthly: {
    id: "monthly",
    label: "Mensuel",
    price: 9.9,
    period: "par mois",
    periodShort: "/mois",
    renewal: "Renouvelé automatiquement chaque mois. Résiliable à tout moment depuis ton compte, effet à la fin de la période en cours.",
  },
  annual: {
    id: "annual",
    label: "Annuel",
    price: 79.9,
    period: "par an",
    periodShort: "/an",
    renewal: "Payé en une fois pour 12 mois, renouvelé automatiquement chaque année. Résiliable à tout moment, effet à la fin de l'année en cours.",
  },
};

export const CURRENCY = "EUR";

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: CURRENCY }).format(n);
}

/** Économie réelle de l'annuel par rapport à 12 mois au tarif mensuel (calculée, pas une promo). */
export function annualSaving() {
  const yearly = PLANS.monthly.price * 12;
  return { amount: yearly - PLANS.annual.price, percent: Math.round((1 - PLANS.annual.price / yearly) * 100), perMonth: PLANS.annual.price / 12 };
}

export const INCLUDED = [
  "Analyse vidéo du squat et des pompes, illimitée",
  "Rapport complet : répétitions, amplitudes, alignement, rythme, moments clés",
  "Programme personnalisé sur plusieurs semaines, ajusté à ton matériel",
  "Suivi des séances, des répétitions et de la régularité",
  "Coach IA conversationnel spécialisé dans l'entraînement à domicile",
  "Vidéos analysées sur ton appareil — non envoyées sur nos serveurs",
];

export const FREE = [
  "Une analyse complète du mouvement, sans compte",
  "Aperçu du rapport : exercice détecté, répétitions, qualité de la vidéo et une observation détaillée",
];
