import { corsMiddleware } from "../utils/cors.js";
import { requireUser, sendError } from "../utils/auth.js";
import { ensureProfile } from "../utils/account.js";
import { getStripeClient, getFrontendUrl } from "../utils/stripe-client.js";
import { getSupabaseAdmin } from "../utils/supabase-admin.js";

async function ensureStripeCustomer(profile, user) {
  const stripe = getStripeClient();
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email || undefined,
    metadata: {
      userId: user.id,
    },
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to store stripe customer: ${error.message}`);
  }

  return customer.id;
}

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
    const stripe = getStripeClient();
    const customerId = await ensureStripeCustomer(profile, user);

    const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
    if (!priceId) {
      throw new Error("Missing STRIPE_PRICE_ID_PRO_MONTHLY");
    }

    const frontendUrl = getFrontendUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/?billing=success`,
      cancel_url: `${frontendUrl}/?billing=cancel`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return sendError(res, error, "Failed to create checkout session");
  }
}
