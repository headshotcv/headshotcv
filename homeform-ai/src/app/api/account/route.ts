import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isStripeConfigured, stripe } from "@/lib/stripe/server";

/** RGPD — right to erasure: cancels the subscription and deletes the account and all its data. */
export async function DELETE() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: sub } = await admin.from("subscriptions").select("stripe_subscription_id, status").eq("user_id", user.id).maybeSingle();
  if (isStripeConfigured && sub?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(sub.status)) {
    await stripe().subscriptions.cancel(sub.stripe_subscription_id);
  }
  // rows cascade on auth.users deletion (see supabase/migrations)
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
