# Research packet — GROUP C: Converting a driving licence (task slug `driving-license`)

**Agent:** Researcher (step ①) · **Topic:** GROUP C of the resilient batch (A + B already done)
**Access date for all web facts below:** 2026-07-05 (unless a source line says otherwise)
**Task:** `tasks` row `slug = 'driving-license'`, `id = 410d4c2e-8f10-4b44-88d9-f92e08934129`,
title "Converting a driving license"
**Guide row:** `guides.id = 579354ed-cedb-4d77-b08c-88ab219ed557`, currently `published`,
`last_verified_at = 2026-07-02`, **`legal_basis` is currently NULL** — this pass proposes filling it.
**PART 2 target:** `city_task_variants` — **zero rows currently exist for this task** (confirmed by
live query below), so every city-variant row proposed here is net-new, not an edit.

---

## 0. What already exists in the DB (read before drafting — deepen, don't duplicate)

Confirmed via Supabase `execute_sql` (project `ilfhjffpzvzphbvhdpup`, read-only) on 2026-07-05:

- `guides` row for `driving-license` is `published`, `last_verified_at = 2026-07-02`, `legal_basis = null`,
  `sources = [{"url":"https://www.kba.de","title":"Kraftfahrt-Bundesamt (KBA)","accessed_at":"2026-07-02"}]`.
- Stored `intro_md` already correctly states: EU/EEA valid indefinitely without exchange; countries with
  mutual-recognition agreements can exchange test-free within 6 months of establishing residency; others
  may need a test. This is directionally right and should be **kept, deepened, and given a legal_basis**,
  not replaced wholesale.
- Stored `documents_md` already lists: original foreign licence, certified translation if needed, passport,
  Anmeldebestätigung, biometric photo, Sehtest, first-aid course "if required for your licence class."
- Stored `checklist_steps` (6 steps, guide_id `579354ed-...`) already cover: check exchange-agreement status,
  book Sehtest, first-aid course if required, certified translation if needed, submit at Führerscheinstelle,
  take test if required. These are solid; this packet adds precision (fees, timing, the tier system, and
  which classes actually need the first-aid course) rather than restructuring them.
- **`city_task_variants` for `task_id = 410d4c2e-8f10-4b44-88d9-f92e08934129`: query returned zero rows.**
  This confirms PART 2 below is genuinely new city-by-city content, following the same "office_name /
  office_address / booking_url / city_notes_md populated, other fields null unless confirmed" mechanism
  Group B used for other tasks.
- 15 published cities confirmed via `cities` table: Aachen, Berlin, Bremen, Cologne, Dortmund, Dresden,
  Düsseldorf, Essen, Frankfurt am Main, Hamburg, Hanover, Leipzig, Munich, Nuremberg, Stuttgart.
- `problems`/`solutions` table already has a related problem `driving-foreign-licence-6-months` (published,
  verified 2026-07-03) covering the 6-month rule at a high level and linking to this task — no conflict,
  this guide should stay consistent with it (it already is).

---

## PART 1 — National rules (federally uniform; maps to `guides` columns)

### 1.1 The 6-month rule — confirmed, primary source

