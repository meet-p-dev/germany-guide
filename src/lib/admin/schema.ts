/**
 * Declarative description of the editable content tables. The admin UI, the
 * field inputs, and the upsert/delete server actions are all driven from this
 * one registry, so adding a column means editing this file only.
 *
 * This is UI/coercion metadata, NOT a security boundary — writes are gated by
 * Postgres RLS (`is_admin()` on every content table). Nothing here can grant
 * access the database wouldn't already allow.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "string_array"
  | "fk";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  /** Omitted from create/edit forms and treated as DB-managed. */
  readOnly?: boolean;
  /** NOT NULL and no default — the form requires a value. */
  required?: boolean;
  /** For `fk` fields: the table to resolve options/labels from. */
  fk?: { table: TableName; labelField: string };
  /** Non-restrictive autocomplete hints rendered as a <datalist>. */
  suggestions?: string[];
  /** For `json` fields: the empty shape, used as the create default. */
  jsonShape?: "array" | "object";
  help?: string;
}

export interface TableConfig {
  name: TableName;
  label: string;
  singular: string;
  /** Human blurb shown on the dashboard + list header. */
  description: string;
  /** Columns (FKs resolved to labels) concatenated for a row's title. */
  titleFields: string[];
  /** Optional muted second line in the list. */
  secondaryField?: string;
  orderBy: { column: string; ascending: boolean };
  fields: FieldConfig[];
}

export type TableName =
  | "cities"
  | "phases"
  | "steps"
  | "city_steps"
  | "city_facts"
  | "glossary_terms"
  | "problems"
  | "letters"
  | "updates";

const idField: FieldConfig = { name: "id", label: "ID", type: "text", readOnly: true };

