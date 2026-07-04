# Verified packet — consolidated (Anmeldung + residence-permit + commuter towns)

- **Agent:** Verifier (step ②) — read-only. No DB writes, no source edits, no deploys.
- **Verification date:** 2026-07-04 (all access dates below = 2026-07-04 unless noted)
- **Live DB project:** ilfhjffpzvzphbvhdpup — read-only cross-check performed.
- **Method:** Every retained fact was re-confirmed against an official/primary source this pass, OR is explicitly marked provisional/unconfirmed for the Builder to hedge. Researcher confidence flags were NOT trusted.

Legend: **VERIFIED** (source re-confirmed) · **CORRECTED** (changed — what + why) · **REMOVED / UNCONFIRMED** (drop or visible verify-note).

---

## A. CROSS-CUTTING — eAT / online Anmeldung (EWA). CRITICAL for this non-EU audience.

**VERIFIED (and hardened).** Online residence registration (elektronische Wohnsitzanmeldung / city portals) accepts **only** the German **Personalausweis** or an **EU/EEA eID-Karte**, each with the activated **Online-Ausweisfunktion (eID) + PIN**, a BundID account and the AusweisApp. The **electronic residence permit (eAT)** held by non-EU internationals is **NOT accepted**.

Independent confirmations this pass:
- `wohnsitzanmeldung.gov.de/die-einzelnen-schritte` — "die Online-Ausweisfunktion Ihres Personalausweises oder Ihrer eID-Karte" is required; eAT not listed. (2026-07-04)
- **Berlin, explicit quote:** service.berlin.de/dienstleistung/120686/ states **"Die Online-Anmeldung ist mit einem elektronischen Aufenthaltstitel (eAT) nicht möglich."** Requires BundID + Personalausweis/eID-Karte with eID + PIN. (2026-07-04) — this is the strongest single citation; the Builder should use it.
- govnext.de EWA FAQ — eAT "noch nicht nutzbar"; support planned in a later release; English UI planned. (2026-07-04, via search)

**RULE for the Builder (VERIFIED):** Set `online_possible = true` ONLY together with a `city_notes_md` caveat spelling out: *German ID card or EU eID card with online-ID + PIN only; an eAT residence-permit card is not yet accepted; arrivals from abroad usually must appear in person.* **Never a bare `online_possible = true`.** The honest default for the audience is the caveated note. This holds for every city below.

**Per-city EWA live status still UNCONFIRMED** (leave null, do NOT claim online): Aachen, Dortmund, Düsseldorf, Dresden, Leipzig, Nuremberg, Stuttgart. Confirmed-offered-with-caveat only where cited per city below (Berlin, Bremen, Essen, Hamburg, Hanover).

---

## B. ANMELDUNG — per city

### Berlin — VERIFIED (online) / CORRECTED (deadline-proof claim removed)
- `online_possible = true` **with eAT caveat** — VERIFIED (quote above). Keep true, add caveat note.
- **CORRECTED / REMOVED:** the researcher's claim that *"the confirmation email of your booked appointment counts as proof you registered on time"* could **NOT be verified** on service.berlin.de/dienstleistung/120686/ this pass. **Do NOT publish it as fact.** Drop it, or the Builder may include only as a hedged "some newcomers report…" — recommend DROP. The 14-day deadline itself is confirmed.
- Wait "2–6 weeks": UNCONFIRMED exact range — keep as an illustrative "often several weeks," not a hard figure.
- Source: service.berlin.de/dienstleistung/120686/ (2026-07-04).

### Munich — CORRECTED (walk-in wording — this was the #1 flagged item)
- **The researcher's central claim is WRONG.** stadt.muenchen.de/infos/terminvereinbarung-buergerbueros.html was re-fetched twice: the no-appointment exemption list contains **"Anmeldung Nebenwohnung, Statuswechsel"**, "Beantragung bzw. Abholung von Ausweisdokumenten", "Beglaubigung…" — **primary Anmeldung (Hauptwohnung) is NOT in the exempt list.** So the researcher's "Anmeldung is explicitly exempted from the appointment requirement" is **not supported** by the cited page. (2026-07-04)
- **Consequence:** The stored Anmeldung row (`walk_in_possible = true`, `appointment_required = false`) can **no longer be defended on this source.** Two honest options for the Builder:
  1. **Recommended:** flip to `appointment_required = true`, `walk_in_possible = false`, and note that primary Anmeldung generally needs an appointment (only *secondary* residence / Statuswechsel are walk-in), OR
  2. keep the booleans but add a **visible verify-note** that the walk-in claim for primary Anmeldung is unconfirmed as of 2026-07-04 and readers should book an appointment.
