import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { isStripeConfigured, priceFor, stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SITE } from "@/config/site";

const Body = z.object({ plan: z.enum(["monthly", "annual"]), acceptedTerms: z.literal(true) });

export async function POST(req: Request) {
  if (!isStripeConfigured) return NextResponse.json({ error: "Le paiement n'est pas encore configuré sur ce site." }, { status: 503 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide : accepte les conditions de vente." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: sub } = await admin.from("subscriptions").select("stripe_customer_id, status").eq("user_id", user.id).maybeSingle();
  if (sub && ["active", "trialing"].includes(sub.status)) return NextResponse.json({ error: "Tu as déjà un abonnement actif." }, { status: 409 });

  let customer = sub?.stripe_customer_id as string | undefined;
  if (!customer) {
    const c = await stripe().customers.create({ email: user.email, metadata: { user_id: user.id } });
    customer = c.id;
    await admin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customer, status: "none" });
  }
  const origin = SITE.url;
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceFor(parsed.data.plan), quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: false,
    locale: "fr",
    automatic_tax: { enabled: false },
    consent_collection: { terms_of_service: "required" },
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/abonnement?plan=${parsed.data.plan}&checkout=cancel`,
  });
  return NextResponse.json({ url: session.url });
}
