---
description: Fetch every official link in the content tables and queue fixes for dead or moved ones
argument-hint: "[city-slug | all]  (default: all)"
allowed-tools: Bash, Read, Grep, WebFetch, WebSearch, mcp__135d9fa8-1daa-4cad-82e2-c30049708afc__execute_sql
---

Sweep the site's official links and queue repairs. Target: **$1** (empty means all cities).

Read `docs/automation.md` first — you queue proposals, you never write to a content table.

## Procedure

1. **Collect the URLs.** From the live DB, not from docs:

   ```sql
   select 'city_steps' as tbl, cs.id, c.slug as city, s.slug as step,
          jsonb_array_elements(cs.links) ->> 'url' as url
   from city_steps cs
   join cities c on c.id = cs.city_id
   join steps  s on s.id = cs.step_id
   union all
   select 'city_facts', cf.id, c.slug, cf.category,
          jsonb_array_elements(cf.links) ->> 'url'
   from city_facts cf join cities c on c.id = cf.city_id;
   ```

2. **Fetch each one.** Record the outcome per URL: OK / redirected / 404 / blocked.

3. **Triage before proposing.** A non-200 is not automatically a content bug:
   - **403 / 402 / bot-blocked** — the page is probably fine and refusing us.
     Do **not** queue a change. Note it and move on (`solutions.md` has this trap).
   - **Redirect within the same authority** — queue the new URL.
   - **404** — find the page's replacement on the authority's own site, then
     queue it. If you cannot find one, queue nothing and report it instead.

4. **Check what the page now says**, not just that it loads. This sweep exists
   because Munich silently moved to appointment-only and Nuremberg's permit
   address changed. If the office name, `method`, address or fee on the live
   page disagrees with our row, that is the finding worth having — queue it as
   a separate proposal per field.

5. **Queue** with `run_id = 'link-check-<today>'`, selecting `current_value`
   from the live row (see `docs/automation.md`).

## Report back

A short table: URLs checked, OK, blocked (ignored), proposals queued. Then the
single sentence a human needs: what is most likely actually broken on the site.

Do not edit any content table. Do not move `last_verified` — that happens at
approval, not here.
