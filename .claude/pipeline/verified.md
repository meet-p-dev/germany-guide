# Verified packet — Add `family` audience tag (joining-family persona)

- **Author:** consolidated Researcher + Verifier pass (pipeline subagents hit the session limit; main loop did the web research and fact-check directly, same rigor).
- **Date compiled:** 2026-07-06
- **Topic:** Add a `"family"` value to `tasks.audience` (text[]) for the tasks that genuinely apply to someone joining family in Germany (Familiennachzug / family reunion), so a `/journey/joining-family` persona page can later be built. Tagging decision only — no new task content, no copy rewrites.
- **Project:** Supabase `ilfhjffpzvzphbvhdpup`, table `tasks`, column `audience`.
- **Baseline confirmed:** live DB `tasks.audience` matches `supabase/seed.sql` exactly (13 tasks, none currently tagged `family`).

## Persona definition used
A third-country national joining a family member resident in Germany — spouse/registered partner (AufenthG §§28/30), minor child (§32), or parent (§36). This person is functionally a **non-EU newcomer whose immigration route is family reunion** (rather than study/work), settling into a household.

## Legal / factual basis (verified with sources + access date 2026-07-06)
1. **Family reunion is a residence-permit matter** — Aufenthaltserlaubnis zum Familiennachzug, AufenthG §§27–36 (§28 to a German, §30 spouse of a foreigner, §32 children, §36 parents). Applied for at the local Ausländerbehörde. Federal law → **uniform nationwide; no city-level variation invented.**
2. **Visa-nationals** apply for a **national family-reunion / spouse visa** abroad, enter Germany, then **convert** it into a residence permit at the Ausländerbehörde before the visa expires (apply ≥4 weeks before expiry).
3. **Bridging:** while the residence-permit application is pending, a **Fiktionsbescheinigung** keeps the stay legal — same mechanism as any permit applicant.
4. **Labour-market access:** once the family residence title is granted, the spouse is **immediately entitled to take up any employment** (unrestricted). → recognition of foreign qualifications is genuinely relevant to joiners who intend to work.
5. **Health insurance is mandatory**; the joiner is typically added to the sponsor's public plan (**Familienversicherung**) or must hold own coverage.
6. **Financial means** are proven by the **sponsor's income / Verpflichtungserklärung (declaration of commitment)** — **NOT** a blocked account. The Sperrkonto is a student / self-financing instrument, not a family-reunion requirement.
7. **Anmeldung** (address registration within 14 days, §17 BMG) applies to every resident, including a joining family member setting up/entering a household.
8. **Rundfunkbeitrag** is one payment per household — a joiner entering an existing payer's flat may already be covered; the task copy already explains exactly this nuance.

Sources (accessed 2026-07-06):
- BAMF — Subsequent immigration to join foreign family members: https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Familie/NachzugZuDrittstaatlern/nachzug-zu-drittstaatlern-node.html
- Make-it-in-Germany — Spouses joining citizens of non-EU countries: https://www.make-it-in-germany.com/en/living-in-germany/family-life/spouses-joining-citizens-non-eu ; Family reunification overview: https://www.make-it-in-germany.com/en/visa-residence/family-reunification
- Auswärtiges Amt — Family reunion with foreign spouse or children (visa → residence permit): https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606848-606848
- germany-visa.org — Family reunion visa / residence permit / Verpflichtungserklärung (blocked account is student-specific): https://www.germany-visa.org/family-reunion-visa/ , https://www.germany-visa.org/verpflichtungserklarungen/

## Per-task verdict (all 13 tasks)

| # | slug | current audience | family? | reason |
|---|------|------------------|:------:|--------|
| 1 | anmeldung | student,worker,refugee,eu,non-eu | **YES** | Every resident registers address within 14 days (§17 BMG); joiner sets up/enters a household. |
| 2 | residence-permit | student,worker,non-eu | **YES** | This *is* the family-reunion permit (AufenthG §§27–36), applied for at the Ausländerbehörde. Core step. |
| 3 | visa-conversion | student,worker,non-eu | **YES** | Visa-nationals enter on a national family-reunion visa and must convert it to a residence permit before expiry. |
| 4 | fiktionsbescheinigung | student,worker,non-eu | **YES** | Bridging certificate keeps the stay legal while the family permit is processed. |
| 5 | bank-account | student,worker,refugee,eu,non-eu | **YES** | Needed for rent/salary/insurance; universal for setting up a household. |
| 6 | tax-id | student,worker,eu,non-eu | **YES** | Issued automatically after Anmeldung; relevant since the spouse has full work access. |
| 7 | health-insurance | student,worker,refugee,eu,non-eu | **YES** | Mandatory; joiner added to sponsor's plan (Familienversicherung) or needs own cover. |
| 8 | rundfunkbeitrag | student,worker,refugee,eu,non-eu | **YES** | One payment per household; joiner becomes part of a household. Task copy already covers the nuance. |
| 9 | qualification-recognition | worker,refugee,non-eu | **YES** (conditional) | Spouses get immediate unrestricted labour-market access; recognition is genuinely relevant to working joiners. |
| 10 | schufa | student,worker,eu,non-eu | **YES** | General daily-life credit record; landlords request it from anyone renting a home. |
| 11 | driving-license | worker,student,eu,non-eu | **YES** | General daily-life task; a joining adult who drives converts their foreign licence like any newcomer. |
| 12 | blocked-account | student,non-eu | **NO** | Sperrkonto is a student/self-financing means-proof tool. Family-reunion means are proven by sponsor income / Verpflichtungserklärung, not a blocked account. |
| 13 | work-permit-change | worker,non-eu | **NO** | Covers non-EU workers whose permit is tied to a specific employer. A family-reunion permit grants free labour-market access (not employer-bound), so this constraint doesn't apply. |

## Decision for Builder — append `"family"` to these 11 slugs (append only, keep existing tags):
`anmeldung, residence-permit, visa-conversion, fiktionsbescheinigung, bank-account, tax-id, health-insurance, rundfunkbeitrag, qualification-recognition, schufa, driving-license`

Do **NOT** tag: `blocked-account`, `work-permit-change`.

## Honesty guardrails observed
- Family reunion is a **federal (AufenthG) matter — uniform nationwide**; no city-level differences invented.
- `qualification-recognition` flagged as conditional (relevant to joiners who work) but included because full labour-market access makes it genuinely applicable — not fabricated.
- No new tasks or copy invented; this is purely an audience-tag append.

## Apply notes (idempotent)
- DB: append `family` via a set-based upsert; re-running is a no-op because the seed block already does `on conflict do update set audience = excluded.audience`.
- Mirror into `supabase/seed.sql`: add `family` to the `audience` literal of the 11 rows in the `insert into tasks ...` block.
