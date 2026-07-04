# Research packet — Residence-permit / Ausländerbehörde city-variant depth (existing 15 cities)

**Agent:** Researcher (step ①) · **Topic:** Menu option 3 — residence-permit city variants, existing-cities focus
**Access date for all web facts below:** 2026-07-04 (unless a source line says otherwise)
**Target table:** `city_task_variants` (task = `residence-permit`), one row per city — all 15 rows already exist and were last verified 2026-07-02/03.
**Scope note:** This is a *deepen + re-verify* pass, not a from-scratch build. The existing rows are already good. Below, per city, I mark each fact `confirmed / likely / unverified`, map it to a column, and flag **NEW** where it adds depth beyond what's stored or **RECHECK** where the stored value may need a small correction.

---

## 0. How this maps to columns (reminder)

| Column | What goes there |
|---|---|
| `appointment_required` / `walk_in_possible` / `online_possible` | booleans |
| `booking_url` | the single best official booking/info URL |
| `office_name` | authority name |
| `office_address` | ONLY where a single accurate address exists; multi-office cities stay **null** |
| `office_hours` | ONLY where a single accurate value exists |
| `typical_wait_time` | honest range / process reality (text) |
| `fees_eur` / `fees_note` | numeric + note |
| `city_notes_md` | the narrative paragraph newcomers read |
| `sources` | jsonb array of {url, title, accessed_at} |

---

## 1. Cross-city fact: official fee schedule (applies to ALL 15 `fees_note`)

The stored `fees_note` on every row is the vague "**Roughly €50–140 depending on permit type and duration**." This can be tightened to the actual statutory figures, which are **federal and uniform** (so identical text on every city row; do **not** invent per-city fee differences).

Under **§ 45 AufenthV** (Aufenthaltsverordnung):
- **Issuing** a residence permit (Aufenthaltserlaubnis) / Blue Card EU / ICT card: **€100**.
- **Extending** it: **€96** (extension up to 3 months) or **€93** (extension over 3 months).
- Change-of-purpose incl. extension: **€98** (per Bundestag research note / dejure).
- Settlement permit (Niederlassungserlaubnis, § 44 AufenthV): typically **€113**, or **€147** for the self-employment route (not re-fetched this pass — mark `likely`).
- Reductions/exemptions exist for minors, students in some cases, hardship, and certain nationalities (e.g. Turkish nationals under the Association Agreement pay reduced fees).

**Draft `fees_note` (all 15 rows):**
> "Statutory fees (§ 45 AufenthV): about €100 to issue a residence permit and €93–96 to extend one; a settlement permit (Niederlassungserlaubnis) is higher (around €113+). Reduced rates apply for minors, students in some cases, and certain nationalities. Pay by card or cash at your appointment — check the current figure before you go."

- Confidence: **confirmed** for €100 / €96 / €93 (official gesetze-im-internet). **likely** for €113/€147 settlement figures (not re-fetched now — Verifier should confirm from § 44 AufenthV).
- `fees_eur`: leave **null** (no single number; the range is the honest answer). Alternatively store `100` as the headline "issue" fee — recommend leaving null.
- Sources:
  - https://www.gesetze-im-internet.de/aufenthv/__45.html — "§ 45 AufenthV — Einzelnorm" — 2026-07-04
  - https://dejure.org/gesetze/AufenthV/45.html — "§ 45 AufenthV — Gebühren" — 2026-07-04
  - https://www.bundestag.de/resource/blob/651534/.../WD-3-113-19-pdf-data.pdf — "Kurzinformation — Kosten für Aufenthaltstitel in Deutschland" — 2026-07-04

---

## 2. Per-city findings

