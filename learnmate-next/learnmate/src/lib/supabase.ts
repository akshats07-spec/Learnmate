// ──────────────────────────────────────────────────────────────
// Supabase client setup — upgraded to support SSR + browser auth
// ──────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Server-side admin client using service-role key (never send to browser) */
export function getAdminSupabase() {
  if (!hasSupabase || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Browser-side anon client for client components */
export function getBrowserSupabase() {
  if (!hasSupabase) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
