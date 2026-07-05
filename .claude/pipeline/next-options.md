# Next content options — Germany Guide

_Planner run: 2026-07-04, after Round 15 (commit `e6ed868`). Read-only review._

## Round 15 review — ✅ LANDED (verified live + DB)

- **git**: commit `e6ed868` present in `git log` (plus two docs follow-ups f632e31, 9bb880d).
- **Live site** (germanyguide.net, HTTP 200 all three):
  - `/germany/munich/anmeldung` — renders "Appointment required" + "Verify before relying"; old walk-in framing gone. ✅
  - `/germany/dortmund/residence-permit` — corrected §§44–45 fees text ("self-employment / highly-qualified"); no walk-in badge. ✅
  - `/compare/anmeldung` — new page renders with eAT-not-supported caveat + honest "Not verified" cells. ✅
- **DB spot-check** (project ilfhjffpzvzphbvhdpup, read-only):
  - Dortmund residence-permit `walk_in_possible = false` ✅
  - 15/15 residence-permit rows carry the new §§44–45 fees_note ✅
  - 5 Anmeldung rows `online_possible = true` (Berlin, Bremen, Essen, Hamburg, Hannover) ✅
  - `commuter_areas`: 74/74 rows `has_own_office = true`; the 7 new columns exist and query cleanly ✅

**⚠️ One honest caveat worth flagging:** the Round 15 commuter *schema* landed and is proven,
but the enrichment *data* is very thin. Across all **74** commuter rows only **2** have
`commute_line`, **1** has `rent_note`, **2** have `office_note`, and **0** have `commute_minutes`.
So "commuter-town enrichment for the 8 anchor cities" is really a proof-of-concept sprinkle, not
8 filled-out cities. The panel renders these fields only when present, so nothing is broken — but
the biggest, already-built opportunity is filling the columns we just shipped. That shapes the
menu below.

---

## Ranked menu — pick a number (deepen the existing 15 cities first, per standing directive)

**1. Fill the commuter-enrichment columns we just shipped (all 15 cities, 74 towns).** — LARGE
Round 15 built + proved the schema (`commute_line`, `commute_minutes`, `rent_note`,
`office_note`, `sources`) but only ~5 cells are populated. Filling rent range, commute line +
minutes, and own-office note for the ~74 commuter towns turns a half-empty feature into the
site's most defensible dataset — the city-to-city commuter-belt angle no competitor has in one
place. Highest ROI: the plumbing already exists and it deepens the existing 15. `sources` +
verify-notes mandatory (no invented rents/times).
_Size: large if all 74; can scope to the top core cities (Munich, Berlin, Frankfurt, Hamburg) first._

**2. City-to-city residence-permit comparison page (`/compare/residence-permit`).** — MEDIUM
Mirror the shipped `/compare/anmeldung` (the `getVariantsForTask` + `CompareVariantRow` layer
already exists). Residence-permit is the *other* genuinely city-varying task; a comparison table
(walk-in?, fees note, wait time, booking) is a high-intent search target and reuses the
derived-layer code we just built.
_Size: small–medium — the layer exists; mostly a new page + sitemap entry._

**3. Grow the problems library toward verbatim searches.** — MEDIUM
40 problems / 93 solutions today. Newcomers Google exact phrases ("Anmeldung Termin nicht
bekommen", "Wohnungsgeberbestätigung fehlt", "Bürgeramt no appointment Berlin"). Add 15–25
problems phrased as verbatim queries, linked to city context where the answer differs. Long-tail
traffic; no new schema.
_Size: medium — ~15–25 problems with 2–3 solutions each._

**4. Expand `city_step_overrides` — per-city step tweaks (only 2 rows across ALL 15 cities).** — MEDIUM
The override mechanism exists but is essentially unused (2 rows vs 15 cities × 71 steps). Targeted,
honest per-city step notes (Munich KVR early-ticket reality, Berlin service.berlin.de online-Anmeldung
eligibility, etc.) make the checklist genuinely city-specific instead of generic. Keep to
Anmeldung/residence-permit steps that actually vary (honesty rule).
_Size: medium — structured per-city facts, verify each._

**5. Glossary + Amtsdeutsch letters expansion.** — MEDIUM
58 glossary terms / 14 letters today. Add high-frequency Amtsdeutsch terms and a few more annotated
official-letter walkthroughs (Mahnung, Ordnungswidrigkeit, ABH Anhörung, Rundfunk letters) — clean
"what it means / what to do" pages that capture panic-search traffic. Federally uniform (no city
variants), so lower on the city-angle priority but solid evergreen traffic.
_Size: small–medium — cheap, incremental._

**6. Quick-win subset: fill `commute_minutes` (0/74) + top up Nuremberg.** — SMALL
A focused slice of #1 if a full pass is too big: populate the completely-empty `commute_minutes`
column and top up Nuremberg (only 4 commuter towns vs 5 for the others). Self-contained win that
still improves every city page.
_Size: small._

**7. Expand to brand-new hub cities (menu #4 from prior rounds).** — LARGE — ⏸️ HELD
Noting per your 2026-07-04 decision: this stays HELD until existing-15 depth is fuller. Listed for
completeness only; do NOT pick this yet unless you're explicitly lifting the hold.

---

**Reply with the number(s) you want** (batch mode — pick several and the Researcher takes them all).
Top recommendation: **#1** — it finishes the feature Round 15 started and is the strongest
city-by-city traffic play. Natural pairing: **#1 + #2** (fill the data, then ship the second
comparison page on top of it).

> Honesty note: all specifics (rents, commute times, office quirks, fees, addresses) must be
> verified per-city at build time with `sources` — do not invent figures. Only Anmeldung and
> residence-permit genuinely vary by city; other tasks stay federally uniform.
