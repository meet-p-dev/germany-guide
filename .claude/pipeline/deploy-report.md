# Deploy report — Round 15 (Anmeldung + residence-permit + commuter towns)

- **Builder:** step ③. Deploy date: 2026-07-04.
- **Supabase project:** ilfhjffpzvzphbvhdpup
- **Input:** `.claude/pipeline/verified.md` (Verifier packet, 2026-07-04).
- **Pre-deploy HEAD (parent):** `eaadd88d9992e95d9ba208aa74a2faf4e1665720`
- **Deployed commit:** `e6ed868e594d2a659bf640bfd6231fc057524d80`

This is the UNDO LOG. To reverse a change, run the "REVERSE SQL" for it.

---

## 1. Schema migration

**File added:** `supabase/migrations/0006_commuter_areas_enrich.sql`
Applied via `apply_migration` (name `0006_commuter_areas_enrich`). Adds 7 nullable/additive
columns to `commuter_areas`: `commute_line text`, `commute_minutes text`, `rent_note text`,
`has_own_office boolean`, `office_note text`, `last_verified_at date`,
`sources jsonb not null default '[]'`. Additive-only — did not touch existing rows or the
"Where to live" panel (reads `commute_note`/`cost_note`).

**REVERSE SQL (only if a full rollback of the feature is wanted):**
```sql
alter table commuter_areas
  drop column if exists commute_line,
  drop column if exists commute_minutes,
  drop column if exists rent_note,
  drop column if exists has_own_office,
  drop column if exists office_note,
  drop column if exists last_verified_at,
  drop column if exists sources;
-- Then delete the migration row:
-- delete from supabase_migrations.schema_migrations where version = '0006';
```
(Dropping columns is destructive to the enrichment data below; prefer reversing the data
updates individually and keeping the columns.)

---

## 2. `city_task_variants` data changes (all rows locale='en')

### 2a. Dortmund residence-permit — walk_in_possible true → false
Prior value: `walk_in_possible = true`.
```sql
-- REVERSE:
update city_task_variants v set walk_in_possible = true
from cities c, tasks t
where v.city_id=c.id and v.task_id=t.id and c.slug='dortmund' and t.slug='residence-permit';
```

### 2b. residence-permit fees_note (all 15 cities) — set to corrected §§44–45 text
Prior value on every residence-permit row: `fees_note = 'Roughly €50–140 depending on permit type and duration'`
(Aachen's prior value was `'Roughly €50–140 depending on permit type'` — no "and duration"; both
restored to the generic below is acceptable, but exact prior differed only for Aachen).
`fees_eur` was and remains `null` (unchanged).
```sql
-- REVERSE (restores the prior generic note for all 15):
update city_task_variants v set fees_note = 'Roughly €50–140 depending on permit type and duration'
from tasks t where v.task_id=t.id and t.slug='residence-permit';
```

### 2c. Munich Anmeldung — flipped booleans + reworded notes
Prior values: `appointment_required=false`, `walk_in_possible=true`, `online_possible=false`,
`typical_wait_time='Same day to 2 weeks'`, and the prior `city_notes_md` was the
"walk-ins with a queue ticket" framing.
```sql
-- REVERSE:
update city_task_variants v set
  appointment_required=false, walk_in_possible=true, online_possible=false,
  typical_wait_time='Same day to 2 weeks',
  city_notes_md='Munich''s Bürgerbüros accept **walk-ins with a queue ticket**, but daily ticket numbers are limited — arrive early in the morning, especially at the main KVR office.

Booking an appointment online is still the more predictable option and usually possible within days at one of the branch offices (Leonrodstraße, Forstenrieder Allee, Orleansplatz, Riesenfeldstraße).'
from cities c, tasks t
where v.city_id=c.id and v.task_id=t.id and c.slug='munich' and t.slug='anmeldung';
```

### 2d. Stuttgart Anmeldung — booking_url + notes
Prior values: `booking_url='https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42'`,
prior `city_notes_md` was the "Stuttgart registers at district Bürgerbüros. Book online early…" text.
```sql
-- REVERSE:
update city_task_variants v set
  booking_url='https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42',
  city_notes_md='Stuttgart registers at district **Bürgerbüros**. Book online early, especially around summer and semester starts. Checking a less central Bürgerbüro can get you an earlier appointment.'
from cities c, tasks t
where v.city_id=c.id and v.task_id=t.id and c.slug='stuttgart' and t.slug='anmeldung';
```

