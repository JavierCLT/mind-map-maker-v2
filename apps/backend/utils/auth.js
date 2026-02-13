import { getSupabaseAdmin } from "./supabase-admin.js";

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7).trim();
}

export async function requireUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    throw new HttpError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw new HttpError(401, "Invalid session", "AUTH_INVALID");
  }

  return data.user;
}

export function sendError(res, error, fallbackMessage) {
  const status = error?.status || 500;
  const message = error?.message || fallbackMessage;
  const code = error?.code;
  return res.status(status).json({
    error: fallbackMessage,
    message,
    code,
  });
}
