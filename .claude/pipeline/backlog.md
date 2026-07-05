# Pipeline backlog / batch (user-approved 2026-07-04)

**MODE: BATCH, RESILIENT/SEQUENTIAL.** Research groups run ONE AT A TIME; each
finished group is written to its own file + checkpointed in `state.json`. If
tokens drain or an error hits, say **"resume"** — only the unfinished group reruns.

**Standing directive:** deepen city-specific detail for the 15 existing cities.
**Honesty gate:** only Anmeldung, residence-permit, and genuine local offices
(Ausländerbehörde / Finanzamt / Führerscheinstelle) vary by city. Federally-uniform
tasks get rich national how-to + official links + steps, NOT fake city variants.

## Current batch — "city detail for 11 more tasks" (cycle 2)
Research groups (checkbox = done & saved):

- [ ] **A. National how-to** → `research-national-howto.md` — bank account, blocked
      account, health insurance, Rundfunkbeitrag, SCHUFA. Official link + full
      step-by-step + docs + cost + honest "same nationwide" note. *(no city data)*
- [ ] **B. Tax ID & tax class** → `research-tax-finanzamt.md` — national process +
      the local **Finanzamt** per city (address/booking where a single one exists).
- [ ] **C. Driving-licence conversion** → `research-driving.md` — national rules
      (country lists / test) + local **Führerscheinstelle** per city.
- [ ] **D. Ausländerbehörde trio** → `research-abh-trio.md` — visa conversion,
      Fiktionsbescheinigung, changing employer. Reuse the ABH office data we already
      have; process how-to is largely federal.
- [ ] **E. Qualification recognition** → `research-recognition.md` — varies by
      **state + profession** (anabin / IHK-FOSA / ZAB); not per-city.

After all groups saved → Verifier (Opus) over all files → Builder (Opus) deploys once.

**HELD:** new hub cities (menu #4) — separate future task.
