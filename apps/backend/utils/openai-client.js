import { OpenAI } from "openai";

let client;

export function getOpenAIClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY (or GROK_API_KEY fallback)");
  }

  const baseURL = process.env.OPENAI_BASE_URL;
  client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return client;
}

export function getOpenAIModel(defaultModel = "gpt-4.1") {
  return process.env.OPENAI_MODEL || defaultModel;
}
