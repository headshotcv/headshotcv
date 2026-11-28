import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

/** Authenticated user for API routes (Supabase only). */
export async function requireUser() {
  if (!isSupabaseConfigured) return null;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "", sb } : null;
}