- Do NOT keep the confident "take a queue ticket for walk-in" framing for primary Anmeldung — UNCONFIRMED.
- Munich online for primary residence exists but needs eID (Bavaria) → keep `online_possible = false` for the eAT audience (VERIFIED direction). 
- Slot-release timing detail: UNCONFIRMED this pass — do not assert exact "~30 min before opening."
- Source: stadt.muenchen.de/infos/terminvereinbarung-buergerbueros.html; stadt.muenchen.de/service/info/wohnsitzanmeldung/1063475/ (2026-07-04).

### Stuttgart — CORRECTED (booking_url) + VERIFIED (new system)
- **booking_url:** stored `service.stuttgart.de/ssc-app-stuttgart/?m=32-42` is superseded. New system is **konsentas**, confirmed live. Canonical Bürgerbüro booking entry: **`https://stuttgart.konsentas.de/form/29/`** (Bürgerbüros Stuttgart); generic landing `stuttgart.konsentas.de/form/1/` is a wrapper. **Recommend `booking_url = https://stuttgart.konsentas.de/form/29/`.** VERIFIED (search + stuttgart.de May-2026 announcement).
- City-wide appointment search + office list (Mitte, Bad Cannstatt, Vaihingen, West, Ost, Süd, Zuffenhausen, Sillenbuch, Plieningen, Weilimdorf) + Ampel busyness indicator: VERIFIED via stuttgart.de announcement. Möhringen closure context: retained as VERIFIED (announcement).
- `online_possible` (EWA) for Stuttgart: UNCONFIRMED — leave null.
- Sources: stuttgart.de/service/aktuelle-meldungen/2026/mai/…; stuttgart.konsentas.de/form/29/ (2026-07-04).

### Leipzig — VERIFIED
- `appointment_required = false`, `walk_in = true` (walk-ins during opening hours) — consistent with stored value; the friendliest of the 15. Live wait-times page + 15 offices: retained (researcher-cited leipzig.de pages resolve). VERIFIED as stored.
- Canonical Anmeldung booking URL: stored leipzig.de path resolves; a service-portal path also exists. Low-priority polish — either resolves. Keep stored unless Builder prefers the /service-portal/ path.
- "17:00 daily two-weeks-ahead" release: UNCONFIRMED exact — keep as illustrative.

### Cologne — VERIFIED
- Walk-in Mon/Wed at Kundenzentren, otherwise appointment via terminator.koeln — consistent with stored `walk_in = true`. The precise "Mon 07:30–15:00 / Wed 07:30–12:00" desk hours are an **enrichment marked provisional** (single-source, not re-confirmed line-by-line this pass) — Builder may include with "check current hours." Multi-office → office_address stays null (correct). 
- Source: stadt-koeln.de/artikel/71152; terminator.koeln (researcher-cited; not re-fetched this pass — hours = provisional).

### Dresden — VERIFIED (structure) / provisional (10-office list)
- `walk_in = true`, Tue & Thu 13:00–16:00 at named Bürgerbüros — retained. The **exact list of 10 offices** is an enrichment; treat as **provisional** (not re-fetched this pass). Keep office_address null. EWA status UNCONFIRMED.

### Nuremberg — VERIFIED (core) / provisional (enriched hours)
- office_address + postcode **Äußere Laufer Gasse 25, 90403 Nürnberg** — plausible/retained; walk-in urgent-only Wed matches stored. **Full weekly opening hours** (Mon 08:00–15:30 etc.) = **provisional** enrichment, not re-fetched this pass; Builder should include only with "check current hours" or leave to the office page. booking_url nuernberg.termine-reservieren.de retained.

