import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Singleton browser client — safe to call from any client component. */
export function getBrowserClient() {
  client ??= createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
  );
  return client;
}
