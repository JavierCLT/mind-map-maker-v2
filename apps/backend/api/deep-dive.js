import { corsMiddleware } from "../utils/cors.js";
import { rateLimiter } from "../utils/rate-limiter.js";
import { getOpenAIClient, getOpenAIModel } from "../utils/openai-client.js";
import {
  buildDeepDivePrompt,
  DEEP_DIVE_ACTIONS,
} from "../utils/mindmap-prompts.js";
import {
  extractTextFromCompletion,
  parseJsonResponse,
} from "../utils/json-response.js";
import { requireUser, sendError } from "../utils/auth.js";

function validatePayload(payload) {
  const { topic, markdown, nodeName, nodePath, action, compareWith } =
    payload || {};

  if (typeof topic !== "string" || !topic.trim()) {
    return { ok: false, message: "Topic is required" };
  }

  if (typeof markdown !== "string" || !markdown.trim()) {
    return { ok: false, message: "Current markdown is required" };
  }

  if (typeof nodeName !== "string" || !nodeName.trim()) {
    return { ok: false, message: "Selected node is required" };
  }

  if (!Array.isArray(nodePath) || nodePath.length === 0) {
    return { ok: false, message: "Selected node path is required" };
  }

  if (!DEEP_DIVE_ACTIONS.has(action)) {
    return { ok: false, message: "Invalid deep-dive action" };
  }

  if (
    compareWith !== undefined &&
    compareWith !== null &&
    typeof compareWith !== "string"
  ) {
    return { ok: false, message: "compareWith must be a string" };
  }

  return {
    ok: true,
    data: {
      topic: topic.trim(),
      markdown,
      nodeName: nodeName.trim(),
      nodePath: nodePath.map((p) => String(p).trim()).filter(Boolean),
      action,
      compareWith: typeof compareWith === "string" ? compareWith.trim() : "",
    },
  };
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
    await requireUser(req);

    const rateLimit = await rateLimiter(req);
    if (rateLimit.limited) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Too many requests, please try again after 15 minutes",
      });
    }

    const validated = validatePayload(req.body);
    if (!validated.ok) {
      return res.status(400).json({ error: validated.message });
    }

    const payload = validated.data;
    const model = getOpenAIModel("gpt-4.1");
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert learning architect. Follow the JSON contract strictly.",
        },
        {
          role: "user",
          content: buildDeepDivePrompt(payload),
        },
      ],
      temperature: 0.2,
      max_tokens: 2800,
    });

    const text = extractTextFromCompletion(completion);
    const parsed = parseJsonResponse(text);

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : `Deep dive completed for "${payload.nodeName}".`;

    const contentMarkdown =
      typeof parsed.contentMarkdown === "string"
        ? parsed.contentMarkdown.trim()
        : "";

    if (!contentMarkdown) {
      throw new Error("Model returned empty deep-dive content");
    }

    return res.status(200).json({
      action: payload.action,
      nodeName: payload.nodeName,
      nodePath: payload.nodePath,
      summary,
      contentMarkdown,
      model,
    });
  } catch (error) {
    console.error("Error in deep-dive endpoint:", error);
    return sendError(res, error, "Failed to deep dive node");
  }
}