### Aachen — `office_name`: Ausländeramt StädteRegion Aachen · **verified, minor confirmations**
- **Authority (confirmed):** Handled by the **StädteRegion Aachen** (regional authority, dept. A 33), NOT the city of Aachen — a genuine city-specific quirk (Anmeldung is city-run; residence permits are region-run). Stored `city_notes_md` is accurate.
- **Main address (confirmed):** Hackländerstr. 1, 52064 Aachen.
- **Pickup branch (confirmed, RECHECK-cleared):** eAT pickup is at the **Außenstelle Aachen Arkaden, Trierer Straße 1, 52078 Aachen** — search confirms "1st floor" for the Infostelle, "ground floor" for pickup, **by prior appointment only**. Contact for the Arkaden branch: +49 241 5198-83306, abh@staedteregion-aachen.de. Stored address string is accurate.
- **Hours (confirmed):** The stored hours (Mon/Tue 08–15, Wed 08–16:45, Thu 08–13, Fri 08–12) match the Aachen Arkaden Infostelle opening hours.
- **NEW (likely):** ABH closed **Thu 11 June 2026** for internal training (one-off; not worth storing, but shows the office posts closures — no change needed).
- **Booking (confirmed):** `booking_url` https://termine.staedteregion-aachen.de/auslaenderamt/ still valid; appointments for permit issue/extend booked via the "Ausländer- und Staatsangehörigkeitsbehörde / Infostelle" category.
- Sources: https://www.staedteregion-aachen.de/15038 (Infostelle Aachen Arkaden); https://bportal.staedteregion-aachen.de/detail/-/vr-bis-detail/einrichtung/1710860/show (Außenstelle Aachen Arkaden); https://termine.staedteregion-aachen.de/auslaenderamt/ — all 2026-07-04.
- **Verdict:** No change needed. Row is accurate.

### Berlin — `office_name`: Landesamt für Einwanderung (LEA) · **verified + NEW depth**
- **Authority / booking (confirmed):** LEA at Friedrich-Krause-Ufer 24, 13353 Berlin. The old **OTV public appointment calendar is permanently decommissioned** (killed because bots resold slots). Now: submit an online application or the LEA contact form; **the office assigns the appointment itself** after checking documents. Stored `city_notes_md` is accurate.
- **NEW (confirmed):** Online application for **residence permit for family reasons** available since **23 March 2026**; humanitarian-grounds extension online since 26 Aug 2025. LEA is progressively digitising more services. → Worth folding a line into `city_notes_md`: "More permit types are moving to online-only application; family-reasons permits can be applied for online as of March 2026."
- **NEW / `typical_wait_time` (confirmed, honest range):** Plan for **3–6 months from filing to decision, plus 4–8 weeks for the eAT card to be produced**. This is more concrete and honest than the stored "aim for an appointment 4–6 weeks before expiry" and should be merged in. Draft: *"Plan for several months: roughly 3–6 months from application to decision, plus about 4–8 weeks for the physical eAT card. Renewals can be requested up to 8 weeks before expiry — apply as early as you can."*
- Sources: https://www.berlin.de/einwanderung/en/services/appointments/ ; https://www.berlin.de/einwanderung/en/services/our-services/artikel.878424.en.php ; https://www.thelocal.de/20240814/what-to-know-about-the-new-appointments-system-at-berlin-immigration-office — all 2026-07-04.

### Bremen — `office_name`: Migrationsamt Bremen · **verified + NEW depth**
- **Authority/address (confirmed):** Migrationsamt, Stresemannstr. 48, 28207 Bremen. office@migrationsamt.bremen.de.
- **Booking (confirmed):** Appointment-only; no walk-ins. If you already hold a Bremen permit, a **renewal appointment is mailed to you automatically before expiry**. Stored note accurate.
- **NEW (confirmed) — process reality worth adding:** Before your permit expires you get a **letter listing the documents to submit by a deadline**; the **decision is made at the appointment** if documents are complete; the finished permit is then **sent to you by post via registered mail (Einschreiben)** — i.e. Bremen does *not* use a self-service pickup box; the card comes by mail. This is a genuine city-specific difference vs. Dortmund/Leipzig pickup boxes.
- **NEW (likely) — access note:** Due to Steubenstraße construction / rail underpass closure, Stresemannstr. is **not directly reachable from the Julius-Brecht-Allee stop (tram line 1) until summer 2028** — a real practical detail for visitors. Optional to store.
- Sources: https://www.service.bremen.de/dienstleistungen/aufenthaltserlaubnis-verlaengern-9926 ; https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/migrationsamt-100086 ; https://www.service.bremen.de/dienstleistungen/eat-elektronischer-aufenthaltstitel-11028 — all 2026-07-04.

