"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";

type ContentTable = "guides" | "city_task_variants" | "problems" | "letters" | "glossary_terms";

const TABLES: ContentTable[] = [
  "guides",
  "city_task_variants",
  "problems",
  "letters",
  "glossary_terms",
];

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    throw new Error("Not authorized");
  }
  return user!.email!;
}

export async function publishRow(table: ContentTable, id: string) {
  const email = await requireAdmin();
  if (!TABLES.includes(table)) throw new Error("Unknown table");

  const db = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } =
    table === "glossary_terms"
      ? await db
          .from(table)
          .update({ status: "published" })
          .eq("id", id)
      : await db
          .from(table)
          .update({
            status: "published",
            last_verified_at: today,
            reviewed_by: email,
          })
          .eq("id", id);
  if (error) throw error;

  // Solutions inherit their parent problem's status (kept as a plain column
  // so RLS stays cheap).
  if (table === "problems") {
    await db
      .from("solutions")
      .update({ status: "published" })
      .eq("problem_id", id);
  }

  revalidatePath("/", "layout");
}

export async function archiveRow(table: ContentTable, id: string) {
  await requireAdmin();
  if (!TABLES.includes(table)) throw new Error("Unknown table");
  const db = createAdminClient();
  const { error } = await db
    .from(table)
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
  if (table === "problems") {
    await db
      .from("solutions")
      .update({ status: "archived" })
      .eq("problem_id", id);
  }
  revalidatePath("/", "layout");
}
