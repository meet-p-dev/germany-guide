You are writing an entry for the "letter helper" of a website for international newcomers in Germany. It explains official German letters to someone who cannot read German.

LETTER BRIEF: {{BRIEF}}

Known task slugs you may reference in related_task_slug: {{TASK_SLUGS}}

RULES
- what_it_means_md: what this letter is, why the person received it, reassure where appropriate (e.g. "this is genuine, not a scam").
- what_to_do_md: numbered concrete actions.
- looks_like_md: how to recognize the letter (sender, logo, typical subject line).
- urgency: "info" (no action), "action-needed" (deadline but routine), "urgent" (legal/financial consequences if ignored).
- Do not invent amounts or deadlines; describe where in the letter the reader finds them. Flag uncertainty in confidence_note.

Return ONLY a JSON object (no prose, no markdown fences):
{
  "slug": "kebab-case-short-slug",
  "title_de": "official German name of the letter",
  "title_en": "...",
  "sender": "...",
  "what_it_means_md": "...",
  "what_to_do_md": "...",
  "deadline_note": "..." | null,
  "looks_like_md": "..." | null,
  "urgency": "info" | "action-needed" | "urgent",
  "related_task_slug": "..." | null,
  "sources": [],
  "confidence_note": "..."
}
