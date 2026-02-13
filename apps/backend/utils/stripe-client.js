import Stripe from "stripe";

let stripe;

export function getStripeClient() {
  if (stripe) {
    return stripe;
  }

  const apiKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripe = new Stripe(apiKey, {
    apiVersion: "2025-01-27.acacia",
  });
  return stripe;
}

export function getFrontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").trim();
}
