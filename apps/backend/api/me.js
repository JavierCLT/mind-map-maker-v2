import { corsMiddleware } from "../utils/cors.js";
import { requireUser, sendError } from "../utils/auth.js";
import { getAccountSummary } from "../utils/account.js";

export default async function handler(req, res) {
  corsMiddleware(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await requireUser(req);
    const account = await getAccountSummary(user);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email || null,
      },
      plan: account.isPaid ? "pro" : "free",
      usage: {
        monthlyMapsUsed: account.monthlyMapsUsed,
        monthlyMapsLimit: account.monthlyMapsLimit,
        remainingMaps: account.remainingMaps,
      },
      billing: {
        subscriptionStatus: account.profile.subscription_status || "free",
        currentPeriodEnd: account.profile.current_period_end || null,
      },
    });
  } catch (error) {
    return sendError(res, error, "Failed to load account");
  }
}
