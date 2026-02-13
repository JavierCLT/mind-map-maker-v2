import { corsMiddleware } from "../utils/cors.js";
import { requireUser, sendError } from "../utils/auth.js";
import {
  deleteMindmap,
  listMindmaps,
  renameMindmap,
  saveMindmap,
} from "../utils/account.js";

function getMindmapId(req) {
  const fromQuery = req.query?.id;
  const fromBody = req.body?.id;
  const id = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery || fromBody;
  return typeof id === "string" ? id : "";
}

export default async function handler(req, res) {
  corsMiddleware(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const user = await requireUser(req);

    if (req.method === "GET") {
      const mindmaps = await listMindmaps(user.id, 50);
      return res.status(200).json({ mindmaps });
    }

    if (req.method === "POST") {
      const { id, topic, markdown } = req.body || {};
      if (typeof markdown !== "string" || !markdown.trim()) {
        return res.status(400).json({ error: "Markdown is required" });
      }

      const saved = await saveMindmap({
        id: typeof id === "string" ? id : undefined,
        userId: user.id,
        topic: typeof topic === "string" ? topic : "Untitled Mind Map",
        markdown,
      });

      return res.status(200).json({ mindmap: saved });
    }

    if (req.method === "PATCH") {
      const id = getMindmapId(req);
      const topic = typeof req.body?.topic === "string" ? req.body.topic : "";
      if (!id) {
        return res.status(400).json({ error: "Mindmap id is required" });
      }
      if (!topic.trim()) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const updated = await renameMindmap({
        id,
        userId: user.id,
        topic,
      });
      return res.status(200).json({ mindmap: updated });
    }

    if (req.method === "DELETE") {
      const id = getMindmapId(req);
      if (!id) {
        return res.status(400).json({ error: "Mindmap id is required" });
      }

      await deleteMindmap({
        id,
        userId: user.id,
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error, "Failed to handle mindmaps");
  }
}