### Cologne — `office_name`: Bezirksausländeramt (district office) · **verified + significant NEW depth**
- **Authority (confirmed):** Split into **Bezirksausländerämter** (district offices) by postcode. `office_address` correctly **null** (multi-office). Innenstadt office = Ludwigstraße 8 (one of several).
- **Booking (confirmed):** Online self-booking now available; entering your **postcode routes you to the correct district office's booking page**. Personal visits need both a booked appointment and an invitation letter.
- **NEW (confirmed) — big one:** Since **4 May 2026**, Cologne offers **online residence-permit applications**, with **direct postal delivery of the electronic residence document** and **digital passport photos taken on-site**. This is newer than the stored "since April 2026 you book online by postcode" line and should be added. Draft addition: *"Since May 2026 you can also apply for many residence permits online, have the finished document mailed to you, and get a digital passport photo taken at the office."*
- **RECHECK (minor):** Stored note says "since April 2026 you book online by postcode" — the online *booking* went live ~April 2026; the online *application + mailed document* went live 4 May 2026. Keep both, dated distinctly.
- Sources: https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/74526/index.html ; https://www.stadt-koeln.de/service/adressen/00105/index.html (Innenstadt) — all 2026-07-04.

### Dortmund — `office_name`: Ausländerbehörde Dortmund · **verified + NEW eAT-box depth**
- **Authority/address (confirmed):** Altes Stadthaus, Olpe 1, 44122 Dortmund. Booking via https://termine.dortmund.de/32/select2?md=1.
- **NEW (confirmed) — the flagship detail, now with specifics:** eAT self-service pickup box ("Dokumentenausgabebox") in the **Berswordthalle**, in a marked room at the **exit to Kleppingstraße**. Details: **free, barrier-free, voluntary**; open **Mon–Fri continuously 06:00–17:00** initially, **extending to evenings + weekends in autumn 2026**; you get an **SMS with a PIN** when the card is ready; box holds up to 15,000 documents/yr; wheelchair-height compartment selection supported. Issuing/extending a permit still needs a booked appointment. Stored note is right but can gain the hours (06–17 Mon–Fri) and SMS-PIN detail.
- `walk_in_possible` is stored **true** for Dortmund — that appears to reflect the no-appointment eAT *pickup*, not permit issuance. Recommend the Verifier double-check whether general walk-in for applications is truly possible; safer as **false** with the pickup-box exception carried in the note. Flag: **RECHECK**.
- Sources: https://www.dortmund.de/themen/aufenthalt-einbuergerung-und-auslaenderwesen/abholung-des-elektronischen-aufenthaltstitels/ ; https://www.wirindortmund.de/dortmund/kundinnen-koennen-elektronische-aufenthaltstitel-kuenftig-ohne-termin-abholen-244597 ; https://www.kommune21.de/k21-meldungen/eat-ohne-termin-abholen/ — all 2026-07-04.

### Dresden — `office_name`: Ausländerbehörde Dresden · **verified + move now settled**
- **Move (confirmed):** Office **moved to Lingnerallee 3, Entrance North, 01069 Dresden**. Precise timeline: main dept moved 13–30 April 2026; **regular service at the new address resumed Tue 5 May 2026** (asylum matters 11 May). So as of the current date (July 2026) the move is fully complete — the stored "moved in April 2026" is accurate; can be firmed to "moved to Lingnerallee 3 in spring 2026."
- **Booking (confirmed):** Appointment-only, arranged **by phone (0351-4886009) or email (auslaenderbehoerde@dresden.de)** — **no public self-service calendar**. Stored note accurate.
- **Hours (confirmed):** stored "Tue & Thu 08–11 & 14–17, Fri 08–11" — treat as **likely**; not re-verified line-by-line this pass. Verifier should confirm the post-move hours on dresden.de.
- Sources: https://www.dresden.de/de/rathaus/aktuelles/pressemitteilungen/2026/04/pm_011.php ; https://www.dresden.de/de/rathaus/dienstleistungen/auslaenderangelegenheiten-terminabsprachen.php — all 2026-07-04.

