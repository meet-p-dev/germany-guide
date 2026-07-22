import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createAuthServerClient } from "@/lib/supabase/server-client";

/**
 * Whether the currently signed-in visitor is an admin.
 *
 * The database is the real gate: `is_admin()` reads `public.admins` keyed on
 * `auth.uid()`, and the content-table RLS policies enforce it on every write.
 * This helper is only for UI gating — hiding the /admin routes and the nav
 * link from non-admins. `getUser()` (not `getSession()`) is used because it
 * revalidates the JWT with the auth server rather than trusting the cookie.
 *
 * Wrapped in React `cache` so the layout, page, and nav can each ask without
 * repeating the round-trip within a single render.
 */
export const getAdminUser = cache(async (): Promise<User | null> => {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) return null;
  return user;
});

/** True when the current visitor is a signed-in admin. */
export async function getIsAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Gate a server component / layout: renders a 404 for anyone who is not a
 * signed-in admin, so the admin area is invisible (not just forbidden) to
 * everyone else. Returns the admin user for convenience.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) notFound();
  return user;
}

export interface AdminEntry {
  user_id: string;
  email: string;
  added_at: string;
  note: string | null;
}

/** The current admin list (email + when granted). Admin-guarded in the DB. */
export async function listAdmins(): Promise<AdminEntry[]> {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.rpc("admin_list_admins");
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminEntry[];
}