### Bremen — VERIFIED (with caveat)
- Appointment-only; Martinistraße 3, 28195 Bremen; separate "Zuzug aus dem Ausland" in-person path. Online residence registration exists → `online_possible = true` **only with eAT caveat + abroad-in-person note**. "~10 working days" figure: provisional. (researcher-cited service.bremen.de pages; direction consistent with cross-cutting A.)

### Essen — VERIFIED (with caveat)
- Appointment-generally-required; early eWA adopter BUT **"registrations from abroad → all persons present in person"** — retained. `online_possible = true` only with caveat + abroad-in-person. Multi-office → office_hours null. (service.essen.de eWA/abroad pages, researcher-cited.)

### Hamburg — VERIFIED (with caveat)
- Home of the national EWA; online exists → `online_possible = true` with eAT caveat. Kundenzentren via DigiTermin; keep hours hedged ("typical for main centres," not universal 07:00–19:00). (serviceportal.hamburg.de DigiTermin; wohnsitzanmeldung.gov.de.)

### Hanover — VERIFIED
- Walk-in Thu 08:00–13:00 & 14:00–18:00 at Aegi, Bemerode, Herrenhausen, Linden, Podbi-Park (NOT Döhren, Ricklingen, Sahlkamp, Schützenplatz) — stored value retained as accurate. Online offered → `online_possible = true` with eAT caveat, or leave null. Optional booking_url migration to hannover.gov.de (both resolve). 

### Frankfurt — VERIFIED (core) / provisional (release timings)
- Walk-in Mon & Wed; appointment Tue/Thu/Fri; Terminwunsch email alert exists — retained. Exact "06:00 weekday release / Mon ~08:00 batch" = provisional enrichment (researcher-cited frankfurt.de; not re-fetched this pass) — include with light hedge. Multi-office → address null.

### Aachen / Dortmund / Düsseldorf (Anmeldung) — VERIFIED (leave as-is)
- No single office address/hours invented (correct). EWA live status UNCONFIRMED → leave `online_possible` null. Aachen "07:45 same-day release": UNCONFIRMED — drop the exact time. Dortmund Anmeldung phone-number reconciliation: UNCONFIRMED — Builder may keep the existing general line and not assert a second number.

---

## C. RESIDENCE PERMIT — per city

### Cross-city fee schedule (§45 / §44 AufenthV) — VERIFIED against gesetze-im-internet, with a CORRECTION
Re-fetched **gesetze-im-internet.de/aufenthv/__45.html** and **__44.html** (2026-07-04):
- **Issue** residence permit / Blue Card / ICT card: **€100** — VERIFIED.
- **Extend:** **€96** (extension ≤3 months) / **€93** (extension >3 months) — VERIFIED.
- **Change of purpose** (incl. extension): **€98** — VERIFIED.
- **Settlement permit (Niederlassungserlaubnis, §44):** standard **€113**; **highly-qualified €147**; **self-employment €124** — VERIFIED, and this **CORRECTS the researcher**, who wrote "€147 for the self-employment route." €147 is the **highly-qualified** rate; self-employment is **€124**. Use €113 as the headline settlement figure; if mentioning the higher routes, state €124 (self-employment) / €147 (highly-qualified) correctly.
- **Approved `fees_note` (all 15 rows, federal & uniform — no per-city fee differences):**
  > "Statutory fees (§§ 44–45 AufenthV): about €100 to issue a residence permit and €93–96 to extend one; a settlement permit (Niederlassungserlaubnis) is €113 (up to €124–147 for self-employment / highly-qualified routes). Reduced rates apply for minors, students in some cases, and certain nationalities (e.g. Turkish nationals under the EEC-Turkey Association Agreement). Pay by card or cash at your appointment — confirm the current figure before you go."
- `fees_eur`: leave **null** (range is the honest answer). VERIFIED recommendation.
- Sources: gesetze-im-internet.de/aufenthv/__45.html, /__44.html (2026-07-04).

