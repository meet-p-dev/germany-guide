# Deploy report — Add `family` audience tag (joining-family persona)

- **Builder:** applied in the main loop (pipeline subagents were unavailable — session limit). Date: 2026-07-06.
- **Source packet:** `.claude/pipeline/verified.md` (consolidated Researcher + Verifier).
- **Change:** appended `"family"` to `tasks.audience` for the 11 tasks that genuinely apply to someone joining family in Germany (Familiennachzug). Purely a tagging change — no task copy, no new tasks.

## What changed
- **Live DB** (Supabase `ilfhjffpzvzphbvhdpup`, table `tasks`): `family` appended to `audience` on 11 rows (idempotent — the `UPDATE` skipped any row already carrying it).
- **`supabase/seed.sql`**: mirrored — `family` added to the `audience` literal of the same 11 rows in the `insert into tasks … on conflict do update` block (idempotent on re-seed).

Tagged (11): `anmeldung, residence-permit, visa-conversion, fiktionsbescheinigung, bank-account, tax-id, health-insurance, rundfunkbeitrag, qualification-recognition, schufa, driving-license`
Deliberately NOT tagged (2): `blocked-account` (Sperrkonto is a student/self-financing tool, not a family-reunion requirement), `work-permit-change` (employer-bound worker permits; family permits grant free labour-market access).

## Verification
- Post-update DB query confirms exactly those 11 rows carry `family`; `blocked-account` and `work-permit-change` unchanged.
- `grep -c "family}" supabase/seed.sql` → 11; excluded rows verified unchanged.

## NOT done (out of scope for this branch)
- **Presentation (step 3) — `lib/persona-copy.ts` + `/journey/[persona]` pages do not exist in this worktree.** The persona-path UI (explore-mode Increment 2) is not present in this repo state, so the joining-family copy entry and page render cannot be added/verified here. The `family` tag is now in place so that work can be done when the persona infra lands.
- No git commit / push / deploy performed (not requested). The DB write is already live; `seed.sql` change is staged in the working tree.

## UNDO path
Live DB — remove the tag from all 11:
```sql
update tasks
set audience = array_remove(audience, 'family')
where 'family' = any(audience);
```
Source — revert the `supabase/seed.sql` edit:
```
git checkout -- supabase/seed.sql
```
