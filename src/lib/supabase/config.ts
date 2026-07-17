/**
 * Supabase connection values. Both are PUBLIC client credentials (the
 * publishable key ships in the browser bundle by design; data access is
 * governed by RLS) — the env vars simply allow overriding per environment,
 * with the production project as fallback.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ilfhjffpzvzphbvhdpup.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_-W8nbreFb9CNY_C7LCstDw_IdJwZ9Cn";