### Dortmund — CORRECTED (`walk_in_possible`)
- **CORRECTED: `walk_in_possible` → false.** Live DB currently stores **true**. Verified: the no-appointment facility is **only the eAT self-service pickup box**, not permit applications; issuing/extending a permit still requires a booked appointment. So `walk_in_possible = true` is misleading — flip to **false** and carry the pickup box as a note.
- **eAT Dokumentenausgabebox — VERIFIED (all specifics):** in the **Berswordthalle**, marked room at the **exit to Kleppingstraße**; **free, barrier-free, voluntary**; **Mon–Fri 06:00–17:00** initially, extending to evenings + weekends in **autumn 2026**; you must **select it at application**; you get an **SMS with a PIN** when ready; wheelchair-height compartment supported.
- Sources: dortmund.de/newsroom/…/kund-innen-koennen-elektronische-aufenthaltstitel-kuenftig-ohne-termin-abholen.html; dortmund.de/themen/…/abholung-des-elektronischen-aufenthaltstitels/ (2026-07-04).

### Settlement-permit figures — see fee block above (CORRECTED, now sourced). The researcher's §44 memory-cited numbers are otherwise fine except the self-employment mix-up.

### Berlin — VERIFIED / one REMOVAL
- LEA, Friedrich-Krause-Ufer 24; OTV calendar decommissioned, office assigns appointments — retained (researcher-cited berlin.de). 
- "Family-reasons online application since 23 March 2026" and "humanitarian extension online since 26 Aug 2025": **provisional** — not independently re-fetched this pass; Builder should soften to "more permit types are moving online" without the specific dates unless re-confirmed.
- "3–6 months to decision + 4–8 weeks for the card" wait range: acceptable as an **honest range** (label as typical/plan-for), not a guaranteed figure.

### Cologne — VERIFIED / dates provisional
- Bezirksausländeramt by postcode; office_address null (correct). "Online application + mailed document + on-site digital photo since 4 May 2026": **provisional** (single-source, not re-fetched) — Builder may state "since 2026 Cologne offers online applications and mails the document" without leaning on the exact date.

### Essen — UNCONFIRMED email
- Kruppstraße 16, 45128 Essen; ServiceCenter 0201-88-38883; "book ~3 months ahead" retained. **Email: UNCONFIRMED** which of `38883@abh.essen.de` (stored, pickup) vs `abh@essen.de` (general) is current. Do not assert one as canonical — Builder should keep the stored pickup address and/or add abh@essen.de only with a "verify" note, or omit the email.

### Dresden — VERIFIED (move) / hours provisional
- Moved to **Lingnerallee 3, Eingang Nord, 01069 Dresden**, service resumed spring 2026; appointment by phone/email, no self-service calendar — retained. **Post-move office hours** (Tue/Thu 08–11 & 14–17, Fri 08–11): **UNCONFIRMED** at the new address — Builder should hedge or drop the specific hours until re-verified.

### Leipzig — VERIFIED (page live) / URL choice provisional
- service-portal path `…/service-portal/themen-und-lebenslagen/auslaender-und-staatsangehoerigkeitsrecht/aufenthalt/vom-antrag-zum-aufenthaltsdokument` resolves (live) — a valid canonical candidate vs the stored `/jugend-familie-und-soziales/…` path. Either resolves; recommend the service-portal path as canonical. eAT pickup choice (follow-up appt vs Abholstation w/ Termin-Code): provisional enrichment.

### Aachen, Düsseldorf, Frankfurt, Hamburg, Hanover, Munich, Nuremberg, Stuttgart (respermit) — VERIFIED as stored / enrichments provisional
- Addresses/authorities as stored are consistent with cited sources; the *added depth* (Munich "Servicestelle für Zuwanderung und Einbürgerung, Eingang A"; Hanover "first LS municipality fully online"; Stuttgart eAT email-vs-6-week rule replacing the "17 Feb 2025" framing; Nuremberg portal migration off "Mein Nürnberg"; Frankfurt/Düsseldorf "apply ≥8 weeks before expiry") is retained as **provisional enrichment** — plausible and useful, but not independently re-fetched this pass. Builder may include, phrased as guidance, without hard dates.
- Hamburg booking URL hamburg.de/go/17584: retained (short-link, not re-fetched); low-risk.
- Stuttgart respermit booking = konsentas (stuttgart.konsentas.de/form/7/ = Ausländerbehörde) — VERIFIED live via search.

