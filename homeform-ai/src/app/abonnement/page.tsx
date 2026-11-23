import { Suspense } from "react";
import { Checkout } from "@/components/auth/Checkout";
import { isStripeConfigured } from "@/lib/stripe/server";
export const metadata = { title: "Abonnement" };
export default function Page() {
  return <Suspense><Checkout stripeReady={isStripeConfigured} /></Suspense>;
}
