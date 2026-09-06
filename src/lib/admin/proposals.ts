import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/admin/auth";
import { coerceValue } from "@/lib/admin/coerce";
import {
  editableFields,
  getTableConfig,
  type TableConfig,
} from "@/lib/admin/schema";
import { fkLabelMaps, rowTitle, type Row } from "@/lib/admin/data";
import { createAuthServerClient } from "@/lib/supabase/server-client";

/**
 * The review gate.
 *
 * Scheduled agents research content from official sources but never write to a
 * content table: they queue a row in `proposed_changes`, and a human applies it
 * here. That is what keeps project rule #1 ("never fabricate a city fact") true
 * once the site updates itself.
 *
 * Three guards live in `applyProposal`, and none of them is decoration:
 *
 *  1. **Table + field whitelist.** Only the tables in ADMIN_TABLES and their
 *     editable fields can be targeted. An agent reads third-party web pages; if
 *     one of those pages tries to steer it, the worst it can queue is a bad
 *     proposal about city content, never a write to `admins` or `profiles`.
 *  2. **Optimistic concurrency.** `current_value` snapshots the column at
 *     proposal time. If the live row has changed since, applying is refused and
 *     the proposal goes `stale` — an agent's three-week-old finding cannot
 *     silently overwrite a newer human edit.
 *  3. **Provenance.** `source_url` is NOT NULL in the schema, so every proposal
 *     arrives with somewhere the reviewer can go to check it.
 */

export type ProposalStatus = "pending" | "applied" | "rejected" | "stale";