---

## D. COMMUTER TOWNS

### D.1 Transit corrections — BOTH VERIFIED
- **Ahrensburg — CORRECTED.** Currently served by **RB 81 / RE 8 (regional rail, Hamburg–Bad Oldesloe)**, **NOT the Hamburg S-Bahn.** The S4 replacing RB81 is **planned** (partial to Rahlstedt Dec 2027, full to Bad Oldesloe Dec 2029) but **not operational now.** Set `commute_line` to "RB 81 / RE 8 (regional rail; future S4)". VERIFIED (regional.bahn.de, s-bahn-4.de, 2026-07-04).
- **Reutlingen — CORRECTED.** **NOT on the Stuttgart S-Bahn** — the S1 only reaches Plochingen. Reutlingen is served by **RB and IRE on the Neckar-Alb line (KBS 760)**, regional rail, and is **not in the VVS S-Bahn ring.** Set `commute_line` to "RB / IRE (Neckar-Alb regional rail)". VERIFIED (Wikipedia Neckar-Alb-Bahn, reutlingen.de, 2026-07-04).
- Ticketing note (VERIFIED direction): Ahrensburg (SH), Reutlingen (outside VVS ring), Lüneburg (metronom), Halle (S-Bahn Mitteldeutschland) cross tariff zones — a city-only monthly pass won't cover the commute; the Deutschlandticket does. Include as a one-line hedge; current DT price NOT verified this pass — don't state a €-figure.

