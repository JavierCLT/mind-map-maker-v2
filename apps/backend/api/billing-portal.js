import { corsMiddleware } from "../utils/cors.js";
import { requireUser, sendError } from "../utils/auth.js";
import { ensureProfile } from "../utils/account.js";
import { getStripeClient, getFrontendUrl } from "../utils/stripe-client.js";

export default async function handler(req, res) {
  corsMiddleware(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await requireUser(req);
    const profile = await ensureProfile(user);
    if (!profile.stripe_customer_id) {
      return res.status(400).json({
        error: "No billing account",
        message: "No Stripe customer found for this user.",
      });
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: getFrontendUrl(),
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return sendError(res, error, "Failed to create billing portal session");
  }
}
