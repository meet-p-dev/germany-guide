"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { upsertRow, type ActionState } from "@/app/admin/actions";
import type { FieldConfig } from "@/lib/admin/schema";
import { cn } from "@/lib/utils";
import { DeleteRowButton } from "@/components/admin/delete-row-button";

type Row = Record<string, unknown>;
interface FkOption {
  value: string;
  label: string;
}

interface Props {
  tableName: string;
  singular: string;
  fields: FieldConfig[];
  initial: Row | null;
  fkOptions: Record<string, FkOption[]>;
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60";

function initialValue(field: FieldConfig, initial: Row | null): string {
  const v = initial ? initial[field.name] : undefined;
  switch (field.type) {
    case "boolean":
      return v ? "true" : "false";
    case "json":
      if (v == null) return field.jsonShape === "object" ? "{}" : "[]";
      return JSON.stringify(v, null, 2);
    case "string_array":
      return Array.isArray(v) ? v.join("\n") : "";
    default:
      return v == null ? "" : String(v);
  }
}

function Field({
  field,
  initial,
  options,
  error,
}: {
  field: FieldConfig;
  initial: Row | null;
  options?: FkOption[];
  error?: string;
}) {
  const value = initialValue(field, initial);
  const listId = field.suggestions ? `dl-${field.name}` : undefined;

  let control: React.ReactNode;
  switch (field.type) {
    case "boolean":
      control = (
        <select name={field.name} defaultValue={value} className={inputCls}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
      break;
    case "fk":
      control = (
        <select name={field.name} defaultValue={value} className={inputCls}>
          {!field.required && <option value="">— none —</option>}
          {(options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "markdown":
    case "json":
      control = (
        <textarea
          name={field.name}
          defaultValue={value}
          rows={field.type === "json" ? 5 : 10}
          spellCheck={field.type === "markdown"}
          className={cn(inputCls, "font-mono text-xs leading-relaxed")}
        />
      );
      break;
    case "string_array":
      control = (
        <textarea
          name={field.name}
          defaultValue={value}
          rows={3}
          placeholder="One per line"
          className={cn(inputCls, "font-mono text-xs")}
        />
      );
      break;
    case "textarea":
      control = (
        <textarea name={field.name} defaultValue={value} rows={3} className={inputCls} />
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          name={field.name}
          defaultValue={value}
          className={inputCls}
        />
      );
      break;
    case "date":
      control = (
        <input type="date" name={field.name} defaultValue={value} className={inputCls} />
      );
      break;
    default:
      control = (
        <>
          <input
            type="text"
            name={field.name}
            defaultValue={value}
            list={listId}
            className={inputCls}
          />
          {field.suggestions && (
            <datalist id={listId}>
              {field.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      );
  }

  return (
    <div>
      <label className="mb-1 flex items-baseline gap-1.5 text-sm font-medium">
        {field.label}
        {field.required && <span className="text-primary">*</span>}
      </label>
      {field.help && <p className="mb-1.5 text-xs text-muted">{field.help}</p>}
      {control}
      {error && <p className="mt-1 text-xs font-medium text-primary">{error}</p>}
    </div>
  );
}

export function RecordForm({ tableName, singular, fields, initial, fkOptions }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    upsertRow,
    { ok: false },
  );
  const id = initial ? String(initial.id) : "";

  useEffect(() => {
    if (state.ok) {
      router.push(`/admin/${tableName}`);
      router.refresh();
    }
  }, [state.ok, router, tableName]);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="__table" value={tableName} />
      <input type="hidden" name="__id" value={id} />

      {state.error && !state.ok && (
        <p className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary-soft px-3 py-2.5 text-sm text-primary">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-3 py-2.5 text-sm text-success">
          <Check className="h-4 w-4 shrink-0" />
          Saved.
        </p>
      )}

      {fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          initial={initial}
          options={fkOptions[field.name]}
          error={state.fieldErrors?.[field.name]}
        />
      ))}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save changes" : `Create ${singular.toLowerCase()}`}
        </button>
        {initial && (
          <DeleteRowButton tableName={tableName} id={id} withLabel redirectToList />
        )}
      </div>
    </form>
  );
}
