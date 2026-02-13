import { getStripeClient } from "../utils/stripe-client.js";
import { getSupabaseAdmin } from "../utils/supabase-admin.js";

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length > 0) {
    return Buffer.concat(chunks);
  }
  if (typeof req.body === "string") {
    return Buffer.from(req.body);
  }
  if (req.body && typeof req.body === "object") {
    return Buffer.from(JSON.stringify(req.body));
  }
  return Buffer.from("");
}

async function upsertProfileFromSubscription(subscription) {
  const userId = subscription?.metadata?.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const status = subscription.status || "incomplete";

  const supabase = getSupabaseAdmin();
  const updates = {
    subscription_status: status,
    current_period_end: periodEnd,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id || null,
    plan: status === "active" || status === "trialing" ? "pro" : "free",
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...updates,
      },
      { onConflict: "id" },
    );
    if (error) {
      throw new Error(`Failed to update profile by userId: ${error.message}`);
    }
    return;
  }

  if (!customerId) {
    return;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("stripe_customer_id", customerId);
  if (error) {
    throw new Error(`Failed to update profile by customerId: ${error.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = getStripeClient();
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (webhookSecret) {
      if (!signature) {
        throw new Error("Missing stripe-signature header");
      }
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET in production");
      }
      if (req.body && typeof req.body === "object") {
        event = req.body;
      } else {
        const parsed = rawBody.toString("utf8");
        event = parsed ? JSON.parse(parsed) : {};
      }
    }

    if (!event?.type) {
      throw new Error("Invalid Stripe event payload");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertProfileFromSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertProfileFromSubscription(event.data.object);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).json({
      error: "Webhook handling failed",
      message: error?.message || "Unknown error",
    });
  }
}
