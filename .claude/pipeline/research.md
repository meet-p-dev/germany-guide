# Research packet — Item 1: Deepen Anmeldung city-variant content (15 existing cities)

- **Author:** Researcher (step ①)
- **Date compiled:** 2026-07-04
- **Topic (from selection.md):** Deepen Anmeldung (address registration) city-variant content for the 15 cities already in the DB. Standing directive: city-specific detail for EXISTING cities only.
- **Target task:** `anmeldung` (task slug), 15 cities. Read-only research — no DB writes, no source edits.
- **Target tables/columns:** mostly `city_task_variants` (`booking_url`, `office_name`, `office_address`, `office_hours`, `typical_wait_time`, `appointment_required`, `walk_in_possible`, `online_possible`, `city_notes_md`); one candidate `city_step_overrides` insert (Berlin online option). Fees confirmed €0 nationwide already — not re-touched.
- **Cities (exact DB list, name_en):** Aachen, Berlin, Bremen, Cologne, Dortmund, Dresden, Düsseldorf, Essen, Frankfurt am Main, Hamburg, Hanover, Leipzig, Munich, Nuremberg, Stuttgart.

---

## ⭐ CROSS-CUTTING FINDING #1 — Nationwide online Anmeldung (elektronische Wohnsitzanmeldung / EWA) — and why it mostly does NOT help this site's audience

**This is the single most important, audience-critical finding of this packet. The Verifier should prioritise re-checking it.**

The federal **elektronische Wohnsitzanmeldung (EWA)** — a Hamburg-built service now rolled out "für ganz Deutschland" at **https://wohnsitzanmeldung.gov.de/** — lets you register a new main residence fully online, get a digital Meldebestätigung, and update your ID afterward. As of 2026 it is available across Berlin, Bremen, Hamburg, Schleswig-Holstein, Rhineland-Palatinate and **"many municipalities" in every other Bundesland** (Bavaria, BW, NRW, Saxony, Lower Saxony, etc.).

**BUT — the eligibility is the catch, and it is exactly the wrong way round for our readers:**

- Accepted ID documents are **only** the German **Personalausweis** and the **EU/EEA eID-Karte** (both with activated online-ID / eID + PIN), plus a BundID account and the AusweisApp. Source: `wohnsitzanmeldung.gov.de/die-einzelnen-schritte` (accessed 2026-07-04) and personalausweisportal.de.
- **The elektronischer Aufenthaltstitel (eAT) — the residence-permit card held by non-EU internationals — is NOT yet accepted.** Confirmed: "the online service cannot yet be used with an electronic residence permit (eAT)… a future expansion stage to support electronic residence titles [is planned], [and] the online service will also be available in English." (govnext.de EWA FAQ, accessed 2026-07-04.)  →  **Confidence: confirmed** (multiple official/semi-official sources agree).
- Additional universal limit for newcomers: **first registration after moving from abroad ("Zuzug aus dem Ausland") generally requires appearing in person** — e.g. Essen states "For registrations from abroad, all persons to be registered must be present at the Bürgeramt." Online EWA is aimed at *within-Germany* moves of ID/eID holders.

**Implication for the DB `online_possible` column:** Technically these cities now offer online Anmeldung, so a bare `online_possible = true` is *literally* true — but it is **misleading for our non-EU audience**, most of whom hold an eAT and cannot use it. **Recommendation:** either keep `online_possible = false` for the audience, OR set it true ONLY together with a `city_notes_md` caveat that spells out: German Personalausweis / EU eID card only, eAT not yet supported, and abroad-arrivals must usually appear in person. **Do NOT set `online_possible = true` with no caveat.** Flag this decision to the Builder; the honest default is the caveated note.

Sources:
- https://wohnsitzanmeldung.gov.de/ — "Neues Zuhause? Jetzt online anmelden!" (accessed 2026-07-04)
- https://wohnsitzanmeldung.gov.de/die-einzelnen-schritte (accessed 2026-07-04) — Personalausweis / eID-Karte only; supports family unit
- https://www.personalausweisportal.de/…/elektronische-wohnsitzanmeldung/… (accessed 2026-07-04)
- https://www.govnext.de/portal/seiten/faq-elektronische-wohnsitzanmeldung-ewa--900000044-12180.html (accessed 2026-07-04) — eAT not yet usable; support planned
- https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/3509009/show (Essen eWA) + Essen "abroad → all present in person" (accessed 2026-07-04)

---

## ⭐ CROSS-CUTTING FINDING #2 — City portals migrating to `*.gov.de` domains

Several cities have moved their citizen-service portals onto the new federal **`gov.de`** namespace. Booking URLs currently stored may still work (redirect) but new canonical hosts exist:
- **Hanover:** `hannover.gov.de` / `serviceportal.hannover-stadt.de` still live. New: `hannover.gov.de/portal/seiten/buergeraemter-900000003-30810.html`, booking `termin.hannover.gov.de`. Confidence: likely (both resolve).
- **Leipzig:** appointment app now at `leipzig.de/fachanwendungen/termine/` (still under leipzig.de). Confidence: confirmed.
- **Stuttgart:** NEW booking system `stuttgart.konsentas.de` (see Stuttgart below). Confidence: confirmed.

