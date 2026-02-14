import { createClient } from "@supabase/supabase-js";

let client;

// Auth-only client using the publishable/anon key.
// Supabase "secret" keys may be blocked for auth endpoints, but anon keys work.
export function getSupabaseAuthClient() {
  if (client) {
    return client;
  }

  const url = (process.env.SUPABASE_URL || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();

  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

