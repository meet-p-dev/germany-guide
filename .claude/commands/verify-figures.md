---
description: Re-check the money figures in docs/status.md against their official sources and queue corrections
argument-hint: "[figure name]  (default: all figures)"
allowed-tools: Bash, Read, Grep, WebFetch, WebSearch, mcp__135d9fa8-1daa-4cad-82e2-c30049708afc__execute_sql
---

Re-verify the site's cost figures. Scope: **$1** (empty means the whole list).

Read `docs/automation.md` first — you queue proposals, you never write to a content table.

## The list

`docs/status.md` → "Verified 2026 figures". Blocked account, Deutschlandticket,
minimum wage, Minijob, EU Blue Card thresholds, Rundfunkbeitrag, student health
insurance, uni-assist, ZAB, visa and permit fees, Fiktionsbescheinigung, student
work-day limits, WG-room average. **Most reset every January.**

## Procedure

1. For each figure, find the **official** source — the ministry, the authority,
   the Studierendenwerk, the statutory instrument. Not a blog, not an aggregator,
   not a summary site. A dorm figure comes from the Studierendenwerk's own price
   list; an aggregator once put Ingolstadt €45/month too low.

2. Compare against what the site actually says. Find every occurrence:

   ```bash
   grep -rn "<figure>" docs/
   ```
   ```sql
   select 'steps' as t, slug, title from steps where content_md ilike '%<figure>%'
   union all
   select 'city_steps', c.slug, s.slug from city_steps cs
     join cities c on c.id=cs.city_id join steps s on s.id=cs.step_id
     where cs.content_md ilike '%<figure>%'
   union all
   select 'city_facts', c.slug, cf.category from city_facts cf
     join cities c on c.id=cf.city_id where cf.content_md ilike '%<figure>%';
   ```

3. **Where they differ, queue one proposal per row**, with the official URL and
   a rationale naming the old and new figure.

4. **If the only figure you can find is older than the current year**, do not
   present it as current. Propose text that states the year in the prose —
   "ran about €402/month in 2024" — exactly as rules §1 requires.

5. If a source blocks you (402/403), take the number from another official page
   or a search-result summary that names the study. Do not block the whole sweep
   on one source.

Use `run_id = 'verify-figures-<today>'`.

## Report back

A table: figure, what the site says, what the source says, verdict
(unchanged / changed / could not verify), source URL. Then the count queued.

Also tell me plainly which figures you **could not** confirm — an unverifiable
figure is more dangerous than a changed one, because nothing flags it.

Do not update `docs/status.md` yourself; that follows once the proposals are
approved.
