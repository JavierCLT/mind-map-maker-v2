import { corsMiddleware } from '../utils/cors.js';

export default async function handler(req, res) {
  corsMiddleware(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const model = (process.env.OPENAI_MODEL || "gpt-4.1").trim();
  
  return res.status(200).json({ 
    status: "ok", 
    message: "Mindmap Backend API is running",
    environment: process.env.VERCEL_ENV || 'development',
    capabilities: [
      "generate-mindmap",
      "deep-dive",
      "me",
      "mindmaps",
      "checkout",
      "billing-portal",
      "stripe-webhook"
    ],
    model
  });
}