### Düsseldorf — `office_name`: Kommunale Ausländerbehörde Düsseldorf · **verified + address refinement**
- **Authority/booking (confirmed):** Erkrather Straße **377–389** (stored "377" is the short form — consider "377–389"), 40231 Düsseldorf. Tel 0211 89-21020. Applications **online-only** (no email/phone applications). For issue/extend you need an in-person appointment, which the office **notifies you of in writing ~6–8 weeks before your permit expires**. Stored note accurate.
- **NEW (likely):** For many services the office now also offers online self-booking of the appointment — worth a light mention, but the "mailed appointment before expiry" remains the primary path. Confidence **likely**.
- Sources: https://www.duesseldorf.de/auslaenderamt ; https://service.duesseldorf.de/suche/-/egov-bis-detail/dienstleistung/5610/show — both 2026-07-04.

### Essen — `office_name`: ABH Essen · **verified + RECHECK on email**
- **Authority/address (confirmed):** Staatsangehörigkeits- und Ausländerangelegenheiten (ABH), Kruppstraße 16, 45128 Essen.
- **Booking (confirmed):** By phone via the **ServiceCenter on 0201-88-38883**, hours **Mon/Tue/Thu 07:30–15:00, Wed/Fri 07:30–12:00**. Stored hours match. **NEW (confirmed):** the office **recommends booking about 3 months in advance** — honest, useful `typical_wait_time` detail to add.
- **RECHECK (email):** Stored note gives eAT-pickup email as `38883@abh.essen.de`; the current official general email is **abh@essen.de** (search result). The `38883@…` address may still be valid for pickup specifically, but the Verifier should confirm and likely switch/添加 `abh@essen.de`.
- **eAT (confirmed):** After application, Bundesdruckerei produces the eAT and you **get a pickup appointment at your visit** (no self-service box — unlike Dortmund).
- Sources: https://www.essen.de/abh ; https://www.essen.de/leben/migration_und_integration/staatsangehoerigkeits__und_auslaenderangelegenheiten/terminvereinbarung.de.html ; https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/42388/show (eAT) — all 2026-07-04.

### Frankfurt am Main — `office_name`: Ausländerbehörde Frankfurt (FIO) · **verified**
- **Authority/address (confirmed):** Kleyerstraße 86, 60326 Frankfurt (2nd entrance Rebstöcker Str. 4). Phone +49 69 212-42485. Email auslaenderbehoerde@stadt-frankfurt.de.
- **Booking (confirmed):** No simple public calendar — you **file the application online first (FIO portal, frankfurt.de/fio/antrag) and the office then assigns you an appointment**. Stored note accurate.
- **NEW (confirmed):** Official guidance: **submit an extension application at least 8 weeks before expiry**; a **Fiktionsbescheinigung** protects your stay while the decision is pending — good hook to link the existing `fiktionsbescheinigung` guide. Add "apply at least 8 weeks before expiry" to `typical_wait_time`.
- Sources: https://frankfurt.de/auslaenderangelegenheiten ; https://frankfurt.de/-/media/frankfurtde/.../faq-deutsch.ashx — both 2026-07-04.

### Hamburg — `office_name`: Ausländerbehörde Hamburg · **verified (light pass)**
- **Authority/address (confirmed prior):** Hammer Str. 30–34, 22041 Hamburg; booking via https://www.hamburg.de/go/17584. Appointment-only; if no timely slot, submit the application **in writing** to preserve legal stay; urgent cases can call for an earlier slot. Stored note accurate.
- **Note:** Not deeply re-verified this pass (no new material surfaced). Confidence on stored content: **likely→confirmed** based on prior 2026-07-02 verification. Verifier: light re-check of the booking URL only.
- Sources (prior): https://www.hamburg.de/go/17584 ; https://www.hamburg.de/auslaenderbehoerde/ — 2026-07-02.

