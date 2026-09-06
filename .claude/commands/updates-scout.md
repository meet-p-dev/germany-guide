---
description: Check official sources for changes worth an /updates item and draft one for review
argument-hint: "[topic]"
allowed-tools: Bash, Read, Grep, WebFetch, WebSearch, mcp__135d9fa8-1daa-4cad-82e2-c30049708afc__execute_sql
---

Look for news worth telling visitors about. Focus: **$1** (empty means the standard watchlist).

Read `docs/automation.md` first — you queue proposals, you never write to a content table.

## Watchlist

Rules and prices that change and that affect someone's move: residence-permit
and visa fees, the Deutschlandticket price (from 2027 it is calculated and
announced by 30 September), minimum wage and the Minijob ceiling, EU Blue Card
salary thresholds, Blocked-account minimum, student work-day limits, health
insurance rates, and any federal change to Anmeldung or Ausländerbehörde
procedure. Ministries and federal agencies only.

## Procedure

1. **Check what we already published** so you do not repeat one:

   ```sql
   select slug, title, category, published_at from updates order by published_at desc limit 20;
   ```

2. Search the official sources. For each candidate ask: **does this change what
   someone has to do, pay, or when?** If not, it is not an update — this is not
   a news blog.

3. **Draft it** as an `insert` proposal on `updates`, with `source_url` and
   `source_name` set, `category` from `general / law / cost / deadline / city`,
   and a slug that will not collide.

4. Body: two or three short paragraphs. What changed, when it takes effect, what
   the reader should do. Plain English, no emojis, states the source. If the
   change also makes a figure elsewhere on the site wrong, say so in the
   rationale — that is a separate `/verify-figures` job.

Use `run_id = 'updates-scout-<today>'`.

## Report back

What you checked, what you found, what you drafted, and what you deliberately
skipped as not actionable. If nothing is worth publishing, say that — an empty
result is a good result here, and padding `/updates` with filler is worse than
silence.

Note: an approved update joins the next monthly newsletter digest automatically.
Do not send anything.
