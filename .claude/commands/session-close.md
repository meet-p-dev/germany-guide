---
description: Bring status.md, todo.md and solutions.md back in line with reality before ending a session
allowed-tools: Bash, Read, Grep, Edit, Write, mcp__135d9fa8-1daa-4cad-82e2-c30049708afc__execute_sql
---

Close out this session's bookkeeping. Rules §7 requires it: these files are the
only thing a fresh Claude will trust.

## Procedure

1. **Re-count against the live DB** — never copy the numbers already in the
   docs, since checking them is the entire point:

   ```sql
   select
     (select count(*) from cities where status='live')   as cities_live,
     (select count(*) from city_steps)                   as city_steps,
     (select count(*) from city_facts)                   as city_facts,
     (select count(*) from steps)                        as steps,
     (select count(*) from glossary_terms)               as glossary,
     (select count(*) from problems)                     as problems,
     (select count(*) from letters)                      as letters,
     (select count(*) from updates)                      as updates,
     (select count(*) from proposed_changes where status='pending') as pending_review;
   ```

2. **`docs/status.md`** — update the counts table, add a dated changelog entry
   for what actually shipped this session, and move the "Last updated" date.
   Record any new city trap you found.

3. **`docs/todo.md`** — **delete** finished items rather than ticking them; the
   file is a to-do list, not a history. Add anything newly discovered, in
   priority order. Keep the "explicitly not doing" section intact — do not
   quietly resurrect a rejected idea.

4. **`docs/solutions.md`** — add an entry for anything that cost more than a few
   minutes: what you saw → why → the fix → how to spot it next time. Write the
   symptom the way you would *search* for it.

5. **Verify before claiming done** (rules §5):

   ```bash
   npx tsc --noEmit && npx eslint . && npm run build
   ```

   If `tsc` fails on files you never touched with "Duplicate identifier" in
   `.next/types`, that is the iCloud sync trap — see `solutions.md`.

6. **Deploy check.** Content-only changes still need a push to rebuild the
   ISR-cached pages. Committed is not live: confirm the tip commit actually
   deployed rather than assuming the webhook fired.

## Report back

What changed in each doc, the verification result, and anything you chose **not**
to record and why. Be honest about unfinished work — a todo item quietly dropped
is worse than one left open.
