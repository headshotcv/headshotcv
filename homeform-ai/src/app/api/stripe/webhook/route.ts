import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { planForPrice, stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Source of truth for access: Stripe subscription events → subscriptions table. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const upsertFrom = async (s: Stripe.Subscription) => {
    const userId = s.metadata?.user_id;
    if (!userId) return;
    const item = s.items.data[0];
    const periodEnd = (item as unknown as { current_period_end?: number })?.current_period_end ?? (s as unknown as { current_period_end?: number }).current_period_end;
    await supabaseAdmin().from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: typeof s.customer === "string" ? s.customer : s.customer.id,
      stripe_subscription_id: s.id,
      status: s.status === "active" || s.status === "trialing" || s.status === "past_due" || s.status === "canceled" ? s.status : "none",
      plan: planForPrice(item?.price?.id),
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: s.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    });
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.subscription) await upsertFrom(await stripe().subscriptions.retrieve(typeof cs.subscription === "string" ? cs.subscription : cs.subscription.id));
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertFrom(event.data.object as Stripe.Subscription);
      break;
  }
  return NextResponse.json({ received: true });
}
