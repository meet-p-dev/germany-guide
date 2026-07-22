"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/admin/auth";
import { coercePayload } from "@/lib/admin/coerce";
import { getTableConfig } from "@/lib/admin/schema";
import { createAuthServerClient } from "@/lib/supabase/server-client";

export interface ActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** id of the saved row, so the client can navigate to it. */
  id?: string;
}

const TABLES_WITH_UPDATED_AT = new Set(["steps", "city_steps"]);

/** Untyped view of the cookie-aware client — table name is dynamic here, and
 * RLS (not TypeScript) is what authorizes the write. */
async function adminDb(): Promise<SupabaseClient> {
  const supabase = await createAuthServerClient();
  return supabase as unknown as SupabaseClient;
}

export async function upsertRow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Re-check on the server: Server Actions are reachable by direct POST, not
  // only through our UI. RLS also enforces this, but fail fast and clearly.
  if (!(await getAdminUser())) {
    return { ok: false, error: "Not authorized." };
  }

  const tableName = String(formData.get("__table") ?? "");
  const table = getTableConfig(tableName);
  if (!table) return { ok: false, error: "Unknown table." };

  const id = String(formData.get("__id") ?? "").trim();
  const { payload, errors } = coercePayload(table, formData);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: errors };
  }

  if (TABLES_WITH_UPDATED_AT.has(table.name)) {
    payload.updated_at = new Date().toISOString();
  }

  const db = await adminDb();

  if (id) {
    const { error } = await db.from(table.name).update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true, id };
  }

  const { data, error } = await db.from(table.name).insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteRow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) {
    return { ok: false, error: "Not authorized." };
  }

  const tableName = String(formData.get("__table") ?? "");
  const table = getTableConfig(tableName);
  if (!table) return { ok: false, error: "Unknown table." };

  const id = String(formData.get("__id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing row id." };

  const db = await adminDb();
  const { error } = await db.from(table.name).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Grant admin to an existing account by email. The DB function runs as the
 * caller's session (so `is_admin()` inside it resolves), self-guards, and reads
 * auth.users to resolve the email.
 */
export async function addAdminByEmail(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) return { ok: false, error: "Not authorized." };

  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const note = String(formData.get("note") ?? "").trim();

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("admin_add_by_email", {
    target_email: email,
    admin_note: note || undefined,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function removeAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) return { ok: false, error: "Not authorized." };

  const userId = String(formData.get("user_id") ?? "").trim();
  if (!userId) return { ok: false, error: "Missing user id." };

  const supabase = await createAuthServerClient();
  const { error } = await supabase.rpc("admin_remove", { target_id: userId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}
