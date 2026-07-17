import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/** Cookie-aware server client for auth-dependent server code (route handlers, actions). */
export async function createAuthServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore when the
            // proxy refreshes sessions.
          }
        },
      },
    },
  );
}
