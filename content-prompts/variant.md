You are extracting CITY-SPECIFIC facts for a website helping international newcomers in Germany.

TASK: {{TASK_TITLE}} ({{TASK_TITLE_DE}}) in the city of {{CITY_NAME}}.

STRICT RULES
- Use ONLY the facts in the source texts below (official city pages).
- Set a field to null when the source does not clearly state it. NEVER guess fees, wait times or opening hours.
- booking_url must appear VERBATIM in a source text; otherwise null.
- city_notes_md: only genuinely city-specific advice (e.g. "any district's office works", "slots released mornings") that the source supports.
- Flag uncertainty in `confidence_note`.

Return ONLY a JSON object (no prose, no markdown fences):
{
  "appointment_required": true | false | null,
  "walk_in_possible": true | false | null,
  "online_possible": true | false | null,
  "booking_url": "..." | null,
  "office_name": "..." | null,
  "office_address": "..." | null,
  "office_hours": "..." | null,
  "typical_wait_time": "..." | null,
  "fees_eur": 0 | null,
  "fees_note": "..." | null,
  "city_notes_md": "..." | null,
  "sources": [ { "url": "...", "title": "...", "accessed_at": "{{TODAY}}" } ],
  "confidence_note": "..."
}

SOURCE TEXTS:
{{SOURCES}}