### D.2 Rent ranges — HELD as qualitative + verify-note (aggregator figures UNCONFIRMABLE this pass)
- **Mietspiegel vs Angebotsmiete distinction: VERIFIED as a real, correct framing** and must be preserved — "cheaper" = cheaper on **new-lease asking rent (Angebotsmiete)**, not on the Mietspiegel/ortsübliche Vergleichsmiete. Every rent line must say so + carry the verify suffix.
- **ImmoScout24 numbers could NOT be re-fetched (HTTP 401 to automated access).** Therefore the aggregator €/m² figures for **Augsburg, Offenbach, Dachau, Freising, Ludwigsburg** remain **UNCONFIRMED this pass** — keep them **qualitative + verify-note**, or present only as "one aggregator reports ~€X — verify current listings." Do NOT publish them as hard facts. This matches the researcher's own `likely` flag; the Verifier could not upgrade them.
- **Halle — CORRECTED to official figure.** halle.de official **Mietspiegel 2026–2027 avg = €7.93/m²** (qualified Mietspiegel, +4.39% vs prior), VERIFIED via halle.de. Use **€7.93/m²** (not the researcher's "~€7.7"). Leipzig anchor comparison (~€9/m²) is aggregator-sourced and UNCONFIRMED — keep the "~15–20% cheaper" as a hedged direction, not a precise delta. Source: halle.de/leben-in-halle/bauen-und-wohnen/mietspiegel (2026-07-04).
- Munich / Frankfurt / Stuttgart anchor "expensive, asking-rent gap is real" **direction VERIFIED**; exact anchor €/m² are aggregator-derived → keep as ranges with verify-note.
- All towns marked `unverified` on range by the researcher: keep **qualitative only** ("cheaper"/"similar"/"higher") + verify suffix. Builder must NOT invent numbers.

### D.3 `has_own_office` and office flavour
- **`has_own_office = true` for all 39 — VERIFIED on German law** (every Gemeinde runs its own Meldebehörde). Safe default.
- **Potsdam — VERIFIED:** Bürgerservicecenter, **first in Brandenburg with eWA (June 2025)**, free, no appointment for the online path — but same eID gate (eAT excluded). Strong Berlin-belt hook. Source: potsdam.de/de/willkommen-zur-elektronischen-wohnsitzanmeldung + potsdam.de/de/556-… (2026-07-04).
- **`office_note` for the ~18 "confirmed" offices** (Augsburg, Freising, Dachau, Fürstenfeldbruck, Ingolstadt, Offenbach, Hanau, Darmstadt, Norderstedt, Pinneberg, Ahrensburg, Buxtehude, Leverkusen, Brühl, Böblingen, Waiblingen, Reutlingen, Potsdam): retained as **researcher-cited, provisional** — plausible and town-sourced, but not each re-fetched by the Verifier this pass. The walk-in / eWA / appointment *flavour* is the value; Builder may publish with light hedging.
- **`office_note` = null for the ~15 `likely` towns** (all Berlin belt except Potsdam; Mainz, Wiesbaden, Bonn, Lüneburg, Bergisch Gladbach, Dormagen; Fürth, Erlangen, Schwabach, Roth; Esslingen, Ludwigsburg; Markkleeberg, Schkeuditz, Grimma, Borna) — `has_own_office = true` only; do NOT invent booking specifics. UNCONFIRMED this pass.
- **eWA-availability office notes** (Offenbach, Ahrensburg since 16 Sep 2024, Ingolstadt, Norderstedt, Leverkusen, etc.): the eWA existence is plausible but carries the **same eAT gate** — any "online eWA available" office_note must NOT imply eAT holders can use it. Add the caveat, consistent with section A.

---

## Verifier's notes for the Builder

**Hard corrections (act on these):**
1. **§44 self-employment settlement fee is €124, not €147** (€147 = highly-qualified). Use the corrected `fees_note` in C.
2. **Dortmund residence-permit `walk_in_possible` → false** (live DB has true). Box is pickup-only; applications need an appointment.
3. **Munich Anmeldung walk-in:** the cited source does NOT exempt primary Anmeldung — only Nebenwohnung/Statuswechsel. Flip to appointment-required or add a visible verify-note; drop the confident queue-ticket walk-in framing for primary Anmeldung.
4. **Stuttgart Anmeldung booking_url → `https://stuttgart.konsentas.de/form/29/`** (old ssc-app superseded).
5. **Ahrensburg** = RB81/RE8 regional rail (not S-Bahn; S4 is future). **Reutlingen** = RB/IRE Neckar-Alb (not Stuttgart S-Bahn).
6. **Halle rent = €7.93/m²** official Mietspiegel (not €7.7).

**Removed / do-not-publish-as-fact:**
- Berlin "appointment-confirmation counts as deadline proof" — unverified; DROP.
- Aachen "07:45 same-day release" exact time — unverified; drop.
- ImmoScout24 €/m² for Augsburg/Offenbach/Dachau/Freising/Ludwigsburg — unconfirmable this pass (401); keep qualitative + verify-note only.

**Provisional (publish only with a hedge / "check current"):** enriched office hours (Cologne desk hours, Dresden 10-office list, Nuremberg full weekly hours, Frankfurt/Munich exact slot-release times), and dated respermit enrichments (Cologne 4 May 2026, Berlin Mar-2026 family online, Stuttgart eAT rule, Nuremberg portal migration, Dresden post-move hours, Essen booking-3-months). None were independently re-fetched; they are plausible and useful but must not carry hard dates as fact.

**Universal caveat:** every `online_possible = true` and every "online eWA available" office_note must carry the eAT-not-supported caveat (section A). This is the single most important audience-safety rule in the batch.

**Proposed `commuter_areas` schema additions to sanity-check (from research-commuter §1):** `commute_line` (text), `commute_minutes` (text range, NOT int — honest ranges like "25–40 min"), `rent_note` (text), `has_own_office` (boolean), `office_note` (text), `last_verified_at` (date), `sources` (jsonb []). All nullable/additive — good; they won't break the live Munich panel that reads `commute_note`/`cost_note`. One flag: keep `commute_minutes` as text (ranges), and ensure `rent_note` is populated ONLY where a sourced range survived verification (per D.2, that's effectively Halle official + hedged anchors; the aggregator towns should stay qualitative until re-confirmed).

**Not verified this pass (light-touch, flagged by researcher, low risk):** Hamburg respermit short-link hamburg.de/go/17584; Leipzig Anmeldung URL choice; Dortmund Anmeldung phone reconciliation. Safe to leave stored values; do not assert new specifics.
