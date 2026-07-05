# Deploy report — Cycle 2 (national how-to + Finanzamt/Führerscheinstelle + ABH trio + recognition)

- **Builder:** step ③. Deploy date: 2026-07-05.
- **Supabase project:** ilfhjffpzvzphbvhdpup
- **Input:** `.claude/pipeline/verified-cycle2.md` (Verifier packet, 2026-07-05).
- **Pre-deploy HEAD (parent):** `e424e5053d290620ce1dad8fb3f6115cc37dbd69`
- **Deployed commit:** `__FILLED_AFTER_COMMIT__`

This is the UNDO LOG. To reverse a change, run its "REVERSE SQL" and/or `git revert` the deployed commit (restores `lib/queries/guide.ts` + `supabase/seed.sql`).

No schema/DDL changed this cycle → **no migration file added**. All DB work was data-only via `execute_sql` and is mirrored idempotently into `supabase/seed.sql`.

---

## 1. Code change (single file)

**`lib/queries/guide.ts`** — added an app-layer fallback in `getVariant(cityId, taskId)`:
when the task is one of the ABH trio (`visa-conversion`, `fiktionsbescheinigung`,
`work-permit-change`) and it has **no own** `city_task_variants` row, it borrows the
`residence-permit` variant for the same city (task_id
`4a9cd0bd-b800-4dd9-9c1f-69a5edc69354`), strips inherited `city_step_overrides` to `[]`,
and prepends a "handled by the same immigration office" note to `city_notes_md`.
No schema change. **REVERSE:** `git revert <deployed commit>` (or restore the file to
its `e424e50` version). Verified `tsc --noEmit -p tsconfig.json` → 0 errors.

## 2. Guides enriched (11 rows, data UPDATE — all `status` unchanged = 'published')

Task slugs updated (each: `intro_md`, `documents_md`, `after_md`, `sources` appended,
`last_verified_at`=2026-07-05, and `legal_basis` where noted):
`bank-account`, `blocked-account`, `health-insurance`, `rundfunkbeitrag`, `schufa`,
`tax-id` (legal_basis += §38b EStG, §355 AO), `driving-license` (legal_basis set: §29/§31/§28 FeV),
`visa-conversion` (legal_basis set: §6(3)/§81 AufenthG, AufenthV),
`fiktionsbescheinigung` (legal_basis kept §81 AufenthG), `work-permit-change`
(legal_basis set: §18a/§18b/§18g AufenthG, FEG 2.0),
`qualification-recognition` (legal_basis += §16d AufenthG).

**Prior values (before this cycle):** `last_verified_at` was `2026-07-02` for all 11;
`legal_basis` was NULL for `bank-account`, `blocked-account`, `driving-license`,
`visa-conversion`, `work-permit-change`; the other six kept their existing legal_basis
strings. Prior `intro_md`/`documents_md`/`after_md`/`sources` are those in
`git show e424e5053d290620ce1dad8fb3f6115cc37dbd69:supabase/seed.sql` for the six guides
that had seed rows (bank/blocked/health/rundfunkbeitrag/schufa/tax-id/driving-license);
the ABH-trio and recognition guides' prior bodies were the pre-cycle DB rows.

**REVERSE:** re-run the guide `update` statements from the parent commit's `seed.sql`
(the six with seed rows) and reset `last_verified_at='2026-07-02'` + `legal_basis=NULL`
for the five that were NULL:
```sql
update guides set last_verified_at='2026-07-02', legal_basis=null
 where task_id in (
  '96ba38e2-66fd-479e-a84d-247a4d15f7ee', -- bank-account
  '9849369a-e32c-4d1a-812b-05beaf410fdd', -- blocked-account
  '410d4c2e-8f10-4b44-88d9-f92e08934129', -- driving-license  (legal_basis was NULL)
  'c4f1d623-1614-4060-ab98-c54b8096f685', -- visa-conversion   (legal_basis was NULL)
  '52ef1c0a-af8f-4868-b9ca-6109edf5e8f8'  -- work-permit-change(legal_basis was NULL)
 );
-- for the remaining 6, reset only the date:
update guides set last_verified_at='2026-07-02'
 where task_id in (
  '166e1e00-fd22-4767-a0dd-8e9690f1cf7b', -- health-insurance
  '44450b2a-e90e-406a-b374-cc92680d5cf9', -- rundfunkbeitrag
  '8d3fc15d-aedc-44c2-b3fd-27d17b8c1475', -- schufa
  '6fe90ed7-f0d6-477b-9c50-31fd3719f9df', -- tax-id
  'dec19bd6-842a-4768-93fc-ac0ae7c76c15', -- fiktionsbescheinigung
  '3af82801-e0b4-4bcd-b2c1-42b0e769e66a'  -- qualification-recognition
 );
```
(Then restore the prior `intro_md/documents_md/after_md/sources` from the parent
`seed.sql` blocks / DB backup if a full content rollback is wanted.)

## 3. New `city_task_variants` — Finanzamt (tax-id), 15 rows (NET-NEW)

task_id `6fe90ed7-f0d6-477b-9c50-31fd3719f9df`, all 15 cities. `appointment_required`
left NULL; BZSt Finanzamtsuche as shared `booking_url`; concrete `office_address` only for
Bremen, Aachen-Stadt, Leipzig, Dresden, Munich(Servicezentrum); Nuremberg = 1-Jan-2026
merger note, null address; others null-address + finder pointer. Prior state: **no rows
existed** for this task.

**REVERSE SQL:**
```sql
delete from city_task_variants where task_id='6fe90ed7-f0d6-477b-9c50-31fd3719f9df';
```

## 4. New `city_task_variants` — Führerscheinstelle (driving-license), 15 rows (NET-NEW)

task_id `410d4c2e-8f10-4b44-88d9-f92e08934129`, all 15 cities. `appointment_required=true`
for all (Bremen "walk-in" claim rejected per Verifier). Concrete `office_address` for
Berlin, Munich(Garmischer 19–21), Stuttgart(Krailenshalden 32), Cologne, Düsseldorf,
Aachen(Würselen), Essen(Altendorfer 101); Hannover = Stadt Hannover (NOT Region), null
address; others null address + booking URL. Prior state: **no rows existed** for this task.

**REVERSE SQL:**
```sql
delete from city_task_variants where task_id='410d4c2e-8f10-4b44-88d9-f92e08934129';
```

## 5. New `glossary_terms` — recognition set, 7 rows (NET-NEW)

Slugs: `anabin`, `zab`, `statement-of-comparability`, `ihk-fosa`, `defizitbescheid`,
`anerkennungspartnerschaft`, `anerkennungszuschuss` — all `status='published'`,
`related_task_ids = {qualification-recognition}`. No prior rows (no slug collisions).

**REVERSE SQL:**
```sql
delete from glossary_terms where slug in
 ('anabin','zab','statement-of-comparability','ihk-fosa','defizitbescheid',
  'anerkennungspartnerschaft','anerkennungszuschuss');
```

## 6. ABH trio city offices — NO rows created (by design)

`visa-conversion`, `fiktionsbescheinigung`, `work-permit-change` reuse the
`residence-permit` office via the §1 code fallback. **Nothing to reverse in the DB.**

## 7. seed.sql mirror

Appended one idempotent block to `supabase/seed.sql` (11 guide `update`s, 30
`city_task_variants` upserts, 7 `glossary_terms` upserts, all
`on conflict … do update`), generated from the live DB via Postgres
`format()`/`quote_literal` to avoid escaping errors. **REVERSE:** `git revert` the
deployed commit.

---

## 8. Live-verification evidence

_(filled after push + ISR settle — see section below)_
