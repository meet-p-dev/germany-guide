import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContentClient } from "@/lib/supabase/content-client";
import type { FieldConfig, TableConfig } from "./schema";

export type Row = Record<string, unknown>;

export interface FkOption {
  value: string;
  label: string;
}

// Reads only. Content is public-read via RLS, so the sessionless content
// client is enough here; the /admin layout is what gates who sees these pages.
// Cast to an untyped client because the table name is dynamic.
function db(): SupabaseClient {
  return createContentClient() as unknown as SupabaseClient;
}

export async function listRows(table: TableConfig): Promise<Row[]> {
  const { data, error } = await db()
    .from(table.name)
    .select("*")
    .order(table.orderBy.column, { ascending: table.orderBy.ascending });
  if (error) throw new Error(error.message);
  return (data ?? []) as Row[];
}

export async function getRow(table: TableConfig, id: string): Promise<Row | null> {
  const { data, error } = await db()
    .from(table.name)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Row | null) ?? null;
}

export async function rowCount(table: TableConfig): Promise<number> {
  const { count, error } = await db()
    .from(table.name)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fkOptions(fk: NonNullable<FieldConfig["fk"]>): Promise<FkOption[]> {
  const { data, error } = await db().from(fk.table).select(`id, ${fk.labelField}`);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[])
    .map((r) => ({
      value: String(r.id),
      label: String(r[fk.labelField] ?? r.id),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** All FK fields' options for a table, keyed by field name (for form selects). */
export async function fkOptionsForTable(
  table: TableConfig,
): Promise<Record<string, FkOption[]>> {
  const fkFields = table.fields.filter((f) => f.type === "fk" && f.fk);
  const entries = await Promise.all(
    fkFields.map(async (f) => [f.name, await fkOptions(f.fk!)] as const),
  );
  return Object.fromEntries(entries);
}

/** id → label lookup per FK field, for rendering human row titles in lists. */
export async function fkLabelMaps(
  table: TableConfig,
): Promise<Record<string, Record<string, string>>> {
  const options = await fkOptionsForTable(table);
  const maps: Record<string, Record<string, string>> = {};
  for (const [field, opts] of Object.entries(options)) {
    maps[field] = Object.fromEntries(opts.map((o) => [o.value, o.label]));
  }
  return maps;
}

/** Build a row's display title from the table's titleFields (FKs resolved). */
export function rowTitle(
  table: TableConfig,
  row: Row,
  labelMaps: Record<string, Record<string, string>>,
): string {
  const parts = table.titleFields.map((field) => {
    const raw = row[field];
    if (raw == null) return "";
    const map = labelMaps[field];
    return map ? (map[String(raw)] ?? String(raw)) : String(raw);
  });
  const title = parts.filter(Boolean).join(" · ");
  return title || String(row.id ?? "(untitled)");
}
