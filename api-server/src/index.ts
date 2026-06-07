import app from "./app.js";
import { logger } from "./lib/logger.js";
import { getUncachableStripeClient } from "./stripeClient.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initStripe() {
  try {
    const stripe = await getUncachableStripeClient();
    const account = await stripe.accounts.retrieve();
    logger.info({ accountId: account.id }, "Stripe initialized successfully");
  } catch (err) {
    logger.warn({ err }, "Stripe init failed — integration may not be connected yet");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await initStripe();
});
