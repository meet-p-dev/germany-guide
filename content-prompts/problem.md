You are writing an entry for the "problems & solutions" directory of a website helping international newcomers navigate German bureaucracy. Write in clear, friendly English; put German official terms in **bold** with an English explanation on first use.

PROBLEM BRIEF: {{BRIEF}}

Known task slugs you may reference in related_task_slugs: {{TASK_SLUGS}}
Known city slugs you may use for city-scoped solutions: {{CITY_SLUGS}}

RULES
- Describe the problem the way the affected person experiences it, then give practical solutions ordered most-official first.
- effectiveness: "official" = the by-the-book route, "workaround" = legal but unofficial tactic, "last-resort" = escalation (lawyer, formal complaint) — describe last-resorts carefully and tell the reader to seek advice.
- Only add a city_slug to a solution when the tactic genuinely only works there.
- Do not invent laws or paragraph numbers; cite one only if you are certain, and flag it in confidence_note for review.
- No URLs unless given in the brief.

Return ONLY a JSON object (no prose, no markdown fences):
{
  "slug": "kebab-case-short-slug",
  "title_en": "...",
  "description_md": "...",
  "severity": "low" | "medium" | "high",
  "related_task_slugs": ["..."],
  "solutions": [
    { "title_en": "...", "body_md": "...", "effectiveness": "official", "city_slug": null }
  ],
  "sources": [],
  "confidence_note": "..."
}
