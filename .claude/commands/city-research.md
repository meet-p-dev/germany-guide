---
description: Research a city's missing city_steps from official sources and queue them for review
argument-hint: "<city-slug> [step-slug]"
allowed-tools: Bash, Read, Grep, WebFetch, WebSearch, mcp__135d9fa8-1daa-4cad-82e2-c30049708afc__execute_sql
---

Research city **$1**, step **$2** (empty means every step it is missing).

Read `docs/automation.md` first — you queue proposals, you never write to a content table.

## Procedure

1. **Check what exists.** Never trust the docs for counts (rules §4):

   ```sql
   select s.slug, (cs.id is not null) as has_override, cs.last_verified
   from steps s
   left join city_steps cs on cs.step_id = s.id
     and cs.city_id = (select id from cities where slug = '$1')
   where s.city_variable
   order by s.sort_order;
   ```

2. **Research from official sources only.** For the two steps most cities are
   missing:
   - `public-transport` — the **local operator** (MVG, VAG, SWA…) and the real
     student/semester ticket price from that operator's own tariff page.
     Deutschlandticket reduced rates vary by Land.
   - `find-housing-remotely` — the **local Studierendenwerk**, from its own
     price list. It is not always the local-sounding one: Ingolstadt *and*
     Nuremberg are both served by Studierendenwerk Erlangen-Nürnberg.

3. **Record the traps.** Wrong-building errors cost people weeks and are the
   most valuable thing on this site — a closed office, a separate Landkreis
   authority, a walk-in window, a district split. `docs/status.md` lists the
   ones already found; if you find another, it belongs in the content.

4. **Write to the shape that renders.** Per rules §2, the fields that reach a
   visitor are `method`, `method_note`, `address`, `tips`, `links` and
   `content_md`. Set `method` to one of `walk_in` / `appointment` / `email` /
   `online` / `post`. Set `last_verified` to today in the payload.

5. **Queue as `op = 'insert'`**, keyed by slug so a wrong slug inserts nothing:

   ```sql
   insert into proposed_changes (target_table, op, payload, source_url, source_name, rationale, run_id)
   select 'city_steps', 'insert', jsonb_build_object('city_id', c.id, 'step_id', s.id, ...),
          '<official url>', '<authority>', '<what you verified>', 'city-research-$1'
   from cities c, steps s where c.slug = '$1' and s.slug = '<step>';
   ```

## Hard rules for this command

- **Never invent an address, fee, office name or opening hour.** If you cannot
  verify it, leave the field null and say so in the rationale. A missing field
  renders fine; a wrong one sends someone to the wrong building.
- Prefer a **regional fact you can verify** ("the regional AOK here is AOK
  Bayern") over a specific address you cannot.
- Private rents are a **cited range with its year**, never a quote.
- Single `'` inside `$md$…$md$`; one numbered-list item per line.
- No emojis. No tourism content — bureaucracy and settling in only.

## Report back

Per step: the authority, the method, what you verified, what you could not, and
the source URLs. Then the count queued.
