import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Service-role client — bypasses RLS. Server-only.
 *
 * `newsletter_subscribers` has RLS on with **no** anon/authenticated policy, so
 * subscriber email addresses are unreachable from the browser by construction.
 * Everything that touches them (subscribe, confirm, unsubscribe, the monthly
 * digest) runs here instead, after the caller has checked its own authorization.
 *
 * Never import this into a Client Component. `SUPABASE_SERVICE_ROLE_KEY` has no
 * `NEXT_PUBLIC_` prefix, so a stray client import fails at build time rather
 * than leaking the key into the bundle.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — newsletter features are unavailable.",
    );
  }
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when the service role is configured, so callers can degrade politely. */
export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
