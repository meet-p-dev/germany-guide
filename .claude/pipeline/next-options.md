# Next content options — Germany Guide

_Planner run: 2026-07-03 (first cycle, no prior deploy-report). Read-only review._

## Health check ✅

- **Live site:** home, `/germany/berlin`, `/sitemap.xml` all return `200` and load fast (~0.3–0.5s). Munich page renders the commuter "Where to live & commute from" panel — the Round 14 feature is live.
- **Git:** last deploy `eaadd88` (Round 14 seed sync + commuter areas) is present on `main`.
- **DB (project `ilfhjffpzvzphbvhdpup`) exact row counts:**
  | table | rows | | table | rows |
  |---|---|---|---|---|
  | cities | 15 (all published) | | glossary_terms | 58 |
  | states | 16 | | letters | 14 |
  | tasks | 13 (all have published guides) | | problems | 40 |
  | city_task_variants | 30 | | solutions | 93 |
  | city_step_overrides | 2 | | commuter_areas | 74 |
  | checklist_steps | 71 | | partner_offers | 8 |

### Coverage findings / thinnest areas
- **Variants only exist for 2 tasks:** `anmeldung` (15) and `residence-permit` (15) — one per city. Correct per project rules; the other 11 tasks are federally uniform and rightly have no variants. So city-differentiation depth is currently **shallow** (30 variants, only 2 city_step_overrides across all 15 cities).
- **Commuter areas are uniform:** ~5 per city (Nuremberg has 4). Even coverage, but shallow — no depth on the towns themselves (rent, commute time, own Bürgeramt).
- **All 15 cities are top-15-by-population.** No secondary hubs (Karlsruhe, Mannheim, Bonn, Wiesbaden, Münster, Augsburg, Bielefeld) despite large expat/student populations.
- **Guides/glossary/letters/problems are healthy** in count; nothing critically empty.

---

## Ranked menu — pick a number

**1. Deepen Anmeldung city-variant content with the local specifics newcomers actually search for.**
Only 2 of 15 cities have any step-level override. Add per-city Anmeldung detail — appointment-booking reality (how far out slots are, walk-in vs. online-only), required forms (Wohnungsgeberbestätigung wording), typical wait, address of the office — for the cities that still read generic. This is the site's core differentiator and highest-intent traffic ("Anmeldung Berlin termin", etc.).
_Size: medium — ~10–13 cities × structured facts, verify each office; several city_step_overrides rows._

**2. Flesh out commuter towns into mini-pages (rent, commute time, own registration office).**
The commuter belt is a genuinely unique dataset, but each of the 74 towns is currently thin. Add per-town: typical rent vs. the core city, commute time/line, and whether the town has its own Bürgeramt (often faster than the big-city one — a real hook). Competitors don't have this in one place.
_Size: large if all 74; medium if scoped to the 3–4 highest-traffic core cities (Munich, Berlin, Frankfurt, Hamburg) first._

**3. Add residence-permit / Ausländerbehörde city variants with local booking + processing reality.**
Residence-permit has 15 variants but likely generic. The Ausländerbehörde genuinely varies city-to-city (online booking system, months-long waits, Fiktionsbescheinigung practice). High-intent, high-frustration searches. Pair naturally with the existing `fiktionsbescheinigung` guide.
_Size: medium — per-city facts for the biggest cities; verify each ABH carefully._

**4. Expand city coverage to 4–6 secondary hubs (Mannheim, Karlsruhe, Bonn, Münster, Wiesbaden, Augsburg).**
Each new published city unlocks Anmeldung + residence-permit variants, commuter areas, and a city landing page — a repeatable traffic-per-city pattern the site already has infrastructure for. Strong student/expat demand, lower competition than the big 15.
_Size: large per city (city row + 2 variants + ~5 commuter areas + facts), but highly systematic._

**5. Grow the "problems" library toward the pain-points people Google verbatim.**
40 problems / 93 solutions is decent but there's long-tail room: Sperrkonto/blocked-account rejections, Anmeldung-without-a-lease, SCHUFA-with-no-history rental refusals, health-insurance gap after job loss, Bürgergeld/Anmeldung interplay. These match exact search queries and feed internal links to existing guides.
_Size: medium — ~8–12 new problems with 2–3 solutions each._

**6. Add a city-to-city comparison layer for Anmeldung difficulty / wait times.**
Leverage the unique dataset directly: a "how hard is registering in X vs Y" comparison (typical wait, booking method, walk-in availability). Builds on the existing `app/compare/` scaffold. Naturally shareable and links every city page together.
_Size: medium — needs the per-city facts from option 1 as input, so best done after or with #1._

**7. Grow glossary + Amtsdeutsch letters coverage (58 terms / 14 letters).**
Add high-search Behörden terms and scary official letters newcomers receive (Mahnung, Ordnungswidrigkeit, Vollstreckungsankündigung, Rundfunk letters, ABH Anhörung). Each is a clean "what this means / what to do" page that captures panic-search traffic and links to relevant tasks.
_Size: small–medium — cheap to produce, incremental._

---

**Reply with the number(s) you want** (e.g. "1 and 3") and the Researcher will start there. My recommendation for biggest traffic-per-effort: **1**, then **2** (scoped to top cities) — both lean directly into the city-by-city differentiation competitors can't match.

> Honesty note: all specifics above (office addresses, wait times, rents, commute times, booking methods) must be verified per-city at build time — do not invent figures. Only Anmeldung and residence-permit genuinely vary by city; the other tasks stay federally uniform.
