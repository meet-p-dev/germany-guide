# Content generation prompts

Templates used by `scripts/generate-*.ts`. Placeholders like `{{TASK_TITLE}}`
are substituted by the scripts.

Principles baked into every prompt:

- **JSON only** — output is parsed and validated with zod
  ([lib/content-schemas.ts](../lib/content-schemas.ts)); anything else is
  rejected and retried once with the validation error.
- **Source-bound** — the model gets the fetched text of official pages and must
  not state fees/deadlines/requirements that aren't in them. Missing facts stay
  `null` rather than being guessed.
- **English body, German terms in bold** on first use.
- **`confidence_note`** — the model flags what a human reviewer should
  double-check; shown in the admin review UI.
- Everything lands as `status = 'draft'` with `generated_by` = model id.
  Nothing is publicly visible until a human publishes it (RLS-enforced).
