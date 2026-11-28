import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { isStripeConfigured, stripe } from "@/lib/stripe/server";
import { SITE } from "@/config/site";

/** Stripe customer portal: change plan, update card, cancel, download invoices. */
export async function POST() {
  if (!isStripeConfigured) return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { data } = await user.sb.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.json({ error: "Aucun abonnement trouvé." }, { status: 404 });
  const s = await stripe().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${SITE.url}/app/compte` });
  return NextResponse.json({ url: s.url });
}