Verifier should confirm whether stored `booking_url`s still resolve; where a cleaner canonical exists, note it. None are *broken* as far as found, so this is low-priority polish.

---

## Per-city research

For each city: **CURRENT DB** (what's stored now) → **NEW / DEEPER draft** (proposed change) → **sources + confidence**. "No change" means current value verified accurate.

---

### 1. Aachen — `city_task_variants` (city slug `aachen`)

**Current DB:** booking_url = serviceportal.aachen.de …/5790/show; office_name = "Bürger*innenbüro Aachen-Mitte"; office_address = "Hackländerstraße 1, 52058 Aachen (Bahnhofplatz) — second location Johannes-Paul-II.-Straße 1, 52062 Aachen (Katschhof)"; office_hours = null; typical_wait_time = phone line note; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- **typical_wait_time (refine):** "Book via the Aachen service portal; extra same-day slots typically release in the morning. Appointment phone line **0241 432-1234**, Mon–Fri." (Keep the phone number — it was in the DB; treat exact 07:45 release time as *likely*, not confirmed this pass.)
- **online_possible:** Aachen (NRW) — EWA is rolling out across NRW municipalities, but not confirmed live specifically for Aachen this pass. **Leave null** or set false-with-caveat; do NOT claim online for Aachen without confirmation. Confidence: unverified for Aachen specifically.
- **city_notes_md:** keep existing (student border-city framing is accurate and useful).
- **Could NOT confirm:** exact office_hours for Aachen-Mitte; the precise 07:45 same-day release time; whether Aachen is live on EWA. → Verifier focus.

Sources: https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show (from DB, accessed 2026-07-02). Confidence on core row: **likely** (unchanged, previously verified).

---

### 2. Berlin — `city_task_variants` (slug `berlin`) + candidate `city_step_overrides`

**Current DB:** booking_url = service.berlin.de/dienstleistung/120686/; office = "Bürgeramt (any district)"; address = "Multiple locations"; hours = "Varies by office"; wait = "2–6 weeks"; appointment_required = true; walk_in = false; online = **true**; notes mention any-district booking, morning slot releases, and online registration. Existing `city_step_overrides` replace-step already mentions the online option.

**Deeper draft (Berlin is the strongest confirmation this pass):**
- **online_possible = true is CORRECT for Berlin** — BUT tighten the note to the audience caveat. Berlin's online Wohnsitz service (service.berlin.de/dienstleistung/120686/) explicitly needs **BundID + activated eID (Personalausweis or EU eID card) + PIN**; certificate lands in the BundID account for download. This again excludes eAT holders. Confidence: **confirmed** (service.berlin.de).
- **NEW booking detail worth adding to city_notes_md / step override:** Berlin runs a **"Vorzugstermine"** (preferred-appointment) system that prioritises core services incl. Anmeldung; *additional* appointments are added daily if capacity allows, sometimes short-notice. The 14-day registration deadline is met by the **confirmation of the booked appointment** (proof of deadline) — a genuinely useful, reassuring fact for newcomers who can't get an early slot. Confidence: **confirmed** (service.berlin.de/dienstleistung/120686/ and /terminvereinbarung/).
- **city_notes_md (proposed add):** "Good news if slots are weeks out: for deadline purposes, the **confirmation email of your booked appointment counts as proof you registered on time** — you won't be penalised for the office's backlog. Online self-registration exists via service.berlin.de but needs a German ID card or EU eID card (an eAT residence-permit card is **not yet** accepted)."
- **Could NOT confirm:** exact current wait range (kept as "2–6 weeks", plausible/likely). → Verifier spot-check.

Sources:
- https://service.berlin.de/dienstleistung/120686/ (accessed 2026-07-04) — BundID/eID online registration, deadline-proof rule
- https://service.berlin.de/terminvereinbarung/ + /terminvereinbarung/hinweise/ (accessed 2026-07-04) — Vorzugstermine, daily additional slots
Confidence: **confirmed** on online + deadline-proof; **likely** on wait range.

---

### 3. Bremen — `city_task_variants` (slug `bremen`)

**Current DB:** booking_url = service.bremen.de/terminbuchung-1469; office_name = "BürgerServiceCenter-Mitte"; office_address = "Martinistraße 3, 28195 Bremen (relocated early 2026 from Pelzerstraße 40)"; office_hours = "Mon & Thu 07:30–17:00, Tue & Fri 07:30–12:00, Wed 07:30–13:00 (varies at other locations)"; wait = "Often several weeks"; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- **office_address:** confirmed correct — Martinistraße 3, 28195 Bremen. Confidence: **confirmed** (service.bremen.de BürgerServiceCenter-Mitte page).
- **appointment_required = true:** confirmed — "in-person visits are only possible by prior appointment." Confidence: **confirmed**.
- **online_possible:** Bremen offers online Wohnsitz registration (single/main residence) — certificate for download within ~10 business days if documents complete. Same eID/BundID gate → same eAT caveat. There is a distinct **"Wohnsitz anmelden, Zuzug aus dem Ausland"** page for arrivals from abroad (in-person). **Recommendation:** online = true ONLY with the audience caveat; note the separate abroad-arrival path. Confidence: **confirmed** (service.bremen.de).
- **city_notes_md (proposed add):** "Bremen was an early adopter of **online residence registration** — if you have a German ID card or EU eID card you can register at service.bremen.de and download your certificate within ~10 working days. Most newcomers arriving **from abroad** can't use this yet and must book an in-person appointment (all people being registered must attend)."
- **Could NOT confirm:** whether every BürgerServiceCenter shares Martinistraße hours (DB already hedges "varies at other locations" — keep). → fine.

Sources:
- https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/buergeramt/buergerservicecenter-mitte-123042 (accessed 2026-07-04)
- https://www.service.bremen.de/dienstleistungen/wohnsitz-als-alleinige-wohnung-oder-hauptwohnung-anmelden-204128 + /wohnsitz-anmelden-zuzug-aus-dem-ausland-123039 (accessed 2026-07-04)
Confidence: **confirmed** on address, appointment-only, online-exists; **likely** on the exact 10-working-day figure.

---

### 4. Cologne (Köln) — `city_task_variants` (slug `cologne`)

**Current DB:** booking_url = terminator.koeln; office_name = "Bürgeramt"; address = null (multi-office, correctly generic); office_hours = "Mon & Wed: walk-in possible… Tue/Thu/Fri appointment"; wait = "several weeks… check terminator.koeln daily"; appointment_required = true; walk_in = true; online = null.

**Deeper draft (now with PRECISE walk-in hours — a real upgrade):**
- **walk-in truth (confirmed + specific):** Kundenzentren handle registration **without an appointment on Mondays and Wednesdays** — specifically the Meldeangelegenheiten (registration) desks are open **Mon 07:30–15:00** and **Wed 07:30–12:00** without appointment. Arrive by ~07:30 as ticket distribution can stop early. Confidence: **confirmed** (stadt-koeln.de/artikel/71152 "Besuch der Kundenzentren ohne Termin").
- **booking release detail:** new online slots on terminator.koeln release **daily roughly 07:00–08:00**. Confidence: **likely** (widely reported; not a single crisp official quote).
- **office_hours (proposed refine):** "Registration desks accept **walk-ins Mon 07:30–15:00 and Wed 07:30–12:00** (arrive by 07:30 — tickets can run out); Tue/Thu/Fri by appointment via terminator.koeln (new slots ~07:00–08:00 daily)."
- **office_address:** keep null — Cologne is genuinely multi-office (district Kundenzentren). Do NOT invent one.
- **Could NOT confirm:** that every district Kundenzentrum shares identical walk-in hours (they broadly do, but hedge). → minor.

Sources:
- https://www.stadt-koeln.de/artikel/71152/index.html (accessed 2026-07-04) — walk-in Mon/Wed hours
- https://www.stadt-koeln.de/artikel/06415/index.html + https://terminator.koeln/ (accessed 2026-07-04)
Confidence: **confirmed** on Mon/Wed walk-in with hours; **likely** on daily 07:00–08:00 release.

---

### 5. Dortmund — `city_task_variants` (slug `dortmund`)

**Current DB:** booking_url = dortmund.de/…/terminvereinbarungen/; office_name = "Dienstleistungszentrum Innenstadt (Bürgerdienste)"; office_address = "Südwall 2–4, 44137 Dortmund"; office_hours = "Mon 07:00–16:00, Tue 07:00–16:00, Wed 07:00–12:00, Thu 07:00–18:00, Fri 07:00–12:00 (district offices from 08:00)"; wait = "Slots release daily 07:00 for same-day/+7/+14 — often bookable within 1–2 weeks"; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- **office_address + hours:** re-confirmed — Südwall 2–4, 44137 Dortmund; hours Mon/Tue 07:00–16:00, Wed 07:00–12:00, Thu 07:00–18:00, Fri 07:00–12:00. Confidence: **confirmed** (dortmund.de + meldebox listing agree).
- **phone:** Bürgerdienste 0231 50-2981 / -29837, buergerdienste@stadtdo.de (DB currently lists 0231 50-1 11 50 in notes — a general line; both plausibly valid). Verifier: reconcile which phone number to show. Confidence: **likely**.
- **booking system:** also reachable via dortmund.termine-reservieren.de. Confidence: **confirmed**.
- **walk_in:** no evidence of a general no-appointment window for Anmeldung — Dortmund is appointment-driven. **Recommend leaving walk_in = null/false** (do not assert walk-in). Confidence for "appointment-based": **likely**.
- **online_possible:** NRW EWA rollout may cover Dortmund but not confirmed this pass → leave null. Unverified.
- **Could NOT confirm:** general walk-in availability; EWA live status for Dortmund. → Verifier focus (low priority — safe to leave as-is).

Sources: https://www.dortmund.de/rathaus/verwaltung/buergerdienste/terminvereinbarungen/ ; https://dortmund.termine-reservieren.de/ (accessed 2026-07-04). Confidence: **confirmed** on address/hours; row otherwise unchanged.

---

### 6. Dresden — `city_task_variants` (slug `dresden`)

**Current DB:** booking_url = termine-buergerbuero.dresden.de; office_name = "Bürgeramt"; address = null; office_hours = "Tue & Thu 13:00–16:00: walk-in possible at most Bürgerbüros… otherwise by appointment"; wait note; appointment_required = true; walk_in = true; online = null.

**Deeper draft (now with the exact list of walk-in offices — upgrade):**
- **walk-in truth (confirmed + specific):** walk-in **without appointment on Tuesdays and Thursdays 13:00–16:00** at these **10 Bürgerbüros: Altstadt, Junioramt, Blasewitz, Cotta, Klotzsche, Leuben, Neustadt, Pieschen, Plauen, Prohlis** — expect long waits. Confidence: **confirmed** (dresden.de Bürgerbüros page, updated May 2026).
- **office_hours (proposed refine):** "Walk-in without appointment **Tue & Thu 13:00–16:00** at the Altstadt, Junioramt, Blasewitz, Cotta, Klotzsche, Leuben, Neustadt, Pieschen, Plauen and Prohlis Bürgerbüros (expect long waits); otherwise by appointment via termine-buergerbuero.dresden.de."
- **online_possible:** Saxony participates in EWA rollout but Dresden-specific live status not confirmed this pass → leave null; unverified.
- **office_address:** keep null (multi-office). The central **Zentrales Bürgerbüro Altstadt** exists but Dresden is genuinely decentralised — don't collapse to one address.
- **Could NOT confirm:** Dresden EWA live status; whether all 10 offices keep the exact 13:00–16:00 window year-round. → Verifier focus.

Sources: https://www.dresden.de/de/rathaus/dienstleistungen/buergerbueros.php ; https://termine-buergerbuero.dresden.de/ (accessed 2026-07-04). Confidence: **confirmed** on walk-in office list + hours.

---

### 7. Düsseldorf — `city_task_variants` (slug `duesseldorf`)

**Current DB:** booking_url = termine.duesseldorf.de; office_name = "Bürgeramt"; address = null (multi-office, correctly generic); office_hours = null; wait = "Often several weeks"; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- Düsseldorf's Bürgerbüros are genuinely spread across districts and booked via **termine.duesseldorf.de** — a less-central office often has earlier slots (DB note is accurate — keep). Confidence: **confirmed** on portal.
- **online_possible:** NRW EWA rollout likely covers Düsseldorf but not confirmed live this pass → leave null. Unverified.
- **office_address / office_hours:** keep null — multi-office; **do NOT invent** a single address/hours. This is correct honesty.
- **Could NOT confirm this pass:** any general walk-in window; EWA live status; a single set of hours. → Verifier focus; safe to leave row essentially as-is (this city has genuinely little single-value data).

Sources: https://termine.duesseldorf.de/ ; https://www.duesseldorf.de/einwohnerangelegenheiten (from DB, accessed 2026-07-02). Confidence: **likely** (row unchanged, previously verified).

---

### 8. Essen — `city_task_variants` (slug `essen`)

**Current DB:** booking_url = essen.de/rathaus/onlinetermine…; office_name = "Bürgeramt"; address = null; office_hours = null; wait = "base allotment 6 weeks ahead, extra 1 week ahead + same-day each morning"; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- **appointment_required = true (confirmed):** "a visit is generally only possible with an appointment." Confidence: **confirmed** (service.essen.de).
- **online_possible:** Essen is an **early eWA adopter** — online residence registration available "at any time, even outside opening hours." BUT the SAME eID/eAT gate applies, AND Essen explicitly states **"For registrations from abroad, all persons to be registered must be present at the Bürgeramt."** → set online = true ONLY with the caveat note; abroad-arrivals in person. Confidence: **confirmed** (service.essen.de eWA + abroad pages).
- **city_notes_md (proposed add):** "Essen was one of the first cities to offer **online residence registration (eWA)** — but only with a German ID card / EU eID card, and if you're arriving **from abroad you must appear in person** (everyone being registered has to attend). Register within **14 days** of moving in."
- **office_hours:** Essen has several Bürgerämter (Borbeck, Altenessen, Steele, Kupferdreh, Kettwig, Gildehof) with differing hours (Gildehof piloting 07:00–18:00 variable slots). → keep office_hours null (multi-office). Do NOT collapse.
- **Could NOT confirm:** a single uniform opening-hours value (correctly stays null). → fine.

Sources:
- https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/57180/show (Terminvereinbarung) ; /3509009/show (eWA) ; /41483/show (Anmeldung Wohnsitz) (accessed 2026-07-04)
Confidence: **confirmed** on appointment-only + eWA + abroad-in-person.

---

### 9. Frankfurt am Main — `city_task_variants` (slug `frankfurt`)

**Current DB:** booking_url = frankfurt.de/…/online-terminvereinbarungen; office_name = "Bürgeramt"; address = null; office_hours = "Mon & Wed: walk-in possible; Tue/Thu/Fri appointment"; wait = "New slots each weekday 06:00, two weeks ahead… Terminwunsch alert"; appointment_required = true; walk_in = true; online = null.

**Deeper draft (strongly re-confirmed, with extra detail):**
- **walk-in truth (confirmed):** you can visit the Bürgerämter **Mondays and Wednesdays without a prior appointment** (longer waits; ticket distribution can stop early). Confidence: **confirmed** (frankfurt.de Terminservice).
- **slot release (confirmed + richer):** new appointments release **weekdays at 06:00**, two weeks ahead for the same weekday; **Mondays ~08:00** a batch opens for the following week; same-day urgent slots also at 06:00. The **Terminwunsch** feature emails you automatically when a matching slot frees up — recommend it in the note. Confidence: **confirmed** (frankfurt.de/…/terminservice).
- **office_hours (proposed refine):** "Walk-in Mon & Wed (no appointment; expect queues, tickets can run out early). Tue/Thu/Fri by appointment. New online slots release **weekdays 06:00** (two weeks ahead); set a **Terminwunsch** email alert."
- **office_address:** keep null (multi-office Bürgerämter; a central Zentrales Bürgeramt exists but it's a network). Do NOT collapse.
- **Could NOT confirm:** none material — Frankfurt is well-confirmed this pass.

Sources:
- https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/buergeramt-statistik-und-wahlen/buergeraemter/terminservice (accessed 2026-07-04)
- https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen (accessed 2026-07-04)
Confidence: **confirmed** on walk-in Mon/Wed + 06:00 releases + Terminwunsch.

---

### 10. Hamburg — `city_task_variants` (slug `hamburg`)

**Current DB:** booking_url = serviceportal.hamburg.de/…/DigiTermin; office_name = "Bürgeramt"; address = null; office_hours = "Varies… main Hamburg Service centers typically Mon–Fri 07:00–19:00"; wait = "Often several weeks"; appointment_required = true; walk_in = null; online = null.

**Deeper draft:**
- **online_possible:** Hamburg is the **home of the EWA service** (it built wohnsitzanmeldung.gov.de for all of Germany) and offers online residence registration. Same eID/eAT gate → same caveat. Confidence: **confirmed** (hamburg.de / wohnsitzanmeldung.gov.de). → set online = true WITH caveat note.
- **office structure:** Anmeldung runs through district **Kundenzentren** (customer centres), booked via the Hamburg Serviceportal / **DigiTermin**; availability varies a lot between districts — check several (DB note accurate — keep). Main Hamburg Service centres broadly Mon–Fri with long hours; keep office_hours hedged (don't over-specify 07:00–19:00 as universal — mark as *typical for main centres*). Confidence on structure: **confirmed**; on exact 07:00–19:00: **likely**.
- **city_notes_md (proposed add):** "Hamburg pioneered Germany's **online residence registration** (it runs the national wohnsitzanmeldung.gov.de). If you hold a German ID card or EU eID card you may be able to register from home; most newcomers on a residence permit (eAT) still book a **Kundenzentrum** appointment via the Hamburg Serviceportal — availability swings a lot by district, so check several."
- **Could NOT confirm:** that all Kundenzentren keep 07:00–19:00 (hedge to "main centres"). → Verifier.

Sources:
- https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin (accessed 2026-07-04)
- https://www.hamburg.com/residents/civil-services-guide/eid-964918 + wohnsitzanmeldung.gov.de (accessed 2026-07-04)
Confidence: **confirmed** on online-exists + Kundenzentren structure; **likely** on hours.

---

### 11. Hanover — `city_task_variants` (slug `hannover`)

**Current DB:** booking_url = serviceportal.hannover-stadt.de/…/buergeramt-termin-buchen…; office_name = "Bürgeramt"; address = null; office_hours = null; wait = "New online slots ~08:00 daily. Walk-in Thu 08:00–13:00 & 14:00–18:00 at Aegi, Bemerode, Herrenhausen, Linden and Podbi-Park only (not Döhren, Ricklingen, Sahlkamp, Schützenplatz)"; appointment_required = true; walk_in = true; online = null.

**Deeper draft (re-confirmed exactly):**
- **walk-in truth (confirmed):** "spontane Vorsprachen" possible **Thursdays 08:00–13:00 and 14:00–18:00** at **Aegi, Bemerode, Herrenhausen, Linden, Podbi-Park** — NOT at Döhren, Ricklingen, Sahlkamp, Schützenplatz. On busy days ticket distribution ends before closing. The DB value is **accurate — keep as-is.** Confidence: **confirmed** (hannover.de / hannover.gov.de Terminvereinbarung).
- **online_possible:** Hanover lists "Anmeldung einer Wohnung" among online services (EWA). Same eID/eAT caveat. → online = true WITH caveat, or leave null. Confidence: **confirmed** that it's offered.
- **booking_url:** portal also now at hannover.gov.de (see cross-cutting #2). Stored serviceportal.hannover-stadt.de URL still resolves. Verifier: optional to migrate to the .gov.de canonical.
- **Could NOT confirm:** office_address/hours single value (multi-office — keep null). Hanover EWA eligibility specifics for eAT holders (assume same national gate). → Verifier.

Sources:
- https://www.hannover.de/…/Terminvereinbarung-in-den-Bürgerämtern (accessed 2026-07-04)
- https://hannover.gov.de/portal/seiten/buergeraemter-900000003-30810.html (accessed 2026-07-04)
Confidence: **confirmed** on walk-in Thu detail (unchanged) + online-offered.

---

### 12. Leipzig — `city_task_variants` (slug `leipzig`)

**Current DB:** booking_url = leipzig.de/…/aemtertermine-online/; office_name = "Bürgeramt"; address = null; office_hours = null; wait = "Walk-in possible during opening hours (since Nov 2023)… appointment slots release daily 17:00, two weeks ahead"; appointment_required = **false**; walk_in = true; online = null.

**Deeper draft (re-confirmed + a genuinely useful new tool):**
- **walk-in truth (confirmed):** Leipzig's Bürgerämter can be **visited during opening hours WITHOUT an appointment** — this is why `appointment_required = false` is correct and Leipzig is the friendliest of the 15 for walk-ins. Confidence: **confirmed** (leipzig.de Bürgerbüros / Ämtertermine pages).
- **NEW useful fact:** Leipzig publishes **live wait times** at **leipzig.de/wartezeiten-buergerbueros** — recommend adding to city_notes_md so newcomers can pick the least-busy office in real time. There are **15 locations** across the city, usable regardless of your district. Confidence: **confirmed**.
- **city_notes_md (proposed add):** "You don't strictly need an appointment in Leipzig — its **15 Bürgerämter accept walk-ins during opening hours** (since Nov 2023). Check **live wait times at leipzig.de/wartezeiten-buergerbueros** and pick the quietest office. Prefer certainty? Book online — new slots release **daily at 17:00**, two weeks ahead."
- **office_address:** keep null (15 offices). Do NOT collapse.
- **Could NOT confirm:** the exact "17:00 daily, two weeks ahead" release still holds in 2026 (mark *likely*); Leipzig EWA status (Saxony rollout — unverified). → Verifier focus.

Sources:
- https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/buergerbueros/ (accessed 2026-07-04)
- https://www.leipzig.de/fachanwendungen/termine/index.html + live wait times leipzig.de/wartezeiten-buergerbueros (accessed 2026-07-04)
Confidence: **confirmed** on walk-in + live-wait-times + 15 offices; **likely** on 17:00 release.

---

### 13. Munich — `city_task_variants` (slug `munich`) + existing `city_step_overrides`

**Current DB:** booking_url = stadt.muenchen.de/buergerservice/terminvereinbarung.html; office_name = "Bürgerbüro (KVR)"; office_address = "Ruppertstraße 19, 80337 München (main office; several branches)"; office_hours = "Mon–Fri mornings; extended Thursdays"; wait = "Same day to 2 weeks"; appointment_required = **false**; walk_in = **true**; online = **false**; notes describe walk-in-with-queue-ticket. Existing `city_step_overrides` insert: "Or: take a queue ticket for walk-in."

**Deeper draft — ⚠️ NEEDS A CAREFUL CORRECTION (flag for Verifier):**
- **Nuance / partial correction on walk-in:** Munich's official Terminvereinbarung page now states appointments are **grundsätzlich** (generally) required, and warns that **without an appointment you may be turned away at the door** for services that need one — with a documented emergency exception handled by phone. HOWEVER, **Anmeldung (registration) is explicitly listed among the services EXEMPTED from the appointment requirement** ("Für Ihren Besuch… brauchen Sie grundsätzlich einen Termin" *except* Anmeldung / Anmeldung Nebenwohnung / Statuswechsel). So: **walk-in IS still genuinely possible for Anmeldung specifically** — the DB's `walk_in = true` / `appointment_required = false` remains DEFENSIBLE for THIS task, but the current notes overstate the general walk-in friendliness. Confidence: **confirmed** (stadt.muenchen.de/infos/terminvereinbarung-buergerbueros.html).
  - **Recommendation for Builder:** keep walk_in = true / appointment_required = false, but **soften the queue-ticket note** to make clear that (a) walk-in without appointment is specifically allowed for *Anmeldung*, (b) for most OTHER Bürgerbüro services you now need an appointment or risk being turned away, and (c) daily ticket numbers for walk-ins are limited so arrive early. Verifier should re-read the official page and finalise the wording.
- **slot release detail (new):** additional same-day appointments release ~**30 min before offices open**; morning = slots for the following week, afternoon = next-day slots; cancellations free slots through the day — "check often." Confidence: **confirmed**.
- **online_possible = false:** consistent with EWA eligibility (Bavaria partial; Munich's own online self-registration not clearly offered to eAT holders). Keep false. Confidence: **likely**.
- **office_address = Ruppertstraße 19 (main KVR):** confirmed as the main office (branches exist). Keep. Confidence: **confirmed**.
- **Could NOT confirm:** exact daily walk-in ticket cap; whether every branch honours Anmeldung walk-in identically. → Verifier focus (this is the #1 city to re-verify wording on).

Sources:
- https://stadt.muenchen.de/infos/terminvereinbarung-buergerbueros.html (accessed 2026-07-04) — Anmeldung exempt from appointment rule; slot-release schedule; general "turned away without appointment" warning
- https://stadt.muenchen.de/buergerservice/terminvereinbarung.html (accessed 2026-07-04)
Confidence: **confirmed** on the nuance; wording needs Verifier finalisation.

---

### 14. Nuremberg (Nürnberg) — `city_task_variants` (slug `nuremberg`)

**Current DB:** booking_url = nuernberg.termine-reservieren.de; office_name = "Bürgeramt Mitte"; office_address = "Äußere Laufer Gasse 25, Nürnberg"; office_hours = "Wed 08:00–12:00: walk-in for urgent cases only (Bürgeramt Mitte); otherwise appointment"; wait = "Slots for next 14 days release daily 06:30; extra same-day ~08:00"; appointment_required = true; walk_in = true; online = null.

**Deeper draft (re-confirmed + fuller hours):**
- **office_address (confirmed + postcode):** **Äußere Laufer Gasse 25, 90403 Nürnberg.** Add the postcode 90403. Confidence: **confirmed**.
- **full opening hours (new detail):** Bürgeramt Mitte — **Mon 08:00–15:30, Tue 10:00–18:00, Wed 08:00–12:30, Thu 08:00–15:30, Fri 08:00–12:30** (by appointment). Confidence: **confirmed** (nuernberg.de/…/buergeramt_mitte/termine.html).
- **walk-in truth (confirmed):** urgent cases without a booked slot **Wed 08:00–12:00 at Bürgeramt Mitte only.** Matches DB — keep. Confidence: **confirmed**.
- **slot release (confirmed):** next-14-days slots daily **06:30**; same-day extras **07:00–08:00**; Tuesdays an extra batch ~**10:00**. Slight enrich over DB. Confidence: **confirmed**.
- **office_hours (proposed refine):** "Bürgeramt Mitte (Äußere Laufer Gasse 25, 90403): Mon 08:00–15:30, Tue 10:00–18:00, Wed 08:00–12:30, Thu 08:00–15:30, Fri 08:00–12:30 by appointment. **Walk-in only for urgent cases, Wed 08:00–12:00.** Online slots release daily 06:30 (14 days ahead), same-day extras 07:00–08:00, plus a Tue ~10:00 batch."
- **phone:** 0911 231-0 (in DB notes — keep). Confidence: **likely**.
- **Could NOT confirm:** none material — Nuremberg well-confirmed.

Sources:
- https://www.nuernberg.de/internet/buergeramt_mitte/termine.html (accessed 2026-07-04)
- https://nuernberg.termine-reservieren.de/ (accessed 2026-07-04)
Confidence: **confirmed** on address+postcode, full hours, walk-in Wed, releases.

---

### 15. Stuttgart — `city_task_variants` (slug `stuttgart`)

**Current DB:** booking_url = service.stuttgart.de/ssc-app-stuttgart/?m=32-42; office_name = "Bürgeramt"; address = null; office_hours = null; wait = "Often several weeks"; appointment_required = true; walk_in = null; online = null.

**Deeper draft — booking URL likely OUTDATED (flag for Verifier):**
- **NEW city-wide online booking (May 2026):** Stuttgart launched a **new online appointment system with city-wide search** across all Bürgerbüros, hosted at **stuttgart.konsentas.de** (Terminservice = stuttgart.konsentas.de/form/1/…). The stored `service.stuttgart.de/ssc-app-stuttgart/?m=32-42` URL may be superseded. **Recommendation:** Verifier should confirm the live booking URL and update `booking_url` to the konsentas endpoint if the old one no longer works. Confidence: **confirmed** that a new system launched; **needs verify** on the exact canonical URL to store.
- **office network (new context):** Bürgerbüros in **Bad-Cannstatt, Mitte, Ost, Süd, West, Vaihingen** (Möhringen closed since Feb 2024 due to staffing → higher load elsewhere; a shared Möhringen+Vaihingen office at Wallgraben is planned). A **real-time traffic-light (Ampel) system** shows current busyness. Confidence: **confirmed** (stuttgart.de news May 2026 + Bürgerbüros page).
- **city_notes_md (proposed add):** "Stuttgart rolled out a **new city-wide appointment search** in 2026 — you can see free slots across every Bürgerbüro at once and grab the earliest. A **live traffic-light indicator** shows how busy each office is. Note the Möhringen office has been closed since 2024, so central offices are busier — booking a less-central Bürgerbüro often gets you in sooner."
- **office_address / hours:** keep null (multi-office). Do NOT collapse. (Example single-office hours exist, e.g. Stuttgart-Ost Mon–Fri 08:30–13:00 + Tue 14:00–16:00 + Thu to 18:00 — but that's one office, not city-wide, so keep out of the shared row.)
- **online_possible:** BW has "many municipalities" on EWA; Stuttgart-specific live status unconfirmed → leave null. Unverified.
- **Could NOT confirm:** exact canonical booking URL to store; Stuttgart EWA live status. → **Verifier focus (booking URL is the priority fix here).**

Sources:
- https://www.stuttgart.de/service/aktuelle-meldungen/2026/mai/mehr-flexibilitaet-bei-buergerbueros-neue-online-terminvergabe-mit-stadtweiter-suche… (accessed 2026-07-04)
- https://stuttgart.konsentas.de/form/1/ + https://www.stuttgart.de/en/service/buergerbueros (accessed 2026-07-04)
Confidence: **confirmed** on new system + office network + Ampel; **needs verify** on exact URL.

---

## Summary of proposed DB changes (for Builder, after Verifier sign-off)

| City | Field(s) to change | Nature | Confidence |
|---|---|---|---|
| Berlin | city_notes_md (+ deadline-proof + eID/eAT caveat); online stays true | enrich | confirmed |
| Bremen | online_possible → true **with caveat**; city_notes_md add | new + caveat | confirmed (existence); likely (10-day) |
| Cologne | office_hours → precise walk-in Mon 07:30–15:00 / Wed 07:30–12:00 | upgrade | confirmed |
| Dresden | office_hours → list 10 walk-in offices, Tue&Thu 13:00–16:00 | upgrade | confirmed |
| Essen | online_possible → true **with caveat** (abroad in person); notes | new + caveat | confirmed |
| Frankfurt | office_hours/notes → 06:00 release + Terminwunsch detail | enrich | confirmed |
| Hamburg | online_possible → true **with caveat**; notes (EWA origin) | new + caveat | confirmed |
| Hanover | online_possible → true **with caveat**; (opt) booking_url .gov.de | new + caveat | confirmed |
| Leipzig | city_notes_md → live wait times + 15 offices | enrich | confirmed |
| Munich | ⚠️ soften walk-in/queue note (Anmeldung exempt; others need appt) | **correction** | confirmed (re-verify wording) |
| Nuremberg | office_address → add 90403; office_hours → full weekly hours | upgrade | confirmed |
| Stuttgart | ⚠️ booking_url → verify/update to konsentas; notes (city-wide search, Ampel, Möhringen) | **fix + enrich** | confirmed (existence); verify URL |
| Aachen / Dortmund / Düsseldorf | minor/none; leave multi-office fields null | no invention | likely |

## Explicit "could NOT confirm" list (Verifier: focus here)
1. **eAT eligibility for EWA per city** — national gate says eAT NOT yet supported; assumed to hold city-by-city but not individually re-checked for each. HIGH IMPORTANCE for `online_possible` wording.
2. **Munich** walk-in wording — Anmeldung is exempt from the appointment rule, but daily ticket cap and per-branch consistency unconfirmed. Re-read official page before finalising.
3. **Stuttgart** exact canonical booking URL (old ssc-app vs new konsentas) — must be confirmed live before updating booking_url.
4. **EWA live status** for Aachen, Dortmund, Düsseldorf, Dresden, Leipzig, Munich, Nuremberg, Stuttgart — left null/unverified deliberately; do NOT claim online for these without a city source.
5. Exact figures marked *likely*: Berlin "2–6 weeks", Bremen "10 working days", Cologne "07:00–08:00 daily release", Leipzig "17:00 daily two-weeks-ahead", Aachen "07:45 same-day release", Hamburg "07:00–19:00" hours.
6. Phone-number reconciliation: Dortmund (0231 50-2981 vs 0231 50-1 11 50).

## Honesty guardrails observed
- No single office address invented for any genuinely multi-office city (Cologne, Dresden, Düsseldorf, Essen, Frankfurt, Hamburg, Hanover, Leipzig, Stuttgart kept generic).
- `online_possible` recommended TRUE only paired with an explicit eID/eAT caveat — never a bare true that would mislead non-EU readers.
- Time-varying values (waits, release times) kept as ranges / "check current" where not crisply sourced.
- Anmeldung is a genuinely city-varying task (per project rules) — this packet only touches Anmeldung; no federally-uniform tasks invented into per-city variants.