### Hanover — `office_name`: HannoverServiceCenter (HSC) · **verified + NEW depth**
- **Two-authority split (confirmed):** Genuine city-specific quirk. **City residents → HannoverServiceCenter (HSC), Am Schützenplatz 1, 30169 Hannover.** Residents elsewhere in the wider Region → **Ausländerbehörde der Region Hannover, Team Zuwanderung, Maschstraße 17, 30169 Hannover.** Stored note accurate.
- **NEW (confirmed) — strengthen the online angle:** The **Region Hannover is the first municipality in Lower Saxony to offer fully online residence-permit applications** — for most applications **no personal visit is required**. This is a real differentiator; strengthen the stored "many applications can be submitted directly online" to reflect "the majority — often with no office visit at all."
- **NEW (confirmed) — skilled-worker route:** Lower Saxony runs a central **beschleunigtes Fachkräfteverfahren** (accelerated skilled-worker procedure); since **1 Jan 2026 applications for that route are mandatory** via the state portal https://beschleunigtes-fachkraefteverfahren.niedersachsen.de. Relevant for work-permit newcomers in Hanover — worth one sentence.
- Sources: https://region-hannover.gov.de/portal/seiten/online-antraege-der-auslaenderbehoerde-der-region-hannover-900000076-20001.html ; https://www.hannover.de/Leben-in-der-Region-Hannover/.../Ausländerbehörde-der-Region-Hannover ; https://www.sehnde-news.de/region_hannover/aufenthaltstitel-in-der-region-hannover-jetzt-online-beantragen/ — all 2026-07-04.

### Leipzig — `office_name`: Ausländerbehörde Leipzig · **verified + NEW depth + URL update**
- **Authority/address (confirmed):** Technisches Rathaus, Haus B, Eingang Prager Straße 128, Leipzig.
- **Process (confirmed):** After the application is processed, the office **automatically mails you an appointment** (no public calendar). Stored note accurate.
- **NEW (confirmed) — eAT pickup refinement:** At your biometrics appointment you can **choose** between collecting the finished card at a **follow-up appointment** OR **flexibly via a pickup station (Abholstation)**. For the pickup station you use a **Termin-Code** (issued at the biometrics visit; if lost/invalid, request a new one via the contact form). This is slightly more precise than the stored "you get a code by post to self-book a pickup slot" — refine to reflect the choice at the biometrics appointment.
- **RECHECK (booking_url):** Stored `booking_url` points to `.../auslaender-und-migranten/.../vom-antrag-zum-aufenthaltsdokument`. The city has a newer **service-portal** path: https://www.leipzig.de/service-portal/themen-und-lebenslagen/auslaender-und-staatsangehoerigkeitsrecht/aufenthalt/vom-antrag-zum-aufenthaltsdokument — Verifier should pick whichever currently resolves (both appear live; the service-portal one looks canonical).
- Sources: https://www.leipzig.de/service-portal/themen-und-lebenslagen/auslaender-und-staatsangehoerigkeitsrecht/aufenthalt/vom-antrag-zum-aufenthaltsdokument ; https://www.leipzig.de/service-portal/aemtertermine-online — both 2026-07-04.

