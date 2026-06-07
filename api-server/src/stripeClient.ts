import Stripe from "stripe";

function getSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return secretKey;
}

// WARNING: Never cache this client — always call to get a fresh one.
export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(getSecretKey());
}

export async function getStripePublishableKey(): Promise<string> {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("STRIPE_PUBLISHABLE_KEY is not set");
  }
  return publishableKey;
}
