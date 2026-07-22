import type { FieldConfig, TableConfig } from "./schema";
import { editableFields } from "./schema";

export interface CoerceResult {
  payload: Record<string, unknown>;
  errors: Record<string, string>;
}

function coerceField(field: FieldConfig, raw: FormDataEntryValue | null): unknown {
  const value = typeof raw === "string" ? raw.trim() : "";
  const empty = value === "";

  switch (field.type) {
    case "text":
    case "textarea":
    case "markdown":
    case "fk":
      return empty ? null : value;

    case "number": {
      if (empty) return null;
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error("must be a number");
      return n;
    }

    case "boolean":
      return value === "true";

    case "date":
      return empty ? null : value;

    case "string_array":
      return empty
        ? []
        : value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

    case "json": {
      if (empty) return field.jsonShape === "object" ? {} : [];
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error("is not valid JSON");
      }
      if (field.jsonShape === "array" && !Array.isArray(parsed)) {
        throw new Error("must be a JSON array");
      }
      if (
        field.jsonShape === "object" &&
        (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      ) {
        throw new Error("must be a JSON object");
      }
      return parsed;
    }

    default:
      return empty ? null : value;
  }
}

/**
 * Build the write payload from submitted form data, validating per field.
 * Required fields that resolve to null/empty produce an error rather than a
 * null the database would reject. RLS still has the final say on the write.
 */
export function coercePayload(table: TableConfig, formData: FormData): CoerceResult {
  const payload: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of editableFields(table)) {
    let value: unknown;
    try {
      value = coerceField(field, formData.get(field.name));
    } catch (err) {
      errors[field.name] = `${field.label} ${(err as Error).message}`;
      continue;
    }

    const isEmpty =
      value === null ||
      (field.type === "string_array" && Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    payload[field.name] = value;
  }

  return { payload, errors };
}