### Munich — `office_name`: Ausländerbehörde München (KVR) · **verified + NEW rename/detail**
- **Authority (confirmed):** The **KVR (Kreisverwaltungsreferat)**, Ruppertstr. 19, 80337 München — same building as Bürgerbüro Anmeldung. Stored note accurate.
- **NEW (confirmed) — rename + entrance detail:** The immigration service is now presented as the **"Servicestelle für Zuwanderung und Einbürgerung,"** at **Ruppertstr. 19, Entrance A ("Eingang A"), Area 21, 2nd floor**. Worth adding "(Servicestelle für Zuwanderung und Einbürgerung, Eingang A, 2. Stock)" for wayfinding.
- **Booking (confirmed):** Appointment-only. **New slots release Mon–Fri, ~10 minutes before each opening (morning and midday)**; next-week slots appear distributed through the week. If nothing online, call the service line. Extensions can be submitted **online or by post**. Stored note + `typical_wait_time` accurate.
- **NEW (confirmed) — emergency path:** There's a **Notfall-Hilfe / Servicepoint** at Ruppertstr. 19 Eingang A for urgent expiring-permit cases (hours: Mon 07:30–12, Tue 08:30–12 & 14–18, Thu 08:30–15, Fri 07:30–12). Good practical add for the "emergency" sentence already in the note.
- Sources: https://stadt.muenchen.de/buergerservice/ausland-migration.html ; https://stadt.muenchen.de/service/info/servicestelle-fur-zuwanderung-und-einburgerung/10339026/ — both 2026-07-04.

### Nuremberg — `office_name`: Amt für Migration und Integration der Stadt Nürnberg · **verified + NEW depth**
- **Authority (confirmed):** Amt für Migration und Integration. `office_address` correctly **null** — the responsible office is assigned to you and the **address is given in your invitation letter** (multi-location routing). Stored note accurate.
- **Process (confirmed):** **Apply online first**; once documents are complete you're **invited by post to an appointment**; the letter names the office location responsible for you. Appointments run through the city portal.
- **NEW (confirmed) — portal migration:** Since **early 2025, most online services moved to a new system** and are **no longer processed via the "Mein Nürnberg" portal** (exception: letters of sponsorship / Verpflichtungserklärung). Worth a line so anyone with old bookmarks isn't misled. Also a specific eAT-reissue online service exists (Neuausstellung des eAT beantragen).
- Sources: https://www.nuernberg.de/internet/stadtportal/behoerdenwegweiser/dienstleistung/aufenthaltstitel.html ; https://www.nuernberg.de/internet/auslaenderbehoerde/ ; https://www.nuernberg.de/internet/stadtportal/behoerdenwegweiser/dienstleistung/elektronischer_aufenthaltstitel_eat.html — all 2026-07-04.

