import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Server-side client for PUBLIC content reads (cities, phases, steps, …).
 * No cookies/session — content is public-read via RLS, which keeps content
 * pages statically renderable with ISR. Auth flows use the SSR client instead.
 */
export function createContentClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
}
