import { corsMiddleware } from "../utils/cors.js";
import { rateLimiter } from "../utils/rate-limiter.js";
import { getOpenAIClient, getOpenAIModel } from "../utils/openai-client.js";
import { buildGeneratePrompt } from "../utils/mindmap-prompts.js";
import { extractTextFromCompletion } from "../utils/json-response.js";
import { requireUser, sendError } from "../utils/auth.js";
import { FREE_MONTHLY_MAPS, getAccountSummary, saveMindmap } from "../utils/account.js";

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

    const rateLimit = await rateLimiter(req);
    if (rateLimit.limited) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Too many requests, please try again after 15 minutes",
      });
    }

    const { topic } = req.body || {};
    const trimmedTopic = typeof topic === "string" ? topic.trim() : "";
    if (!trimmedTopic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const account = await getAccountSummary(user);
    if (!account.isPaid && account.monthlyMapsUsed >= FREE_MONTHLY_MAPS) {
      return res.status(402).json({
        error: "Monthly free limit reached",
        message: "Free plan includes 3 maps per month. Upgrade for unlimited maps.",
        code: "QUOTA_EXCEEDED",
        usage: {
          monthlyMapsUsed: account.monthlyMapsUsed,
          monthlyMapsLimit: FREE_MONTHLY_MAPS,
          isPaid: false,
        },
      });
    }

    const model = getOpenAIModel("gpt-4.1");
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You create comprehensive learning mind maps in clean markdown. Return markdown only.",
        },
        { role: "user", content: buildGeneratePrompt(trimmedTopic) },
      ],
      temperature: 0.2,
      max_tokens: 3500,
    });

    const markdown = extractTextFromCompletion(completion);

    if (!markdown) {
      throw new Error("Failed to generate mindmap content");
    }

    const savedMindmap = await saveMindmap({
      userId: user.id,
      topic: trimmedTopic,
      markdown,
    });

    const refreshedAccount = await getAccountSummary(user);

    return res.status(200).json({
      markdown,
      model,
      mapId: savedMindmap.id,
      usage: {
        monthlyMapsUsed: refreshedAccount.monthlyMapsUsed,
        monthlyMapsLimit: refreshedAccount.monthlyMapsLimit,
        isPaid: refreshedAccount.isPaid,
      },
    });
  } catch (error) {
    console.error("Error generating mindmap:", error);
    return sendError(res, error, "Failed to generate mindmap");
  }
}