### Stuttgart — `office_name`: Ausländerbehörde Stuttgart · **verified + NEW precise eAT detail**
- **Authority/address (confirmed):** Eberhardstraße 39, 70173 Stuttgart. Visits only with a booked appointment confirmation. Booking via konsentas (stuttgart.konsentas.de).
- **NEW (confirmed) — eAT pickup, more precise than stored:** When the eAT arrives you book a pickup slot online. **If you gave an email address, you get an automatic notification when it arrives**; **if you did not, you can book a pickup slot no sooner than 6 weeks after applying.** Free slots show for the **next 5 weeks**. (Stored note's "17 Feb 2025 automatic email" trigger date is older framing — the current rule is simply email-notified vs. 6-week-wait; recommend replacing the specific 2025 date with this cleaner rule.) Flag: **RECHECK** the 17 Feb 2025 wording.
- **Emergency (confirmed):** If your permit/visa/Fiktionsbescheinigung has expired or ends within **7 days**, apply online for an **emergency appointment**; these are **allocated chronologically by expiry date** (earliest first). Stored note accurate.
- Sources: https://www.stuttgart.de/en/organigramm/leistungen/ausgabe-elektronischer-aufenthaltstitel-eat- ; https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/notfall-termin ; https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung — all 2026-07-04.

---

## 3. Summary of recommended DB edits (for the Verifier → step ②/③)

| City | Field | Change | Confidence |
|---|---|---|---|
| ALL 15 | `fees_note` | Replace vague "€50–140" with §45 AufenthV figures (€100 issue / €93–96 extend) draft in §1 | confirmed |
| Berlin | `city_notes_md` + `typical_wait_time` | Add "family-reasons online application since Mar 2026"; add honest "3–6 months + 4–8 wks card" range | confirmed |
| Bremen | `city_notes_md` | Add: decision made at appointment; **card mailed by registered post** (no pickup box) | confirmed |
| Cologne | `city_notes_md` | Add: since **4 May 2026** online application + mailed document + on-site digital photo | confirmed |
| Dortmund | `city_notes_md`; `walk_in_possible` | Add box hours (Mon–Fri 06–17, extending autumn 2026) + SMS-PIN; RECHECK walk_in=true | confirmed / recheck |
| Dresden | `city_notes_md` | Firm "moved to Lingnerallee 3 in spring 2026 (service resumed 5 May 2026)"; re-verify post-move hours | confirmed / hours likely |
| Düsseldorf | `office_address` | Optionally "Erkrather Straße 377–389" | confirmed |
| Essen | `city_notes_md`; email | Add "book ~3 months ahead"; RECHECK email `abh@essen.de` vs stored `38883@abh.essen.de` | confirmed / recheck |
| Frankfurt | `typical_wait_time` | Add "apply ≥8 weeks before expiry; Fiktionsbescheinigung covers the gap" | confirmed |
| Hanover | `city_notes_md` | Strengthen "first LS municipality with fully-online applications, often no visit"; add beschl. Fachkräfteverfahren (mandatory Jan 2026) | confirmed |
| Leipzig | `city_notes_md`; `booking_url` | Refine eAT choice (follow-up appt vs Abholstation w/ Termin-Code); RECHECK service-portal URL | confirmed / url recheck |
| Munich | `office_address`/`city_notes_md` | Add "Servicestelle für Zuwanderung und Einbürgerung, Eingang A, 2. Stock"; add Servicepoint emergency hours | confirmed |
| Nuremberg | `city_notes_md` | Add "portal migrated off 'Mein Nürnberg' since early 2025" | confirmed |
| Stuttgart | `city_notes_md` | Replace "17 Feb 2025" framing with email-notify-vs-6-week rule; slots show 5 weeks ahead | confirmed / recheck old date |

Set `last_verified_at = 2026-07-04` on any row the Verifier updates, and append the new source URLs to each `sources` array.

---

## 4. What I could NOT confirm (Verifier: focus here)

1. **Settlement-permit fees (€113/€147, § 44 AufenthV)** — cited from memory of the statute, not re-fetched this pass. Confirm exact figures before using them in `fees_note`.
2. **Dortmund `walk_in_possible`** — stored as `true`. I could not confirm true walk-in for permit *applications* (only the no-appointment eAT pickup box). Verify and likely flip to `false` with the box noted separately.
3. **Essen email** — `abh@essen.de` (general) vs stored `38883@abh.essen.de` (pickup). Confirm which to store for eAT pickup.
4. **Dresden post-move office hours** — the stored hours (Tue/Thu 08–11 & 14–17, Fri 08–11) predate the May 2026 move; re-verify on dresden.de they still hold at Lingnerallee 3.
5. **Leipzig `booking_url`** — two live paths (`/jugend-familie-und-soziales/...` and `/service-portal/...`). Pick the canonical one.
6. **Stuttgart "17 Feb 2025" trigger date** in the stored note — I found the current rule (email-notify else 6-week wait) but not confirmation that the specific 2025 date is still the governing cutoff; treat as stale framing.
7. **Hamburg** — only lightly re-checked this pass; no new material found. Verify booking URL https://www.hamburg.de/go/17584 still resolves.
8. **Per-city exact fee variations** — none exist (fees are federal). Do **not** let any city row imply a city-specific fee. Only the process/booking/eAT-pickup mechanics genuinely vary city-to-city; fees, and the underlying legal deadlines, are uniform.

---

## 5. Honesty / scope notes

- Residence-permit **is** one of the two genuinely city-varying tasks (with Anmeldung) — every difference above is a real administrative difference (which authority, booking mechanics, eAT pickup method, portal), not invented.
- All wait-time statements are **ranges** or process descriptions ("apply well before expiry", "3–6 months"), never a fabricated exact figure.
- No single address/hours were invented for multi-office cities: **Cologne** and **Nuremberg** correctly keep `office_address = null`.
- I wrote only this file. No DB writes, no source edits, no deploy.