export interface Proposal {
  id: string;
  target_table: string;
  target_id: string | null;
  op: "update" | "insert";
  field: string | null;
  current_value: string | null;
  proposed_value: string | null;
  payload: Record<string, unknown> | null;
  source_url: string;
  source_name: string | null;
  rationale: string | null;
  origin: string;
  run_id: string | null;
  status: ProposalStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/** A proposal plus the human context the review screen needs. */
export interface ProposalView extends Proposal {
  /** e.g. "München · Anmeldung" — resolved from the live target row. */
  targetLabel: string;
  tableLabel: string;
  fieldLabel: string | null;
  /** False when the field is not editable/known — the card warns and blocks. */
  applicable: boolean;
  /** Set when the live value has drifted from `current_value`. */
  driftWarning: string | null;
}

function untyped(db: SupabaseClient): SupabaseClient {
  return db;
}

async function adminDb(): Promise<SupabaseClient> {
  const supabase = await createAuthServerClient();
  return supabase as unknown as SupabaseClient;
}

/**
 * Render a database value the same way a proposal records it, so the two can be
 * compared as text. jsonb columns come back as objects; null and "" are the
 * same absence for this purpose.
 */
export function normalizeForCompare(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

export async function pendingProposalCount(): Promise<number> {
  const db = await adminDb();
  const { count, error } = await untyped(db)
    .from("proposed_changes")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}

export async function listProposals(
  status: ProposalStatus,
  limit = 100,
): Promise<Proposal[]> {
  const db = await adminDb();
  const { data, error } = await untyped(db)
    .from("proposed_changes")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Proposal[];
}

/**
 * Decorate proposals with their target's human title and a drift check.
 *
 * Rows are fetched per distinct target table rather than per proposal, so a
 * 40-city sweep costs a handful of queries instead of hundreds.
 */
export async function decorateProposals(
  proposals: Proposal[],
): Promise<ProposalView[]> {
  const tables = [...new Set(proposals.map((p) => p.target_table))]
    .map((name) => getTableConfig(name))
    .filter((t): t is TableConfig => Boolean(t));

  const db = await adminDb();
  const rowsByTable = new Map<string, Map<string, Row>>();
  const labelsByTable = new Map<string, Record<string, Record<string, string>>>();

  await Promise.all(
    tables.map(async (table) => {
      const ids = proposals
        .filter((p) => p.target_table === table.name && p.target_id)
        .map((p) => p.target_id as string);
      if (ids.length === 0) {
        rowsByTable.set(table.name, new Map());
        return;
      }
      const [{ data }, labels] = await Promise.all([
        untyped(db).from(table.name).select("*").in("id", ids),
        fkLabelMaps(table),
      ]);
      labelsByTable.set(table.name, labels);
      rowsByTable.set(
        table.name,
        new Map(((data ?? []) as Row[]).map((r) => [String(r.id), r])),
      );
    }),
  );

  return proposals.map((p) => {
    const table = getTableConfig(p.target_table);
    const row = p.target_id
      ? rowsByTable.get(p.target_table)?.get(p.target_id)
      : undefined;
    const labels = labelsByTable.get(p.target_table) ?? {};

    const field =
      table && p.field
        ? editableFields(table).find((f) => f.name === p.field)
        : undefined;

    let applicable = Boolean(table);
    let driftWarning: string | null = null;

    if (!table) {
      driftWarning = "Unknown target table — this proposal cannot be applied.";
      applicable = false;
    } else if (p.op === "update") {
      if (!field) {
        driftWarning = `"${p.field}" is not an editable field on ${table.label}.`;
        applicable = false;
      } else if (!row) {
        driftWarning = "The target row no longer exists.";
        applicable = false;
      } else if (
        normalizeForCompare(row[p.field as string]) !==
        normalizeForCompare(p.current_value)
      ) {
        driftWarning =
          "The live value has changed since this was proposed — applying is blocked.";
        applicable = false;
      }
    }

    return {
      ...p,
      targetLabel: table && row ? rowTitle(table, row, labels) : "(new row)",
      tableLabel: table?.label ?? p.target_table,
      fieldLabel: field?.label ?? p.field,
      applicable,
      driftWarning,
    };
  });
}

export interface ApplyResult {
  ok: boolean;
  message: string;
}

const TABLES_WITH_UPDATED_AT = new Set(["steps", "city_steps", "city_facts"]);

function hasField(table: TableConfig, name: string): boolean {
  return table.fields.some((f) => f.name === name);
}

/**
 * Apply one pending proposal to the real content table.
 *
 * The write goes through the admin's own cookie-bound client, so Postgres RLS
 * (`is_admin()`) authorizes it exactly as a manual edit in /admin would — the
 * service role is deliberately not used here.
 */
export async function applyProposal(
  id: string,
  opts: { bumpVerified: boolean },
): Promise<ApplyResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Not authorized." };

  const db = await adminDb();

  const { data: raw, error: loadError } = await untyped(db)
    .from("proposed_changes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (loadError) return { ok: false, message: loadError.message };
  if (!raw) return { ok: false, message: "Proposal not found." };

  const p = raw as Proposal;
  if (p.status !== "pending") {
    return { ok: false, message: `Already ${p.status}.` };
  }

  const table = getTableConfig(p.target_table);
  if (!table) {
    return { ok: false, message: `"${p.target_table}" is not an editable table.` };
  }

  const markStale = async (message: string): Promise<ApplyResult> => {
    await untyped(db)
      .from("proposed_changes")
      .update({
        status: "stale",
        review_note: message,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    return { ok: false, message };
  };

  const payload: Record<string, unknown> = {};

  if (p.op === "update") {
    const field = editableFields(table).find((f) => f.name === p.field);
    if (!field) {
      return markStale(`"${p.field}" is not an editable field on ${table.label}.`);
    }

    // Re-read the live row inside the apply path. The review screen already
    // checked for drift, but the page may have been open for a while.
    const { data: live, error: liveError } = await untyped(db)
      .from(table.name)
      .select("*")
      .eq("id", p.target_id as string)
      .maybeSingle();
    if (liveError) return { ok: false, message: liveError.message };
    if (!live) return markStale("The target row no longer exists.");

    if (
      normalizeForCompare((live as Row)[field.name]) !==
      normalizeForCompare(p.current_value)
    ) {
      return markStale(
        "The live value changed since this was proposed. Re-run the check rather than overwriting the newer edit.",
      );
    }

    try {
      payload[field.name] = coerceValue(field, p.proposed_value);
    } catch (err) {
      return { ok: false, message: `${field.label} ${(err as Error).message}` };
    }
  } else {
    // Insert: keep only known editable columns, so a proposal cannot smuggle in
    // an `id`, a foreign column, or anything else the schema does not describe.
    const source = (p.payload ?? {}) as Record<string, unknown>;
    const allowed = editableFields(table);
    const unknown = Object.keys(source).filter(
      (k) => !allowed.some((f) => f.name === k),
    );
    if (unknown.length > 0) {
      return {
        ok: false,
        message: `Payload has fields that are not on ${table.label}: ${unknown.join(", ")}.`,
      };
    }
    const missing = allowed
      .filter((f) => f.required && source[f.name] == null)
      .map((f) => f.label);
    if (missing.length > 0) {
      return { ok: false, message: `Missing required: ${missing.join(", ")}.` };
    }
    Object.assign(payload, source);
  }

  const now = new Date().toISOString();
  if (TABLES_WITH_UPDATED_AT.has(table.name)) payload.updated_at = now;
  // `last_verified` is a claim about someone's own work, so it moves only when
  // the reviewer says they checked the source — never automatically.
  if (opts.bumpVerified && hasField(table, "last_verified")) {
    payload.last_verified = now.slice(0, 10);
  }

  const write =
    p.op === "update"
      ? await untyped(db).from(table.name).update(payload).eq("id", p.target_id as string)
      : await untyped(db).from(table.name).insert(payload);

  if (write.error) return { ok: false, message: write.error.message };

  const { error: markError } = await untyped(db)
    .from("proposed_changes")
    .update({
      status: "applied",
      reviewed_by: admin.id,
      reviewed_at: now,
    })
    .eq("id", id);
  if (markError) {
    // The content write already succeeded, so say so rather than implying it
    // needs redoing — re-applying would double-insert.
    return {
      ok: true,
      message: `Applied to ${table.label}, but the proposal could not be marked done: ${markError.message}`,
    };
  }

  return {
    ok: true,
    message:
      p.op === "update"
        ? `Applied to ${table.label}.`
        : `New ${table.singular.toLowerCase()} created.`,
  };
}

export async function rejectProposal(
  id: string,
  note: string,
): Promise<ApplyResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Not authorized." };

  const db = await adminDb();
  const { error } = await untyped(db)
    .from("proposed_changes")
    .update({
      status: "rejected",
      review_note: note || null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Rejected." };
}