### 2e. Berlin Anmeldung — notes reworded (eAT caveat added; unverified deadline-proof claim stays dropped)
`online_possible` was and remains `true` (unchanged). Prior `typical_wait_time='2–6 weeks for an appointment'`.
Prior `city_notes_md` was the "book at any Bürgeramt… online registration via service.berlin.de" text
(which did NOT contain the deadline-proof claim — that claim was already absent).
```sql
-- REVERSE:
update city_task_variants v set
  typical_wait_time='2–6 weeks for an appointment',
  city_notes_md='In Berlin you can book at **any Bürgeramt in any district** — pick whichever has the earliest slot.

New appointments are released **every morning**; refreshing the booking page between 7 and 9 am gives the best chances. Cancellations also free up same-week slots during the day.

Berlin also offers **online registration** for straightforward moves (single household, no special cases) via service.berlin.de — check whether you qualify before hunting for an appointment.'
from cities c, tasks t
where v.city_id=c.id and v.task_id=t.id and c.slug='berlin' and t.slug='anmeldung';
```

### 2f. Bremen / Essen / Hamburg / Hannover Anmeldung — online_possible → true (+ eAT caveat notes)
Prior values: `online_possible` was `null` for Bremen, Essen, Hamburg; `null` for Hannover.
Each row's prior `city_notes_md` was the shorter pre-caveat text.
```sql
-- REVERSE (Bremen):
update city_task_variants v set online_possible=null,
  city_notes_md='Bremen uses **BürgerServiceCenter** offices (e.g. Mitte and Nord), booked through service.bremen.de. Slots can be scarce, so reserve as soon as you have your documents.'
from cities c, tasks t where v.city_id=c.id and v.task_id=t.id and c.slug='bremen' and t.slug='anmeldung';
-- REVERSE (Essen):
update city_task_variants v set online_possible=null,
  city_notes_md='Essen registers you at district **Bürgerläden / Bürgeramt** offices booked via the city''s online-Termin system. Bring your Wohnungsgeberbestätigung and passport, and book early.'
from cities c, tasks t where v.city_id=c.id and v.task_id=t.id and c.slug='essen' and t.slug='anmeldung';
-- REVERSE (Hamburg):
update city_task_variants v set online_possible=null,
  city_notes_md='Hamburg runs Anmeldung through district **Kundenzentren** (customer centres), not one central office. Book via the Hamburg Serviceportal for any centre with a free slot — availability varies a lot between districts, so check several. Bring your Wohnungsgeberbestätigung and passport.'
from cities c, tasks t where v.city_id=c.id and v.task_id=t.id and c.slug='hamburg' and t.slug='anmeldung';
-- REVERSE (Hannover):
update city_task_variants v set online_possible=null,
  city_notes_md='In Hannover the region''s **Bürgerämter** handle Anmeldung across several district offices. Book online and check more than one location if your nearest is fully booked.'
from cities c, tasks t where v.city_id=c.id and v.task_id=t.id and c.slug='hannover' and t.slug='anmeldung';
```

(`last_verified_at` was bumped to 2026-07-04 on all touched variant rows; prior was 2026-07-02/03.
Not reversed individually — cosmetic.)

---

## 3. `commuter_areas` data changes

Prior values: all new columns were their defaults — `has_own_office`, `commute_line`, `rent_note`,
`office_note`, `last_verified_at` were `null`; `sources` was `'[]'::jsonb`.
```sql
-- REVERSE (resets all enrichment data, keeps columns):
update commuter_areas set
  has_own_office=null, commute_line=null, commute_minutes=null,
  rent_note=null, office_note=null, last_verified_at=null, sources='[]'::jsonb;
```
Specifics set: `has_own_office=true` for all rows; `commute_line` on Ahrensburg
("RB 81 / RE 8 (regional rail; future S4)") and Reutlingen ("RB / IRE (Neckar-Alb regional rail)");
`rent_note` + `sources` on Halle (Saale) (official Mietspiegel €7.93/m²); `office_note` + `sources`
on Potsdam (eWA first-in-Brandenburg); `office_note` on Ahrensburg (eWA since 16 Sep 2024).

---

## 4. Code / seed changes (git-reversible via `git revert e6ed868e594d2a659bf640bfd6231fc057524d80`)

- `supabase/migrations/0006_commuter_areas_enrich.sql` — new migration (mirrors §1).
- `supabase/seed.sql` — appended "Round 15" idempotent block mirroring §§2–3.
- `lib/database.types.ts` — added the 7 new `commuter_areas` columns to Row/Insert/Update.
- `lib/queries/content.ts` — added `getVariantsForTask()` + `CompareVariantRow` for the comparison layer.
- `components/CommuterAreas.tsx` — surfaces `commute_line`, `rent_note`, `office_note` when present (additive).
- `app/compare/anmeldung/page.tsx` — new city-to-city Anmeldung comparison page (derived layer).
- `app/sitemap.ts` — added `/compare/anmeldung`.

---

## 5. Live-verification evidence

Verified locally against the live DB (dev server reads prod Supabase) before push; post-push
re-verified on germanyguide.net via curl (allowing ISR delay). See the "Live verification" section
appended at deploy time below.
