import { getSupabaseAdmin } from "./supabase-admin.js";

export const FREE_MONTHLY_MAPS = 3;

function getMonthBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function isPaidProfile(profile) {
  if (!profile) return false;
  const status = String(profile.subscription_status || "").toLowerCase();
  const plan = String(profile.plan || "free").toLowerCase();
  const allowedStatus = status === "active" || status === "trialing";
  if (!allowedStatus || plan !== "pro") {
    return false;
  }

  if (!profile.current_period_end) {
    return true;
  }
  return new Date(profile.current_period_end) > new Date();
}

export async function ensureProfile(user) {
  const supabase = getSupabaseAdmin();

  const payload = {
    id: user.id,
    email: user.email || null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });
  if (upsertError) {
    throw new Error(`Failed to upsert profile: ${upsertError.message}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  return profile;
}

export async function getMonthlyMapCount(userId) {
  const supabase = getSupabaseAdmin();
  const { start, end } = getMonthBounds();

  const { count, error } = await supabase
    .from("mindmaps")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) {
    throw new Error(`Failed to load usage: ${error.message}`);
  }

  return count || 0;
}

export async function getAccountSummary(user) {
  const profile = await ensureProfile(user);
  const monthlyMapsUsed = await getMonthlyMapCount(user.id);
  const isPaid = isPaidProfile(profile);
  const monthlyMapsLimit = isPaid ? null : FREE_MONTHLY_MAPS;
  return {
    profile,
    isPaid,
    monthlyMapsUsed,
    monthlyMapsLimit,
    remainingMaps:
      monthlyMapsLimit === null ? null : Math.max(0, monthlyMapsLimit - monthlyMapsUsed),
  };
}

export async function saveMindmap({ id, userId, topic, markdown }) {
  const supabase = getSupabaseAdmin();
  const normalizedTopic = (topic || "").trim() || "Untitled Mind Map";

  if (id) {
    const { data, error } = await supabase
      .from("mindmaps")
      .update({
        topic: normalizedTopic,
        markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, topic, markdown, created_at, updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to update mindmap: ${error.message}`);
    }
    return data;
  }

  const { data, error } = await supabase
    .from("mindmaps")
    .insert({
      user_id: userId,
      topic: normalizedTopic,
      markdown,
    })
    .select("id, topic, markdown, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to save mindmap: ${error.message}`);
  }

  return data;
}

export async function listMindmaps(userId, limit = 30) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mindmaps")
    .select("id, topic, markdown, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list mindmaps: ${error.message}`);
  }

  return data || [];
}

export async function renameMindmap({ id, userId, topic }) {
  const supabase = getSupabaseAdmin();
  const normalizedTopic = (topic || "").trim();
  if (!normalizedTopic) {
    throw new Error("Topic is required");
  }

  const { data, error } = await supabase
    .from("mindmaps")
    .update({
      topic: normalizedTopic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, topic, markdown, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to rename mindmap: ${error.message}`);
  }

  return data;
}

export async function deleteMindmap({ id, userId }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mindmaps")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to delete mindmap: ${error.message}`);
  }

  return data;
}