**Draft addition to `intro_md` (precision + legal citation):**
> "Under **§29 of the Fahrerlaubnis-Verordnung (FeV)** — the Driving Licence Regulation — once you establish
> your **ordinary residence (gewöhnlicher Wohnsitz)** in Germany, a licence from a **non-EU/EEA country**
> remains valid to drive with for **six months** from that date. After that, driving on it (even if it
> hasn't expired in its home country) is legally equivalent to driving without a licence — a real
> Ordnungswidrigkeit/criminal offence, not a formality. **Filing your Umschreibung application before the
> six months run out is what matters — not having the whole process finished by then**: several city
> offices state explicitly that submitting the application in time keeps you legally covered even if
> processing (often itself 8–14 weeks) runs past the deadline.
>
> The clock starts at **establishing residence**, which in practice German offices tie to your Anmeldung
> date — not your entry date if you visited before moving, and not the date you happen to visit the
> Führerscheinstelle.
>
> **Extension available in narrow cases:** if you can credibly show your stay in Germany will be under
> 12 months total, the Fahrerlaubnisbehörde can extend the 6-month window by up to another 6 months on
> request (§29 FeV) — a niche case (e.g. some assignees/students on short stays) but worth a one-line
> mention so people in that situation know to ask."

- **Confidence: confirmed.** Directly fetched and quoted §29 FeV text at gesetze-im-internet.de.
- **Source:** https://www.gesetze-im-internet.de/fev_2010/__29.html — "§29 FeV" — fetched directly — accessed 2026-07-05.
- **Legal basis for `guides.legal_basis` field:** propose setting it to **`§ 29 Fahrerlaubnis-Verordnung (FeV) — Recognition of foreign driving licences; §31 FeV and Anlage 11 FeV for the exchange/Umschreibung country tiers`**. Currently null — this is a real gap fill, not a duplicate.

### 1.2 EU/EEA licences vs non-EU — confirmed

**Draft for `intro_md` (clarify/replace the current one-line EU/EEA statement):**
> "**EU/EEA licences** (all 27 EU states plus Iceland, Liechtenstein, Norway) do **not** need to be
> exchanged at all — you can drive in Germany on them for as long as they remain valid in the issuing
> country, under **§28 FeV**. The only date that matters is your licence's own expiry date; driving on an
> expired licence is an offence regardless of nationality of the licence.
>
> Two nuances worth flagging so nobody is caught out:
> - **Truck and bus classes (C, C1, C1E, CE, D, D1, D1E, DE)** from EU/EEA countries are only recognised in
>   Germany for **5 years from issuance**, regardless of a longer validity period shown on the card itself.
> - **EU-wide paper/older-photocard licences must be exchanged for the current plastic photocard format by
>   19 January 2033** — this is an EU-wide administrative deadline (not proof of driving competence, not
>   Germany-specific), unrelated to the newcomer content here but worth a one-line mention since it trips
>   up long-term EU residents who assume all 'exchange' rules are about non-EU licences.
> - If you got your non-German EU/EEA licence **less than 2 years ago**, moving to Germany puts you under
>   the German **probationary licence rules (Führerschein auf Probe)** for the remainder of the standard
>   2-year probation period — worth flagging for newer drivers."

- **Confidence: confirmed.** Source: https://www.adac.de/verkehr/rund-um-den-fuehrerschein/auslaendische-fuehrerscheine/gueltigkeit/ — fetched directly — accessed 2026-07-05.

### 1.3 The country-tier system for Umschreibung (Anlage 11 FeV) — confirmed structure, deliberately NOT reproducing the full list

**Draft for `intro_md`, replacing the current vague "a growing list of countries" sentence:**
> "Whether you need a test at all — and if so, which kind — depends on a **three-tier system set out in
> Anlage 11 of the Fahrerlaubnis-Verordnung (FeV)**, the official 'state list' (Staatenliste):
>
> 1. **Full reciprocity — no test at all.** A defined list of countries has agreements meaning your licence
>    converts directly. Examples include most of the countries commonly cited by the ADAC (e.g. the United
>    Kingdom and Gibraltar since 2022, and — depending on licence class and current agreement status —
>    countries like Switzerland, Japan, South Korea, Australia, Canada, and most US states, though **US
>    rules vary by issuing state**, not as a blanket country-level rule.
> 2. **Partial reciprocity — theory OR practical test only**, for some countries/licence classes on the same
>    list where the agreement only covers part of the German test.
> 3. **All other countries ('Drittstaaten' not on the list) — full theory AND practical test required**,
>    taken in Germany (no driving-school training required by law, though many people take some lessons to
>    prepare, especially for the practical test).
>
> **This list changes over time and depends on your specific licence class, not just your country** — for
> example, Montenegro is expected to join the full-reciprocity list in the first half of 2026 once a 2025
> declaration of intent is formalised, illustrating how the list is a living document, not a fixed set.
> **We deliberately do not reproduce the full country list here, since it changes and the exact classes
> covered per country vary** — check your status on the **official Anlage 11 FeV text** or the **ADAC's
> maintained country list PDF** before assuming which tier applies to you:
> - Official legal text: https://www.gesetze-im-internet.de/fev_2010/anlage_11.html
> - ADAC's plain-language list (also links a maintained PDF): https://www.adac.de/verkehr/rund-um-den-fuehrerschein/auslaendische-fuehrerscheine/staaten-auserhalb/"

- **Confidence: confirmed** for the 3-tier structure and its legal basis (Anlage 11 FeV via §31 FeV).
  **Confidence: likely** for the specific example countries in tier 1/2 (ADAC's own page names UK/Gibraltar
  and Montenegro explicitly; the others — Switzerland, Japan, South Korea, Australia, Canada, most US
  states — are widely cited across secondary sources as commonly-recognised examples but I did not
  cross-check every one against the primary Anlage 11 text row-by-row this pass). **Recommend the Verifier
  spot-check at minimum the US/UK/Canada rows directly against gesetze-im-internet.de/fev_2010/anlage_11.html
  since these are the most common newcomer countries for an English-language site.**
- Sources:
  - https://www.gesetze-im-internet.de/fev_2010/anlage_11.html — official Anlage 11 FeV text — accessed 2026-07-05 — **confirmed exists, not row-by-row verified this pass**
  - https://www.adac.de/verkehr/rund-um-den-fuehrerschein/auslaendische-fuehrerscheine/staaten-auserhalb/ — fetched directly — accessed 2026-07-05 — **confirmed** for 3-tier structure, UK/Gibraltar (since 2022), Montenegro (2026 pending) facts
  - https://www.adac.de/-/media/adac/pdf/jze/staatenliste-nicht-eu-land-umtausch-fuehrerschein.pdf — ADAC's maintained country-list PDF, found via search, not fetched directly this pass — **likely**, good link to give newcomers as the "check yourself" pointer

### 1.4 Documents, cost, and timing — mostly confirmed, refined from what's stored

**Draft `documents_md` revision (replace current list with this more precise one):**
> - Your **original foreign driving licence** (retained by the German authority upon successful exchange —
>   you do not get it back)
> - A **certified translation** — required whenever the licence is not already in German, and per some city
>   offices, not automatically waived just because it's in English; some offices additionally require a
>   **classification** of the foreign licence (a formal statement of which vehicle classes/categories it
>   covers, since license-class systems differ by country). The **ADAC offers a combined translation +
>   classification service**: roughly **€55** for licences in Latin script, roughly **€85** for non-Latin
>   scripts (Cyrillic, Arabic, Greek, Asian scripts, etc.), or **€25** for classification alone if no
>   translation is needed — turnaround **around 10 working days**. A sworn/certified court translator is
>   the other common route; costs vary by translator and language.
> - **Passport or ID**, plus your **Anmeldebestätigung** (registration certificate)
> - **Biometric passport photo** (35×45mm, current German biometric standard) — roughly **€10–15** at a photo
>   studio if not already on hand
> - **Eyesight test certificate (Sehtest)** from an optician or ophthalmologist — required for car/motorcycle
>   classes (A, A1, A2, AM, B, BE, L, T); **medical fitness exams** (not just a vision check) are required
>   instead for truck/bus classes (C/CE, D/DE)
> - **First-aid course certificate (Erste-Hilfe-Kurs)** — confirmed as specifically required **for licences
>   being converted from non-EU/EEA ('Drittstaat') countries**; not required for EU/EEA exchanges. If you
>   already hold a first-aid certificate from any prior driving-licence process, it remains valid
>   indefinitely and does not need to be repeated.
>
> **Typical total cost range: roughly €35–90**, depending on your city, licence class, and whether a test is
> required — this covers the administrative fee (commonly cited around €25–45 depending on city and
> class/test requirement) plus the biometric photo and any translation/classification costs. **Costs vary
> by municipality since German fee schedules (GebOSt) give local authorities some discretion — check your
> own city's current fee before applying rather than relying on a single number.**
>
> **Typical timing:** administrative processing for the paperwork alone is commonly **4–14 weeks**
> depending on the city (several city offices state up to 12–14 weeks during busy periods) — **submit your
> application well before your 6-month deadline**, since submitting on time (not completing on time) is
> what keeps you legally covered. If a test is required, add the time to book a slot with a **Fahrschule**
> (driving school) or **DEKRA/TÜV** examination body, which can itself take additional weeks depending on
> local availability."

- **Confidence: confirmed** for: retained original licence; first-aid course being non-EU/EEA-specific;
  eye-test vs medical-exam split by class; ADAC translation/classification prices (€55/€85/€25) and ~10
  working day turnaround; €35–90ish total cost range (corroborated across multiple official city fee
  schedules: Berlin €37.50/€45.10, Cologne €35–44.20, Munich €37.50–45.90, Stuttgart ~€25.30+photo,
  Nuremberg ~€30–45, Dresden ~€45); 4–14 week processing range (corroborated: Munich "at least/up to
  12–14 weeks", Düsseldorf "~12 weeks", generic sources "4–6 weeks" as a lower bound).
- **Confidence: likely** for the "submitting on time, not finishing on time, keeps you covered" claim — this
  is stated by Dortmund's official city page specifically ("Das Stellen des Antrags innerhalb der Frist
  reicht aus"), but I have not confirmed this is uniformly true nationwide or just Dortmund's own
  interpretation/practice. **Flag for Verifier**: check whether this is a general FeV principle or a
  city-specific administrative courtesy — if the latter, soften the guide wording to "many offices
  consider filing in time sufficient — but confirm this explicitly when you book your appointment,
  don't assume it applies everywhere."
- Sources:
  - https://www.hamburg.de/service/info/11433182/n0/ — Hamburg official Drittstaat conversion page — fetched directly — accessed 2026-07-05 — **confirmed** (documents list, fee €37.50–74.40, ~3–4 week card production time, eye test for A/B classes, first-aid conditional)
  - https://service.berlin.de/dienstleistung/327537/ — Berlin (LABO) official page — fetched directly — accessed 2026-07-05 — **confirmed** (documents list, fees €37.50/€45.10, first-aid course for third-country only)
  - https://www.adac.de/verkehr/rund-um-den-fuehrerschein/auslaendische-fuehrerscheine/fuehrerscheinuebersetzung/ — fetched directly — accessed 2026-07-05 — **confirmed** (translation triggers, service description; did not state pricing in the fetched excerpt — price figures below sourced from search-snippet corroboration instead)
  - https://www.adac.de/der-adac/regionalclubs/suedbayern/internationale-fuehrerscheinuebersetzung/ and sibling ADAC regional-club pages — accessed via search 2026-07-05 — **confirmed** (€55/€85/€25 pricing, ~10 working days) — consistent across multiple ADAC regional-club pages found in search results, though not each fetched directly
  - https://www.dortmund.de/services/fuehrerschein-umtausch-umschreibung-von-auslaendischem-fuehrerschein.html — accessed via search 2026-07-05 — **likely** (the "filing in time is enough" claim specifically) — not directly fetched, found via search snippet
  - General cost/timing corroboration: https://www.fuehrerschein-umtauschfrist.de/kosten/, https://www.bussgeldkatalog.org/fuehrerschein-umschreiben/ — accessed 2026-07-05 — **likely** (SEO/consumer-guide sites, useful for range corroboration, not primary sources)

### 1.5 International Driving Permit (IDP) — new, minor addition

**Draft one-line addition for `documents_md` or a footnote:**
> "If you need to keep driving legally on your foreign licence for short trips *before* your Umschreibung is
> done (e.g. renting a car while paperwork is pending), consider getting an **International Driving Permit
> (Internationaler Führerschein)** from your home country before moving, or check with your embassy — it's a
> translation aid, not a way to extend the 6-month window itself. In Germany, if you needed to get one, cost
> is roughly **€15–20** and it's issued regionally (varies by Bundesland/city), not through the
# Führerscheinstelle exchange process."

- **Confidence: likely.** Source: https://www.adac.de/verkehr/rund-um-den-fuehrerschein/fahren-ausland/internationaler-fuehrerschein/ — found via search, not fetched directly this pass — accessed 2026-07-05. **Low priority — flag for Verifier only if there's room; this is a minor supporting fact, not core to the task.**

### 1.6 Proposed `after_md` addition

> "**If your country has full reciprocity (tier 1 above):** you'll typically receive your new German licence
> within the same processing window as above (roughly 4–14 weeks after filing a complete application), no
> test required.
>
> **If a test is required:** book your theory and/or practical test through a **Fahrschule** (driving
> school) — in some cities the practical test is administered via **DEKRA or TÜV** examiners rather than
> directly by the city office. Test-slot availability varies significantly by city and season; start this
> as early as possible within your 6-month window, since driving-school and test-slot backlogs are a common
> cause of people running close to the deadline.
>
> Your **original foreign licence is retained** by the German authority once your German licence is issued —
> keep a certified copy/translation for your own records if you may need to prove your original driving
> history later (e.g. for insurance abroad)."

- **Confidence: confirmed** (DEKRA testing mentioned explicitly for Leipzig's process; general Fahrschule
  booking pattern confirmed across multiple city pages; licence retention confirmed via Berlin/Hamburg
  official pages).

---

## PART 2 — City-specific local office (`city_task_variants`, one row per city, `task_id = 410d4c2e-8f10-4b44-88d9-f92e08934129`)

**Honesty framing used throughout (per the Finanzämter precedent from Group B):** where a single-office city
answer genuinely exists, give the real name/address. Where the responsible authority is a **district/
regional body**, or the city runs **multiple decentralized locations with no single "the" office**, say so
explicitly and point to the official finder/booking page rather than picking one address arbitrarily.
All rows below propose populating **only**: `office_name`, `office_address` (where one genuinely and
singularly applies), `booking_url`, `city_notes_md`, `sources`, `last_verified_at = 2026-07-05`,
`generated_by`. Leave `appointment_required` = true for all (universally true per every source checked —
walk-in is essentially extinct for this task nationwide, Bremen being a partial/contested exception, see
below), `fees_eur`/`fees_note` deliberately left for the Verifier to decide whether city-specific numbers
are safe to store (see PART 1.4 cost range — I'd lean toward leaving `fees_eur` null and using the national
range in the guide rather than 15 separate fee numbers this pass, but Verifier's call).

### 2.1 Berlin
- **office_name:** "LABO — Landesamt für Bürger- und Ordnungsangelegenheiten, Fahrerlaubnisbehörde"
- **office_address:** "Puttkamerstraße 16–18, 10969 Berlin" — **confidence: confirmed** (direct fetch of service.berlin.de)
- **booking_url:** https://service.berlin.de/dienstleistung/327537/ (non-EU/Drittstaat conversion service page, has booking link) — **confirmed**
- **city_notes_md draft:** "Applications can be submitted at the central LABO Fahrerlaubnisbehörde or at your local Bürgeramt — Berlin explicitly allows this service borough-wide ('berlinweit'), so you don't need to go to a specific district office. Book via service.berlin.de or the citizen phone (115). Fee: €37.50 without exam, €45.10 with exam (as of the page checked 2026-07-05 — confirm current fee at booking)."
- **Sources:** https://service.berlin.de/dienstleistung/327537/ — fetched directly — accessed 2026-07-05 — **confirmed**

### 2.2 Munich
- **office_name:** "KVR München — Kreisverwaltungsreferat, Führerscheinstelle"
- **office_address:** "Garmischer Straße 19–21, 81373 München" — **confidence: confirmed** (direct fetch of stadt.muenchen.de). **Note for Verifier:** search snippets also surfaced "Eichstätter Straße 2, 80686 München" for a "Führerscheinstelle" — cross-checking, that address appears to belong to the **Kfz-Zulassungsstelle** (vehicle registration), a related but distinct KVR department at a different address. Recommend the Verifier double-check directly on stadt.muenchen.de before publishing, since giving the wrong building is a real user-facing failure mode.
- **booking_url:** https://stadt.muenchen.de/service/info/fuhrerscheinstelle/1071898/ — **confirmed**
- **city_notes_md draft:** "Munich's Führerscheinstelle is part of the KVR (Kreisverwaltungsreferat) at Garmischer Straße 19–21 — a different building from the Kfz-Zulassungsstelle (vehicle registration), so double check you're booking the right department. Appointment required, booked online. Processing commonly takes up to 12–14 weeks after complete submission — file well before your 6-month deadline."
- **Sources:** https://stadt.muenchen.de/service/info/fuhrerscheinstelle/1071898/ — fetched directly — accessed 2026-07-05 — **confirmed**; address discrepancy flagged as **unverified pending Verifier double-check**

### 2.3 Hamburg
- **office_name:** "Landesbetrieb Verkehr (LBV) Hamburg — Führerscheinstelle / Fahrerlaubnisbehörde"
- **office_address:** "Ausschläger Weg 100, 20537 Hamburg" — **confidence: likely** (from a third-party directory, not the official hamburg.de page directly this pass — recommend Verifier confirm on hamburg.de/verkehr/lbv/fuehrerschein directly)
- **booking_url:** https://www.hamburg.de/service/info/11433182/n0/ (Drittstaat conversion service page) / https://www.lbv-termine.de (appointment system) — **confirmed** for the service page; the lbv-termine.de booking portal found via search, not fetched directly
- **city_notes_md draft:** "Handled by the Landesbetrieb Verkehr (LBV), Hamburg's combined vehicle-registration-and-driving-licence authority — not a Bürgeramt. Appointment required via lbv-termine.de or hamburg.de. Documents, fee (€37.50–74.40 depending on class/completeness) and ~3–4 week card production time confirmed directly on hamburg.de."
- **Sources:** https://www.hamburg.de/service/info/11433182/n0/ — fetched directly — accessed 2026-07-05 — **confirmed** for process/fee/documents; office address **likely** only, flag for Verifier

### 2.4 Cologne
- **office_name:** "Straßenverkehrsamt Köln — Führerschein-, Fahrlehrer- und Fahrschulangelegenheiten"
- **office_address:** "Stadthaus Deutz, Willy-Brandt-Platz 3, 50679 Köln" — **confidence: confirmed** (direct fetch of stadt-koeln.de address listing)
- **booking_url:** https://www.stadt-koeln.de/service/produkte/00836/index.html (Drittstaat conversion service page) — **confirmed**
- **city_notes_md draft:** "Cologne's Straßenverkehrsamt (which houses the Führerscheinstelle) is at Stadthaus Deutz — appointment required, book via the city's online terminal system or citizen hotline (115 / 221-0). Fee depends on origin state and exam requirement (roughly €35–44 as of the page checked)."
- **Sources:** https://www.stadt-koeln.de/service/adressen/00653/index.html — fetched directly — accessed 2026-07-05 — **confirmed**

### 2.5 Frankfurt am Main
- **office_name:** "Straßenverkehrsamt Frankfurt — Führerscheinstelle"
- **office_address:** "Gutleutstraße 191, 60327 Frankfurt am Main" — **confidence: likely** (direct WebFetch of the official frankfurt.de page returned HTTP 403; this address comes from search-engine snippets corroborating the frankfurt.de listing, not a clean direct fetch — Verifier should retry loading frankfurt.de directly, possibly via a different fetch method/browser, since the primary site blocked automated fetch this pass)
- **booking_url:** https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/ordnungsamt/fuehrerscheinstelle (found via search; direct fetch blocked with 403 this pass — Verifier should re-check this loads and is the correct current URL)
- **city_notes_md draft:** "Frankfurt's Führerscheinstelle sits within the Straßenverkehrsamt (part of the Ordnungsamt) — a personal visit needs an appointment via the city's online booking tool (appointments reportedly released each morning around 7am, so booking can be competitive). Note: I could not directly load frankfurt.de this pass (403 response) — address and booking URL are corroborated via search snippets only; Verifier should confirm directly."
- **Sources:** search-snippet corroboration only this pass — accessed 2026-07-05 — **likely**, flagged for direct Verifier re-check

### 2.6 Stuttgart
- **office_name:** "Führerscheinstelle Stuttgart (Landeshauptstadt Stuttgart)"
- **office_address:** "Krailenshaldenstraße 32, 70469 Stuttgart (Feuerbach)" — **confidence: likely** (search-snippet corroborated across multiple sources; a second address "Löwentorbogen 11, 70376 Stuttgart" was also mentioned in one source — possible confusion between the Führerscheinstelle and the combined Kfz-Zulassungs- und Führerscheinstelle location. **Flag for Verifier**: confirm the single current address directly on stuttgart.de before publishing.)
- **booking_url:** https://www.stuttgart.de/en/organigramm/leistungen/fuehrerschein-umschreibung-eines-auslaendischen-nicht-eu-fuehrerscheins-drittstaat-umschreibung-anlage-11-umschreibung-eu-fuehrerschein-beantragen — **likely** (found via search, has an English-language variant which is a nice fit for this site's audience — not fetched directly this pass)
- **city_notes_md draft:** "Stuttgart's driving-licence office had two associated addresses in different sources (Krailenshaldenstraße in Feuerbach vs. Löwentorbogen) — likely a recent relocation or a split between vehicle-registration and licence functions. Online appointment is mandatory (walk-ins not accepted per the city's own page). Verify the current single address directly on stuttgart.de before publishing. Notably, Stuttgart offers an English-language version of its official service page — good to link directly for this audience."
- **Sources:** search-snippet corroboration only this pass — accessed 2026-07-05 — **likely**, address flagged **unverified/conflicting** for the Verifier

### 2.7 Düsseldorf
- **office_name:** "Straßenverkehrsamt Düsseldorf — Fahrerlaubnisbehörde / Führerscheinstelle"
- **office_address:** "Höherweg 101, 40233 Düsseldorf" — **confidence: confirmed** (matches the city's own Straßenverkehrsamt listing, corroborated across multiple sources including service.duesseldorf.de search results)
- **booking_url:** https://service.duesseldorf.de/suche/-/egov-bis-detail/dienstleistung/264/show — **confirmed**
- **city_notes_md draft:** "Appointment required (no walk-ins) — book via service.duesseldorf.de or termine.duesseldorf.de. Direct phone/email contact for the licence-conversion team: 0211 8990138 / fuehrerscheinstelle@duesseldorf.de. Processing commonly takes around 12 weeks — file well before your 6-month deadline."
- **Sources:** https://service.duesseldorf.de/suche/-/egov-bis-detail/dienstleistung/264/show — accessed via search 2026-07-05 — **confirmed** (consistent detail across several independent listings, including the city's own service portal)

### 2.8 Dortmund
- **office_name:** "Bürgerdienste Dortmund — Fahrerlaubnisbehörde / Führerscheinstelle" (with decentralized district locations also accepting applications)
- **office_address:** No single office — give the honest multi-location framing: main address "Südwall 2–4, 44137 Dortmund," **plus** explicitly-named district (Bezirksverwaltungsstelle) locations at Harkortstraße 58 (Hombruch) and Hörder Bahnhofstraße 16 (Hörde) also handle this service. **Confidence: likely** (search-snippet corroborated, not directly fetched from dortmund.de this pass).
- **booking_url:** https://www.dortmund.de/services/fuehrerschein-umtausch-umschreibung-von-auslaendischem-fuehrerschein.html — **likely**, found via search
- **city_notes_md draft:** "Dortmund runs this service at the central Bürgerdienste office (Südwall 2–4) **and** several district Bezirksverwaltungsstellen (e.g. Hombruch, Hörde) — there isn't one single required office, so book whichever location has availability via dortmund.termine-reservieren.de or the citizen line (0231 50-111 50). Notably, Dortmund's own page states that **filing your application within the 6-month window is sufficient** even if processing takes longer — a helpful reassurance, though the Researcher could not confirm whether this is a general FeV principle or Dortmund's own administrative practice, so state this as 'Dortmund says...' rather than as a universal rule until the Verifier checks."
- **Sources:** https://www.dortmund.de/services/fuehrerschein-umtausch-umschreibung-von-auslaendischem-fuehrerschein.html — accessed via search 2026-07-05 — **likely**

### 2.9 Essen
- **office_name:** "Fahrerlaubnisbehörde Essen (Straßenverkehrsamt) — Technisches Rathaus"
- **office_address:** "Hollestraße 3, 45127 Essen" (Technisches Rathaus) — **confidence: likely**; one source also names "Altendorfer Straße 101, 45143 Essen" for "Kraftfahrzeugzulassungen und Fahrerlaubnisse," suggesting — similar to Munich — a possible split between vehicle-registration and driving-licence functions, or a relocation. **Flag for Verifier** to confirm the single correct current address via service.essen.de directly.
- **booking_url:** https://meintermin.essen.de (appointment portal; must select "Umschreibung einer ausländischen Fahrerlaubnis") — **confirmed pattern**, exact deep-link not captured this pass
- **city_notes_md draft:** "Essen requires a booked appointment (meintermin.essen.de) — walk-ins are not accepted. Two addresses appear in different sources for Essen's licence/vehicle authority (Technisches Rathaus, Hollestraße 3 vs. Altendorfer Straße 101) — Verifier should confirm which one currently handles Umschreibung specifically before this goes live. General phone line: ServiceCenter Essen, 0201 88-33888."
- **Sources:** https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/41485/show — accessed via search 2026-07-05 — **likely**, address conflict flagged

### 2.10 Dresden
- **office_name:** "Fahrerlaubnisbehörde Dresden (Ordnungsamt)"
- **office_address:** "Hauboldstraße 7, 01239 Dresden" — **confidence: likely** (search-snippet corroborated from dresden.de itself, not directly fetched this pass)
- **booking_url:** https://www.dresden.de/de/rathaus/dienstleistungen/auslaendischen-fuehrerschein-umschreiben.php — **likely**
- **city_notes_md draft:** "Applications must be made in person, with your main residence registered in Dresden. Book via the city's online appointment system for the service 'Ausländischen Führerschein umschreiben.' Postal correspondence goes to a separate PO box (Postfach 120020, 01001 Dresden) even though in-person applications happen at Hauboldstraße 7 — worth noting so people don't mail documents to the visiting address by mistake. Fee cited around €45, but confirm current fee directly."
- **Sources:** search-snippet corroboration of dresden.de content — accessed 2026-07-05 — **likely**

### 2.11 Hanover
- **office_name:** "Fahrerlaubnisbehörde — Region Hannover" (**district/regional authority, not the city of Hannover itself** — the honesty case explicitly flagged in the task brief)
- **office_address:** "Hildesheimer Straße 20, 30169 Hannover" — **confidence: confirmed** (direct fetch of the official hannover.de page)
- **booking_url:** https://www.hannover.de/Leben-in-der-Region-Hannover/Mobilit%C3%A4t/Kraftfahrzeug-Stra%C3%9Fe/Fahrerlaubnis%C2%AD%C2%ADbeh%C3%B6rde-Region-Hannover/Umschreibung-einer-ausl%C3%A4ndischen-Fahrerlaubnis — **confirmed**
- **city_notes_md draft:** "Important: driving-licence matters for Hanover are handled by **Region Hannover** (the district-level authority covering the city plus surrounding municipalities), administered by 'Team 32.08 – Fahrerlaubnisangelegenheiten' — not a city-only Bürgeramt function. Appointment is mandatory; book online or, if no slots show, email 32.12Terminvergabe@hannover-stadt.de directly."
- **Sources:** https://www.hannover.de/... (path above) — fetched directly — accessed 2026-07-05 — **confirmed**

### 2.12 Leipzig
- **office_name:** "Fahrerlaubnisbehörde Leipzig (Technisches Rathaus)"
- **office_address:** "Prager Straße 118–136, 04317 Leipzig" — **confidence: likely** (search-snippet corroborated from leipzig.de, not directly fetched this pass)
- **booking_url:** https://www.leipzig.de/service-portal/dienstleistung/fahrerlaubnis-umschreibung-aus-einem-drittstaat — **likely**
- **city_notes_md draft:** "Book online or via the citizen phone (0341 115); email fahrerlaubnis@leipzig.de. Notably, Leipzig's own page states that for Drittstaat conversions requiring a test, **both the theory and practical exams are administered via DEKRA**, not an in-house city examiner — worth mentioning since other cities route this through a Fahrschule instead."
- **Sources:** https://www.leipzig.de/service-portal/dienstleistung/fahrerlaubnis-umschreibung-aus-einem-drittstaat — accessed via search 2026-07-05 — **likely**

### 2.13 Nuremberg
- **office_name:** "Führerscheinstelle Nürnberg (Ordnungsamt)"
- **office_address:** "Hirschelgasse 32, 90403 Nürnberg" — **confidence: likely** (search-snippet corroborated, not directly fetched from nuernberg.de this pass)
- **booking_url:** https://www.nuernberg.de/internet/ordnungsamt/fuehrerschein_termin.html — **likely**
- **city_notes_md draft:** "Appointment recommended even for matters that technically allow drop-in, since Nuremberg increasingly pushes even simple requests through BundID-linked online services. New appointment slots are commonly released each morning (reported ~7–8am) — book early. Fee cited as roughly €30 (EU conversion) vs €45 (Drittstaat), consistent with the national range in this guide."
- **Sources:** https://www.nuernberg.de/internet/ordnungsamt/fuehrerscheine.html — accessed via search 2026-07-05 — **likely**

### 2.14 Bremen
- **office_name:** "Führerscheinstelle Bremen (Stadtamt)"
- **office_address:** "Stresemannstraße 48, 28207 Bremen" — **confidence: likely** (search-snippet corroborated, not directly fetched from service.bremen.de this pass)
- **booking_url:** https://www.service.bremen.de/dl-der-senator-fuer-inneres-und-sport-11729/dl-buergeramt-116324/dl-fahrerlaubnisse-9326 — **likely**
- **appointment_required:** Genuinely uncertain/contested this pass — flag explicitly rather than guess.
- **city_notes_md draft:** "**Honesty flag, needs Verifier resolution:** one source found this pass explicitly states Bremen's Führerscheinstelle takes walk-ins during opening hours with **no appointment system** ('Es werden keine Termine vergeben. Sprechen Sie einfach ohne Termin während der Öffnungszeiten vor'), while the general pattern in all other 14 cities researched is appointment-mandatory. This would make Bremen a genuine outlier, which is plausible (smaller-volume city office) but risky to publish without direct confirmation, since 'no appointment needed' is exactly the kind of claim that goes stale fast and burns trust if wrong. **Do not publish `appointment_required = false` for Bremen without the Verifier directly loading service.bremen.de and confirming this is still current.** Opening hours cited: Mon 08:00–12:00 & 14:00–17:00, Tue 08:00–12:00, Wed closed, Thu 08:00–12:00, Fri 07:30–11:00 (narrow — worth double-checking too)."
- **Sources:** search-snippet corroboration only — accessed 2026-07-05 — **unverified** for the walk-in claim specifically; **likely** for address/contact

### 2.15 Aachen
- **office_name:** "Führerscheinstelle der StädteRegion Aachen" (**district-level authority — the office is not even physically in Aachen city**, another explicit honesty case matching the task brief)
- **office_address:** "Carlo-Schmid-Straße 4, 52146 Würselen" — **confidence: confirmed** (direct search-snippet quote from the official staedteregion-aachen.de page, consistent phrasing "persönlich in der Führerscheinstelle der StädteRegion Aachen, Carlo-Schmid-Straße 4, 52146 Würselen, erforderlich")
- **booking_url:** https://www.staedteregion-aachen.de/de/navigation/aemter/strassenverkehrsamt-a-36/fuehrerscheinstelle/umschreibung-eines-auslaendischen-fuehrerscheins — **confirmed**
- **city_notes_md draft:** "Important for newcomers searching 'Aachen Führerscheinstelle': the responsible authority is the **StädteRegion Aachen** (a district-level body covering Aachen plus surrounding towns), and its Führerscheinstelle is physically located in **Würselen**, a neighbouring town — not in Aachen itself. Appointment is mandatory, online-only booking. Note also: Anlage 11/Drittstaat licences must still be valid (not expired) at the time you apply — the office states this explicitly, a detail some other cities don't spell out."
- **Sources:** https://www.staedteregion-aachen.de/de/navigation/aemter/strassenverkehrsamt-a-36/fuehrerscheinstelle/umschreibung-eines-auslaendischen-fuehrerscheins — accessed via search 2026-07-05 — **confirmed**

---

## Cross-cutting notes for the Verifier

1. **Address discrepancies found in 3 of 15 cities (Munich, Stuttgart, Essen)** where two different
   addresses appeared across sources — most likely explained by a split between the driving-licence
   office and the separate vehicle-registration (Kfz-Zulassung) office, or a recent relocation. I've flagged
   each specifically above with the conflicting address named. **These three need a direct primary-source
   check before publishing** — giving a newcomer the wrong building address is a worse failure than a
   vague "check the official finder" framing.
2. **Bremen's "no appointment needed" claim is the single highest-priority item to verify** — it contradicts
   the appointment-mandatory pattern found in all 14 other cities and in the national §1.4 framing above. If
   true, it's a genuinely valuable, differentiated fact (rare good news for a newcomer); if stale, publishing
   it would actively mislead someone into a wasted trip. Recommend the Verifier load service.bremen.de
   directly (my WebFetch calls this pass were budgeted toward the other 14 cities and the national section).
3. **Frankfurt's official site (frankfurt.de) returned HTTP 403 on direct WebFetch** — similar to the
   rundfunkbeitrag.de/schufa.de pattern seen in the Group A packet. All Frankfurt facts here rest on
   search-engine snippets. Recommend a direct browser-based check if possible.
4. **Two genuinely confirmed "district/regional authority, not the city itself" cases** — exactly the
   pattern the task brief asked to watch for, same mechanism as Finanzämter in Group B:
   - **Hanover**: handled by **Region Hannover**, confirmed via direct fetch.
   - **Aachen**: handled by the **StädteRegion Aachen**, physically sited in **Würselen**, not Aachen city.
   Both are worth calling out prominently in the guide/city notes since a newcomer searching only for
   "Aachen Führerscheinstelle" or assuming a city-run office in Hanover would be looking in the wrong place.
5. **Dortmund's "filing in time is enough even if processing overruns" claim** is stated on Dortmund's own
   city page but I could not confirm whether this reflects a general FeV/§29 principle (which would make it
   safe to generalize to all 15 cities in the national `after_md`) or is Dortmund's own specific
   administrative reassurance. Recommend the Verifier check this against the Anlage 11/§29 FeV text or at
   least 2–3 other city pages before deciding whether to promote it to the national-level text or keep it
   scoped to Dortmund's `city_notes_md` only.
6. **No `fees_eur` numeric values proposed per city this pass** — I found city-specific fee figures (Berlin
   €37.50/€45.10, Cologne €35–44.20, Munich €37.50–45.90, Stuttgart ~€25.30, Nuremberg ~€30–45, Dresden ~€45,
   Hamburg €37.50–74.40) but recommend the Verifier decide whether storing 15 separate hard numbers (which
   will drift out of date at different times per city) is worth it versus keeping the guide's national
   range (~€35–90) as the single source of truth and only noting "fees vary slightly by city" in
   `city_notes_md`. I lean toward the latter per the honesty/false-precision rule, but flagging the option.
7. **`legal_basis` field is currently NULL on the guide row** — this packet proposes filling it with
   "§29 FeV (6-month rule / recognition) + §31 FeV and Anlage 11 FeV (exchange country tiers)" — a genuine
   gap-fill, not a duplicate of existing content.
8. All 15 `city_task_variants` rows proposed above are **net-new** (query confirmed zero existing rows for
   this task_id) — none of this is an edit to existing data, so there's no risk of contradicting a
   previously-published fact for this specific task.
9. Suggest updating `guides.last_verified_at` to 2026-07-05 and appending new source URLs to
   `guides.sources` (additive, keep the existing KBA reference) once the Verifier signs off.