export const ADMIN_TABLES: TableConfig[] = [
  {
    name: "cities",
    label: "Cities",
    singular: "City",
    description: "The cities the guide adapts to. Slug drives the URL.",
    titleFields: ["name"],
    secondaryField: "state",
    orderBy: { column: "name", ascending: true },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true, help: "URL segment, e.g. muenchen" },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "state", label: "State (Bundesland)", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "text",
        required: true,
        suggestions: ["live", "coming_soon"],
      },
    ],
  },
  {
    name: "phases",
    label: "Phases",
    singular: "Phase",
    description: "The top-level journey phases. Steps hang off these.",
    titleFields: ["title"],
    secondaryField: "slug",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number", required: true },
    ],
  },
  {
    name: "steps",
    label: "Steps",
    singular: "Step",
    description: "The core journey steps. City-variable steps get per-city detail.",
    titleFields: ["title"],
    secondaryField: "slug",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      idField,
      {
        name: "phase_id",
        label: "Phase",
        type: "fk",
        required: true,
        fk: { table: "phases", labelField: "title" },
      },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      {
        name: "quick_action",
        label: "Quick action (compact plan)",
        type: "textarea",
        help: "Short template for the Build-my-plan view. May use {placeholders} like {operator}, {cost}, {persona}, filled from city + persona at render. Blank falls back to Summary.",
      },
      { name: "content_md", label: "Content (Markdown)", type: "markdown", required: true },
      {
        name: "applies_to",
        label: "Applies to",
        type: "text",
        required: true,
        suggestions: ["both", "student", "worker"],
      },
      { name: "city_variable", label: "City-variable", type: "boolean", help: "Detail differs per city" },
      { name: "sort_order", label: "Sort order", type: "number", required: true },
      { name: "documents", label: "Documents (JSON array)", type: "json", jsonShape: "array" },
      { name: "official_links", label: "Official links (JSON array)", type: "json", jsonShape: "array" },
      { name: "depends_on", label: "Depends on (step slugs)", type: "string_array" },
      { name: "persona_points", label: "Persona points (JSON object)", type: "json", jsonShape: "object" },
      { name: "cost_cents", label: "Cost (cents)", type: "number" },
      { name: "cost_type", label: "Cost type", type: "text", suggestions: ["fixed", "range", "varies", "free"] },
      { name: "cost_note", label: "Cost note", type: "text" },
      { name: "deadline_rule", label: "Deadline rule", type: "text" },
      {
        name: "deadline_urgency",
        label: "Deadline urgency",
        type: "text",
        suggestions: ["critical", "high", "medium", "low"],
      },
      { name: "lead_time", label: "Lead time", type: "text" },
      { name: "due_offset_days", label: "Due offset (days)", type: "number" },
      { name: "seo_title", label: "SEO title", type: "text" },
      { name: "seo_description", label: "SEO description", type: "textarea" },
    ],
  },
  {
    name: "city_steps",
    label: "City steps",
    singular: "City step",
    description: "Per-city detail for a step: the method, address, links and tips.",
    titleFields: ["city_id", "step_id"],
    secondaryField: "method",
    orderBy: { column: "updated_at", ascending: false },
    fields: [
      idField,
      {
        name: "city_id",
        label: "City",
        type: "fk",
        required: true,
        fk: { table: "cities", labelField: "name" },
      },
      {
        name: "step_id",
        label: "Step",
        type: "fk",
        required: true,
        fk: { table: "steps", labelField: "title" },
      },
      {
        name: "method",
        label: "Method",
        type: "text",
        suggestions: ["walk_in", "appointment", "email", "online", "post"],
      },
      { name: "method_note", label: "Method note", type: "text" },
      { name: "content_md", label: "Content (Markdown)", type: "markdown", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "contact", label: "Contact (JSON object)", type: "json", jsonShape: "object" },
      { name: "links", label: "Links (JSON array)", type: "json", jsonShape: "array" },
      { name: "tips", label: "Tips (JSON array)", type: "json", jsonShape: "array" },
      { name: "last_verified", label: "Last verified", type: "date", help: "Required by project rules for city claims" },
      { name: "cost_cents", label: "Cost (cents)", type: "number" },
      { name: "cost_type", label: "Cost type", type: "text", suggestions: ["fixed", "range", "varies", "free"] },
      { name: "cost_note", label: "Cost note", type: "text" },
      { name: "deadline_rule", label: "Deadline rule", type: "text" },
      {
        name: "deadline_urgency",
        label: "Deadline urgency",
        type: "text",
        suggestions: ["critical", "high", "medium", "low"],
      },
      { name: "lead_time", label: "Lead time", type: "text" },
    ],
  },
  {
    name: "city_facts",
    label: "City facts",
    singular: "City fact",
    description:
      "Per-city reference facts (not tasks): tuition & study costs, housing & rent, dorms, insurance & bank offices, first days, while-waiting. Every claim needs a source + last verified date.",
    titleFields: ["city_id", "title"],
    secondaryField: "category",
    orderBy: { column: "updated_at", ascending: false },
    fields: [
      idField,
      {
        name: "city_id",
        label: "City",
        type: "fk",
        required: true,
        fk: { table: "cities", labelField: "name" },
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        required: true,
        suggestions: ["study_costs", "first_days", "housing", "insurance", "banking", "while_waiting"],
        help: "Which city-hub section this fact belongs to.",
      },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content_md", label: "Content (Markdown)", type: "markdown" },
      { name: "links", label: "Links (JSON array)", type: "json", jsonShape: "array" },
      { name: "source", label: "Source", type: "text", help: "Where this fact comes from (official site / stats). Required by project rules." },
      { name: "last_verified", label: "Last verified", type: "date", help: "Required by project rules for city claims" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    name: "glossary_terms",
    label: "Glossary",
    singular: "Glossary term",
    description: "German bureaucracy vocabulary with plain-English meaning.",
    titleFields: ["term"],
    secondaryField: "english",
    orderBy: { column: "term", ascending: true },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "term", label: "Term (German)", type: "text", required: true },
      { name: "english", label: "English", type: "text" },
      { name: "definition_md", label: "Definition (Markdown)", type: "markdown", required: true },
    ],
  },
  {
    name: "problems",
    label: "Problems",
    singular: "Problem",
    description: "Common problems and their solutions. City is optional.",
    titleFields: ["title"],
    secondaryField: "slug",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "problem_md", label: "Problem (Markdown)", type: "markdown", required: true },
      { name: "solution_md", label: "Solution (Markdown)", type: "markdown", required: true },
      {
        name: "city_id",
        label: "City (optional)",
        type: "fk",
        fk: { table: "cities", labelField: "name" },
      },
      { name: "sort_order", label: "Sort order", type: "number", required: true },
    ],
  },
  {
    name: "letters",
    label: "Letters",
    singular: "Letter",
    description: "The official letters a newcomer may receive, decoded.",
    titleFields: ["name"],
    secondaryField: "german_name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "german_name", label: "German name", type: "text" },
      { name: "sender", label: "Sender", type: "text" },
      { name: "urgency", label: "Urgency", type: "text", required: true, suggestions: ["high", "medium", "low"] },
      { name: "what_it_is_md", label: "What it is (Markdown)", type: "markdown", required: true },
      { name: "what_to_do_md", label: "What to do (Markdown)", type: "markdown", required: true },
      { name: "sort_order", label: "Sort order", type: "number", required: true },
    ],
  },
  {
    name: "updates",
    label: "Updates",
    singular: "Update",
    description: "Weekly “what changed” items. Human-approved before publishing.",
    titleFields: ["title"],
    secondaryField: "published_at",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      idField,
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body_md", label: "Body (Markdown)", type: "markdown", required: true },
      { name: "category", label: "Category", type: "text", required: true, suggestions: ["general", "law", "cost", "deadline", "city"] },
      { name: "source_name", label: "Source name", type: "text" },
      { name: "source_url", label: "Source URL", type: "text" },
      { name: "step_slug", label: "Related step slug", type: "text" },
      { name: "published_at", label: "Published at", type: "date", required: true },
    ],
  },
];

export function getTableConfig(name: string): TableConfig | undefined {
  return ADMIN_TABLES.find((t) => t.name === name);
}

/** The subset of fields users actually edit (drops read-only/DB-managed). */
export function editableFields(table: TableConfig): FieldConfig[] {
  return table.fields.filter((f) => !f.readOnly);
}
