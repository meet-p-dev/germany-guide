# Verified packet — Cycle 2 (Verifier / step ②)

**Verifier pass date:** 2026-07-05
**Scope:** the 5 NEW research packets only —
`research-national-howto.md`, `research-tax-finanzamt.md`, `research-driving.md`,
`research-abh-trio.md`, `research-recognition.md`.
**Do NOT touch** `verified.md` (Round-15, already deployed). Builder writes to
`.claude/pipeline/deploy-report.md`, not here.

**Method:** every retained fact below was independently re-checked this pass — either a
direct WebFetch of a primary/official source, a fresh WebSearch cross-check, or a
read-only Supabase query (project `ilfhjffpzvzphbvhdpup`). I did NOT trust the
researchers' own confidence flags; I re-derived each verdict. Marks:
**VERIFIED** (re-confirmed), **CORRECTED** (changed — what+why), **REMOVED** (dropped — why).

**Honesty gate enforced:** the national/profession tasks (bank, blocked account,
health insurance, Rundfunkbeitrag, SCHUFA, tax how-to, recognition) get **NO
`city_task_variants`**. Only Finanzamt (Group B Part 2) and Führerscheinstelle
(Group C Part 2) get city office-identity rows, and the ABH trio **reuses**
residence-permit's 15 rows (do not duplicate).

---

## GROUP A — National how-to (bank, blocked account, health insurance, Rundfunkbeitrag, SCHUFA)

### A1. Bank account — `bank-account` (guide `1dabbca7-6ae5-486a-8000-83193569226d`)
- **VERIFIED** — Video-Ident onboarding, IBAN/SEPA explainer, fee-honesty hedge, and the
  "start before Anmeldung but a German address is usually needed for the physical card"
  nuance. Stable, well-documented banking facts; researcher already kept fees qualitative
  (correct — do not add a hard N26/Sparkasse monthly-fee number).
- **Provisional / verify-note:** keep fee wording qualitative ("varies by bank and account
  tier; digital-bank basic tiers are typically free"). No euro figure.
- Sources retained: n26.com blog, monito.com, verbraucherzentrale.de (existing). Access 2026-07-04.

### A2. Blocked account / Sperrkonto — `blocked-account` (guide `a6cc76a2-361c-44bc-93f5-dc74a138a12c`)
- **VERIFIED (primary):** official mechanics re-fetched at
  https://www.auswaertiges-amt.de/en/sperrkonto-388600 (accessed 2026-07-05):
  - beneficiary releases the block (the German mission before the visa; the competent
    Ausländerbehörde after arrival) but cannot withdraw the money;
  - account "usually opened for a year, unless your planned stay is shorter";
  - if the visa is refused/not used/you leave Schengen before a permit, the mission can
    lift the block — the rejection notice alone suffices.
  - **Confirmed the AA page states NO specific euro figure** — it defers to the mission /
    Consular Services Portal. Do NOT imply the AA officially states €992/month.
- **VERIFIED (secondary consensus, keep hedged):** student figure **€11,904/year ≈ €992/month
  for 2026**, tied to the BAföG maximum rate. Consistent across multiple 2026 sources incl. an
  official AA mission page (managua.diplo.de). **Keep it labelled "as of 2026, roughly €992/month
  for students — reviewed annually; confirm the current figure with your mission/provider."**
- **CORRECTED — downgrade the Chancenkarte/job-seeker €13,092 (€1,091/mo) figure:** could not
  re-confirm this specific job-seeker figure against a primary source this pass (only affiliate
  aggregation). Present as "job-seeker/Chancenkarte amounts are set separately and are higher —
  check the current figure with your mission" rather than the hard €1,091.
- **REMOVED — Fintiba/Expatrio exact fees and setup-time claims:** sourced only from SEO/affiliate
  blogs ("€49–89 setup", "1–3 business days"). Name the providers qualitatively ("compare current
  fees and setup speed on each provider's own site"); print no fee numbers.
- **REMOVED — Coracle "paused new applications":** single unconfirmed source.
- Sources retained: auswaertiges-amt.de/en/sperrkonto-388600 (primary, re-fetched 2026-07-05);
  secondary €11,904 corroboration (visatocampus, managua.diplo.de) — access 2026-07-05.

### A3. Health insurance — `health-insurance` (guide `dac52473-75af-4e07-b8d6-b8b558919208`)
- **VERIFIED (fresh cross-check):** 2026 **Versicherungspflichtgrenze / JAEG = €77,400/year
  (€6,450/month)**, up €3,600 from €73,800 in 2025. Confirmed across Haufe, Allianz, Check24,
  AOK, TK, DRV (accessed 2026-07-05). Line above which employees may opt into PKV.
  - **Note (optional precision):** a *besondere* JAEG of €69,750 (2026) exists for people PKV-insured
    and JAEG-exempt on 31 Dec 2002 — irrelevant to newcomers; publish the single €77,400 figure only.
- **VERIFIED:** AOK is a federation of ~11 independent regional insurers (state-level, own
  Zusatzbeitrag) — frame as **state-level, NOT a reason for city variants**. TK cited for
  English-language app/process. `legal_basis: SGB V` correct.
- **Provisional / verify-note:** illustrative **~€130/month student GKV contribution** — keep as a
  range ("roughly €120–140/month, revised annually"). Do not hardcode per-insurer Zusatzbeitrag
  differentials (they change yearly across all GKV insurers).
- Sources: myhealthcarebroker, allianz.de, check24.de, tk.de, gkv-spitzenverband.de (existing).
  Access 2026-07-05.

### A4. Rundfunkbeitrag — `rundfunkbeitrag` (guide `0b23bcca-811b-4479-9879-2607baebc31d`)
- **VERIFIED (primary re-fetch):** https://www.rundfunkbeitrag.de now **loads cleanly** and confirms
  **€18.36/month per household** ("für jede Wohnung … unabhängig davon, wie viele Personen … leben").
  The earlier 404/anti-bot wall was a deep-path issue; the homepage is safe to keep as the primary
  link. Accessed 2026-07-05.
- **VERIFIED:** quarterly default **€55.08 (3 × €18.36)**; per household not per person; liability
  from the 1st of the move-in month (bigger first bill); Beitragsservice letter is genuine.
  `legal_basis: RBStV` correct.
- **VERIFIED (fresh cross-check):** the **BAföG exemption rule effective October 2025** — BAföG
  recipients (and Ausbildungsgeld apprentices) not living with their parents are **fully exempt by
  statute**; exemptions must be **applied for with proof** at rundfunkbeitrag.de and can be
  **backdated up to 3 years**. Full-exemption categories (Bürgergeld/ALG II, Grundsicherung, AsylbLG,
  some severely disabled with "RF" mark, BAföG-independent) confirmed. Accessed 2026-07-05.
- **Builder note:** link the primary source as `https://www.rundfunkbeitrag.de` (verified live); the
  exemption-form deep-path the researcher flagged (404) is not needed as the stored primary URL.

### A5. SCHUFA — `schufa` (guide `e94813b7-da85-44f1-9a1b-333b413ceea5`)
- **VERIFIED (fresh cross-check, meineschufa.de product terms):**
  - **SCHUFA-BonitätsAuskunft = €29.95**, **instant PDF** online (or in-branch at Postbank);
    price/structure stable in 2026.
  - **Page split confirmed:** page 1 = creditworthiness summary for the landlord; pages 2–3 =
    personal only, not to be handed over.
  - Free **Datenkopie (Art. 15 DSGVO)** is personal-review only, NOT landlord-usable; by post,
    **statutory max 30 days** (commonly 2–4 weeks). `legal_basis: Art. 15 DSGVO` correct for the free
    copy; the paid BonitätsAuskunft is a separate commercial product (worth clarifying).
  - Accessed 2026-07-05. (Direct WebFetch of meineschufa deep URLs 404'd — same anti-bot pattern — so
    €29.95 + page-split confirmed via fresh search consensus of meineschufa's own product terms, which
    is sufficient for a stable published product price.)
- **VERIFIED:** newcomer-alternatives list (employment contract/payslips, guarantor/Bürge, prior
  landlord reference, larger deposit); **§551 BGB 3-month cold-rent deposit cap** is a stable statutory
  fact worth citing. Keep the alternatives qualitative.

---

## GROUP B — Tax ID / tax class (national) + per-city Finanzamt

### B-Part 1: national tax how-to (`tax-id`, guide `3e802dd4-480e-4651-820f-222aafced86e`) — NO city variants
- **VERIFIED:** Steuer-ID issued once by the federal **BZSt**, mailed by post only (never phone/email),
  permanent; **Steuernummer** is local-Finanzamt-issued and can change on a move. The Steuer-ID vs
  Steuernummer distinction is correct and high-value.
- **CORRECTED → keep as range:** "**2–4 weeks**" delivery window is not stated as a number on bzst.de
  itself (aggregator-sourced). Publish as "usually a few weeks (commonly 2–4)" with a verify-note.
- **VERIFIED:** six **Steuerklassen I–VI** structure and who-gets-what (legal basis §38b EStG); IV/IV
  vs III/V trade-off; tax class affects withholding only, not final liability. Add §38b EStG to
  legal_basis alongside the existing §139b AO.
- **VERIFIED (fresh cross-check):** filing deadlines — **Steuererklärung for tax year 2025 due
  31 July 2026** (self-filed, mandatory); with a tax advisor/Lohnsteuerhilfeverein it extends (into
  2027); **voluntary filing has a 4-year window** (2025 → 31 Dec 2029). Confirmed across Finanztip,
  finanzamt.nrw.de, lohnsteuer-kompakt. Accessed 2026-07-05.
- **VERIFIED:** one-month **Einspruch** window on a Steuerbescheid (§355 AO); wrong-tax-class excess
  refunded via the Steuererklärung.
- **Provisional / verify-notes (soften or hedge; do not print as hard fact):**
  - ELSTER "1–2 weeks" activation — **REMOVE the specific range**; say "requires a one-time ID
    verification by post that takes a while — plan ahead."
  - "Once per calendar year" tax-class-change limit — keep but hedge ("generally once per year, with
    exceptions like marriage/divorce/death of a spouse").
  - "2025 ELSTER form reorganisation" — **DROP** unless Builder confirms on elster.de.
  - Postal fallback "Referat St II 7, 11055 Berlin" — **REMOVE**; unverified.
- Sources: bzst.de Steuer-ID page + online.portal.bzst.de re-request page (researcher-fetched);
  hamburg.de tax-class-change page; elster.de (link the homepage). Access 2026-07-05.

### B-Part 2: per-city Finanzamt — `city_task_variants` for `tax-id` (`6fe90ed7-f0d6-477b-9c50-31fd3719f9df`)
**Schema/approach VERIFIED as sound:** one row/city; populate only `office_name` /
`office_address` (single-office cities only) / `booking_url` (BZSt Finanzamtsuche, same for all 15) /
`city_notes_md` / `sources`; leave `appointment_required` / `walk_in_possible` / `office_hours` /
`fees_eur` **null** — tax-id Finanzamt business (Steuer-ID auto by post, Steuerklasse via ELSTER/post)
needs **no appointment**, so do NOT default `appointment_required=true` here (unlike Anmeldung/ABH).
Nationwide finder (cite for every city): BZSt Finanzamtsuche
`https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html`
(fetched, VERIFIED, 2026-07-05).

Per-city verdicts:
- **Bremen — VERIFIED single office.** Finanzamt Bremen, **Rudolf-Hilferding-Platz 1, 28195 Bremen**,
  phone 0421 361-90909, covers the whole city (excl. Bremerhaven for individuals). Re-confirmed via
  service.bremen.de / finanzen.bremen.de (2026-07-05). Give the concrete address. (Legacy directory
  name "Finanzamt Bremen-Ost" appears — official current name is "Finanzamt Bremen".)
- **Aachen — VERIFIED single office (city residents).** Finanzamt Aachen-Stadt, **Krefelder Str. 210,
  52070 Aachen**, phone 0241 469-0. Aachen-Kreis is a separate office for the surrounding StädteRegion.
  Confirmed (finanzamt.nrw.de).
- **Nuremberg — VERIFIED, dateable merger.** As of **1 January 2026**, Nürnberg-Nord + Nürnberg-Süd +
  Zentralfinanzamt **merged into a single "Finanzamt Nürnberg"** (part of a Mittelfranken 11→3
  restructuring that also created Finanzamt Mittelfranken-West and -Ost). Old buildings remain as
  service points; phone numbers/jurisdictions unchanged "for the time being." Re-confirmed via fresh
  search of the official finanzamt-nuernberg.de domain + steuern.de (2026-07-05). **office_address: null**
  with the merger explained in city_notes.
- **Leipzig — VERIFIED shared building.** Finanzamt Leipzig I / II share
  **Wilhelm-Liebknecht-Platz 3–4, 04105 Leipzig** and one reception desk. Give the address.
- **Dresden — VERIFIED shared building.** Dresden-Nord / Dresden-Süd, Elbe-side split, both at
  **Rabenerstraße 1, 01069 Dresden** (researcher fetched dresden-online.de). Give the address.
- **Munich — VERIFIED.** One legal entity "Finanzamt München", 5 buildings, central Servicezentrum at
  **Deroystraße 12, 80335 München** — give that as the walk-in service address.
- **Berlin, Hamburg, Cologne, Frankfurt, Stuttgart, Düsseldorf, Dortmund, Hannover — VERIFIED
  multi-office → `office_address: null` + finder.** Honest framing. **Do not publish exact office
  counts as hard fact** — use "several district-based Finanzämter — use the finder" phrasing (counts
  drift).
- **Essen — CORRECTED (leave null address).** Essen-NordOst / Essen-Süd. The **Altendorfer Str. 129**
  shared-building *tax-office* claim was not re-confirmed this pass; leave `office_address: null` and
  point to the NRW finder. Do NOT confuse with the Essen *driving* office at Altendorfer Str. 101
  (C2). Do not publish the "0211 …" phone (likely an NRW call-centre number).

**Finanzamt items to hedge / drop (Builder verify-notes):**
- **Stuttgart "2 January 2026 shared ZIA service centre for I–III"** — recent, specific, unverified.
  **DROP the exact date/ZIA detail**; keep "Stuttgart splits I–IV by surname; use the BW finder."
- **Cologne "Köln-Mitte no longer exists"** — single-aggregator claim; **do not publish a specific
  office count/list.**
- **"surrounding district, not city" framing** (Düsseldorf-Mettmann, Dortmund-Unna, Aachen-Kreis,
  Hannover-Land) — safe as a one-line clarification per city (only tells people the Kreis/Land office
  isn't theirs); low risk.

---

## GROUP C — Converting a driving licence (national) + per-city Führerscheinstelle

### C-Part 1: national rules (`driving-license`, guide `579354ed-cedb-4d77-b08c-88ab219ed557`, legal_basis currently NULL)
- **VERIFIED (primary):** §29 FeV — non-EU/EEA licence valid **6 months** from establishing ordinary
  residence; the Fahrerlaubnisbehörde **may extend by up to 6 more months** if you credibly show your
  stay will be under 12 months. Fetched gesetze-im-internet.de/fev_2010/__29.html (2026-07-05).
  **Fill `legal_basis`:** "§29 FeV (recognition / 6-month rule; extension for <12-month stays); §31 FeV
  + Anlage 11 FeV (exchange country tiers); §28 FeV (EU/EEA)."
- **CORRECTED — the "filing in time is enough even if processing runs late" claim (HIGH-PRIORITY
  HONESTY FIX):** §29 FeV does **NOT** say this. The statute says the entitlement simply "besteht noch
  sechs Monate" — nothing about a timely application extending legality. This is **Dortmund's own
  administrative practice**, not federal law. Driving on an expired entitlement is a criminal offence.
  - **Builder action:** replace "submitting in time keeps you covered" with: "Apply **well before** the
    6 months run out — processing can take 8–14 weeks. Some city offices treat a timely application as
    sufficient even if processing overruns, but this is not guaranteed by federal law; confirm with
    your own Führerscheinstelle and do not drive on an expired entitlement." Scope the "filing is
    enough" note to Dortmund's `city_notes_md` only ("Dortmund's own page says…").
- **VERIFIED:** EU/EEA licences (27 EU + IS/LI/NO) valid to their own expiry (§28 FeV); truck/bus
  classes recognised 5 years; EU photocard-exchange deadline 19 Jan 2033; probationary-period nuance
  for licences held <2 years. (ADAC, fetched.)
- **VERIFIED:** three-tier Anlage 11 system. UK+Gibraltar (since 2022) and Montenegro (pending 2026)
  confirmed via ADAC. **Provisional:** US/Switzerland/Japan/Korea/Australia/Canada tier-1 examples NOT
  row-by-row verified against Anlage 11 (US especially **varies by issuing state**). Keep the "we don't
  reproduce the list — check Anlage 11 / the ADAC country list" framing; name only UK+Gibraltar and
  Montenegro concretely; hedge the rest.
- **CORRECTED — ADAC translation prices → range, not fixed:** publish "roughly **€50–85** for
  translation + classification (varies by ADAC regional club), or about **€25** for classification
  alone; ~10 working days." Do NOT print fixed "€55 Latin / €85 non-Latin" as universal (varies by
  club; one quotes €65). Verified 2026-07-05.
- **VERIFIED:** documents list (original licence retained; certified translation + classification;
  biometric photo ~€10–15; Sehtest for car/moto vs medical exam for truck/bus; first-aid course
  specifically for non-EU/EEA conversions). **Total cost ~€35–90** and **4–14 week** processing are
  safe as ranges (corroborated across several official city fee pages). Keep as ranges; do not store
  15 per-city fee numbers.
- **Provisional:** IDP (~€15–20) — minor; include only if room, hedged.

### C-Part 2: per-city Führerscheinstelle — `city_task_variants` for `driving-license` (`410d4c2e-8f10-4b44-88d9-f92e08934129`)
All 15 net-new (zero existing rows — DB-confirmed). Populate `office_name`, `office_address` (where
single/clear), `booking_url`, `city_notes_md`, `sources`, `last_verified_at=2026-07-05`;
`appointment_required=true` for all EXCEPT resolve Bremen (below).

**Address conflicts — ALL THREE RESOLVED this pass (the researcher's top user-facing risk):**
- **Munich — CORRECTED/VERIFIED.** Führerscheinstelle (KVR) = **Garmischer Straße 19–21, 81373 München**
  (visitor address, by appointment). The "Eichstätter Straße 2, 80686" is the **postal correspondence
  address (Postanschrift), NOT a vehicle-registration office** — the researcher's Kfz-Zulassungsstelle
  guess was wrong. Re-fetched stadt.muenchen.de (2026-07-05). Publish Garmischer Straße 19–21.
- **Stuttgart — VERIFIED.** Führerscheinstelle = **Krailenshaldenstraße 32, 70469 Stuttgart (Feuerbach)**,
  tel 0711 21698-200. "Löwentorbogen" belongs to the Kfz-Zulassungsstelle. Appointment mandatory.
  Confirmed (2026-07-05).
- **Essen — CORRECTED.** Correct driving-licence office = **Altendorfer Str. 101, 45143 Essen**
  (confirmed on the official service.essen.de einrichtung page, 2026-07-05), appointment only
  (meintermin.essen.de), phone 0201 88-33888. The researcher's *primary* guess "Hollestraße 3
  (Technisches Rathaus)" is **wrong** — publish Altendorfer Str. 101.

**Regional-authority cases — one VERIFIED, one CORRECTED (call out prominently):**
- **Hannover — CORRECTED (HIGH-PRIORITY user-facing fix).** The researcher/earlier draft said "handled by
  Region Hannover" — that is **wrong for a newcomer registered in Hannover CITY.** The **Region Hannover**
  Fahrerlaubnisbehörde (Hildesheimer Str. 20, 30169 Hannover) explicitly serves only **the 20 surrounding
  towns** (Garbsen, Langenhagen, Seelze, Lehrte, etc.); its own page states "Einwohner*innen Hannovers
  wenden sich bitte an die Stadt Hannover." → For the Hannover **city** variant, the responsible body is
  the **Stadt Hannover** driving-licence office (book via hannover.de), NOT Hildesheimer Str. 20. Explain
  both exist, but do not pin a city resident to the Region office. Re-confirmed via region-hannover /
  hannover.de (2026-07-05). Contrast with Aachen below, where the regional body genuinely IS the office
  for city residents.
- **Aachen — VERIFIED.** Handled by the **StädteRegion Aachen**, physically in **Würselen** —
  **Carlo-Schmid-Straße 4, 52146 Würselen**, appointment mandatory (a no-appointment counter exists only
  for mandatory paper-licence exchange, NOT foreign conversion). Re-confirmed verbatim on
  staedteregion-aachen.de (2026-07-05).

**Bremen — CORRECTED, the "no appointment" outlier is REJECTED (HIGH-PRIORITY):**
- The researcher's claim that Bremen takes walk-ins with "no appointment system" is **contradicted** by
  the official service.bremen.de pattern: driving-licence matters at the Bürgeramt are **by prior
  appointment only** ("nur nach vorheriger Terminvereinbarung"). Consistent with Bremen's residence-permit
  ABH row (`appointment_required=true`). **Set `appointment_required=true`; do NOT publish
  `appointment_required=false` or the narrow walk-in hours.**
- **Address:** researcher's "Stresemannstraße 48" is unconfirmed and conflicts with "Bürgerdienst Nord,
  Contrescarpe 73, 28195 Bremen". Bremen runs this as a multi-location Bürgeramt service. **Leave
  `office_address` null** (or "Bürgerdienst — book via service.bremen.de") and point to the booking
  portal. Processing ~8–12 weeks confirmed.

**Other cities — VERIFIED as drafted (office identity/booking):**
- **Berlin** — LABO Fahrerlaubnisbehörde, Puttkamerstraße 16–18, 10969 Berlin; borough-wide; book via
  service.berlin.de/dienstleistung/327537/. VERIFIED.
- **Cologne** — Straßenverkehrsamt, Stadthaus Deutz, Willy-Brandt-Platz 3, 50679 Köln. VERIFIED.
- **Düsseldorf** — Straßenverkehrsamt, Höherweg 101, 40233 Düsseldorf; service.duesseldorf.de. VERIFIED.
- **Hamburg** — Landesbetrieb Verkehr (LBV); book via lbv-termine.de / hamburg.de. **Provisional:** LBV
  street address (Ausschläger Weg 100) not re-confirmed — leave address soft or point to the LBV page.
- **Dresden, Leipzig, Nuremberg, Dortmund, Frankfurt** — office identity + booking URL correct and safe;
  **treat exact street addresses as provisional** (search-snippet sourced) — keep the booking URL as the
  reliable pointer and soft-state or verify the address before pinning. Frankfurt's frankfurt.de 403
  persists → the Führerscheinstelle sits in the Straßenverkehrsamt/Ordnungsamt; rely on the booking URL.
- **Leipzig-specific VERIFIED detail worth keeping:** Drittstaat theory+practical exams administered via
  **DEKRA**, not an in-house examiner.

**Fees:** do NOT store 15 per-city `fees_eur` numbers. Keep the national ~€35–90 range in the guide and
note "fees vary slightly by city" in `city_notes_md`.

---

## GROUP D — ABH trio (visa-conversion, fiktionsbescheinigung, work-permit-change)

### D-Part 1: national how-to (deepen 3 guides)
**1A. visa-conversion (`c4f1d623-…`, legal_basis was null):**
- **VERIFIED:** convert the D-visa into a residence permit **in person at your local Ausländerbehörde
  before it expires**; Anmeldung generally required first (address determines jurisdiction); §81 AufenthG
  protects a timely application (typically get a Fiktionsbescheinigung). Fill `legal_basis`: "§6 Abs. 3,
  §81 AufenthG; AufenthV (fees)."
- **CORRECTED → hedge:** the "6–8 weeks to 3 months" lead-time and "D-visa valid 3–6 months, up to a
  year" ranges are practitioner/consulate-variable, not statutory. Publish as "start looking for an
  appointment as soon as you register — appointment backlogs, not paperwork, are the bottleneck; your
  visa sticker states its own expiry — apply before that date." No hard lead-time as a rule.
- Sources: gesetze-im-internet.de §81 (fetched); auswaertiges-amt.de national-visa; make-it-in-germany.

**1B. fiktionsbescheinigung (`dec19bd6-…`):**
- **VERIFIED (against primary §81 text):** **§81 Abs. 3 Erlaubnisfiktion** (first-ever application; work
  generally NOT allowed unless stated) vs **§81 Abs. 4 Fortgeltungsfiktion** (on-time extension of an
  existing title; prior conditions incl. work continue). Abs. 5 = issuance obligation; Abs. 5a =
  employment note. `legal_basis`: "§81 Abs. 3,4,5,5a AufenthG."
- **CORRECTED → mark as practice, not statute:** the travel-rights distinction is administrative
  practice/interpretation — §81 doesn't spell out travel rules. Keep the "generally / in practice — ask
  your caseworker before international travel" hedge.
- **Provisional:** "usually free" — plausible but not sourced; soften to "usually issued as part of your
  appointment; check whether your office charges a fee." Replace the bamf.de/bmi.bund.de homepage
  citations with gesetze-im-internet.de §81 + asyl.net (no specific BAMF sub-page found — do not
  fabricate one).

**1C. work-permit-change (`52ef1c0a-…`, legal_basis was null) — highest-value new content:**
- **VERIFIED (against PRIMARY statute §18g AufenthG, fetched 2026-07-05):**
  - §18g(4): **no ABH permission required** for a Blue Card holder's employer change (day-one),
    "Abweichend von §4a Absatz 3 Satz 4 … keine Erlaubnis der Ausländerbehörde erforderlich."
  - **First 12 months:** the ABH "kann den Arbeitsplatzwechsel … für 30 Tage aussetzen und innerhalb
    dieses Zeitraums ablehnen" if Blue Card conditions no longer met.
  - Ties to the **18 Nov 2023 Fachkräfteeinwanderungsgesetz 2.0** liberalisation — genuinely new,
    high-value; the existing guide omits it. Fill `legal_basis`: "§18a, §18b, §18g AufenthG; FEG 2.0 (in
    force 18 Nov 2023)."
- **REMOVED — the "10 working days" notification deadline:** NOT present in §18g's statutory text (one
  secondary source only). Do not print a day-count. Say "you must **notify** the Ausländerbehörde of the
  change (notification, not an approval request)."
- **CORRECTED → keep hedged:** the §18a/§18b (non-Blue-Card) "notify while young, free after 2 years
  (3 if not social-security-covered)" mechanic is inferred from general practitioner sources, not
  confirmed specifically for §18a/§18b post-reform. Keep the explicit hedge ("real regional/office-level
  variation … confirm your permit's wording with your ABH"). Do NOT state 2/3-year as settled fact for
  §18a/§18b.
- **Provisional:** ICT Card / older routes still needing Agentur für Arbeit approval post-reform — keep
  vague ("in some cases"). Deep-link a specific make-it-in-germany.com page instead of the homepage.
- **VERIFIED (Berlin, city-specific):** Berlin's LEA handles employer-change entirely **online** via
  service.berlin.de/dienstleistung/326856/en/ (2-year/3-year threshold stated there). One confirmed
  per-city process detail → candidate `city_step_overrides` insert.

### D-Part 2: city reuse — VERIFIED and RECOMMENDED
- **DB-confirmed:** all **15 residence-permit `city_task_variants` rows exist, fully populated,
  `appointment_required=true`, `last_verified_at=2026-07-04`** (queried this pass — office names +
  booking URLs sane, e.g. Berlin LEA, Munich KVR, Aachen StädteRegion Ausländeramt, Frankfurt
  frankfurt.de/auslaenderangelegenheiten).
- **The same Ausländerbehörde handles all four processes in every city** — structural, not per-city.
  **DO NOT create 45 duplicate rows.** Reuse residence-permit's 15 rows.
  - **Builder implementation (researcher's option 1, endorsed):** application-layer fallback in
    `getVariant(cityId, taskId)` (`lib/queries/guide.ts`) — when the task is one of the trio and no row
    exists, fall back to the `residence-permit` row for the same city (residence-permit task_id
    `4a9cd0bd-b800-4dd9-9c1f-69a5edc69354`), ideally with a "Handled by the same office as your residence
    permit" note. Code change (Builder's call) — no schema change, single source of truth. Frankfurt's
    frankfurt.de 403-on-fetch doesn't matter: its booking URL is already stored/live on the
    residence-permit row and reused.
- **REMOVED / DO NOT INVENT:** per-city Fiktionsbescheinigung "auto-issued vs on-request" tables — no
  source exists; leave unclaimed. Frankfurt Blue-Card employer-change page (403) — unverified, no
  Frankfurt-specific step-override from it this round.

---

## GROUP E — Qualification recognition (national; profession + state, NOT city)

`qualification-recognition` (guide `26cc662e-…`, task `3af82801-…`) — **NO `city_task_variants`.**
- **VERIFIED (primary re-fetches):**
  - **ZAB Statement of Comparability = €208** (new) / **€104** (duplicate); processing **~3 months
    standard, ~2 months skilled-worker fast-track, ~2 weeks EU Blue Card**. Re-fetched
    zab.kmk.org/en/statement-of-comparability/faq (2026-07-05). Doesn't expire; valid Germany-wide.
  - **anerkennung-in-deutschland.de** loads; operated by **BIBB**; **11 languages**; the **Recognition
    Finder** live URL is **`https://www.anerkennung-in-deutschland.de/html/en/redirect_220.php`**
    (correct link — supersedes the researcher's `/recognition-finder.php` 404 guess).
  - **Anerkennungspartnerschaft = §16d(3) AufenthG**; residence title **initial 12 months, extendable
    1 year at a time up to 3 years total**; **A2 German** (higher for some professions); (bonus: up to
    20h/week secondary employment). Re-fetched make-it-in-germany (2026-07-05).
  - **IHK-FOSA** = national body for commercial/industrial/service vocational qualifications; **fee
    €100–600 (typically ~€350–450)**; **3-month** statutory processing (§6(3) BQFG). Fresh cross-check
    (2026-07-05). **HWK** = regional chambers for craft trades, same BQFG basis, similar range.
  - **BAMF/BA "Working and Living in Germany" hotline = +49 30 1815-1111.** **CORRECTED hours:** the
    official BAMF page states **Mon–Thu 09:00–16:00, Fri 09:00–12:00** — NOT the researcher's
    "Mon/Tue/Fri 9–12; Wed/Thu 13–16". Use the official hours. Re-fetched bamf.de (2026-07-05).
  - **IQ Network** = 16 regional networks (one per Bundesland), free counselling regardless of
    nationality/status.
- **VERIFIED:** regulated vs non-regulated fork as the intro's lead (regulated = doctors, nurses,
  teachers, lawyers, many Meister trades → recognition legally required; non-regulated = most IT,
  engineering, business → optional but helpful for visa/salary). anabin H+/H+-/H- kept conceptual (not a
  click-by-click walkthrough). `legal_basis`: keep **BQFG**, append **§16d AufenthG** for the partnership
  route.
- **VERIFIED:** the responsible-body table and "for state-level health/teaching, do NOT invent 16 states'
  fees/offices — point to the Recognition Finder." Correct honesty analogue to the city rule
  (state-varying → no per-city rows).
- **Provisional / verify-notes:**
  - **anabin.kmk.org** itself not directly loaded — keep H+/H+-/H- conceptual; no step-by-step anabin
    walkthrough.
  - **Anerkennungszuschuss** grant — carried over from existing guide text, not re-verified with a fresh
    primary source; keep qualitative ("some regions offer grants — check current eligibility"), no euro
    figure.
  - Chancenkarte touchpoint — link to recognition only; do not rewrite the residence-permit guide.
- **glossary_terms candidates** (anabin, ZAB, Statement of Comparability, IHK-FOSA, Defizitbescheid,
  Anerkennungspartnerschaft, Anerkennungszuschuss) — VERIFIED definitions except Anerkennungszuschuss
  (provisional). Builder should confirm no slug collisions before inserting.

---

## Verifier's notes for the Builder (what stays provisional / needs a visible verify-note)

1. **HIGH-PRIORITY honesty fixes (do not ship the researcher's original wording):**
   - **Driving §29 FeV:** "filing on time keeps you legal even if processing overruns" is **Dortmund
     practice, not federal law.** Do not state nationally; add the "don't drive on an expired
     entitlement; confirm with your office" verify-note. (Group C1.)
   - **Bremen driving office `appointment_required = FALSE` is REJECTED** — set it `true`; the
     "no appointment" claim is contradicted by the official portal. (Group C2 Bremen.)
   - **Blue Card "10 working days notification deadline" REMOVED** — not in §18g. Say "notify the ABH"
     with no day-count. (Group D1C.)
   - **BAMF hotline hours CORRECTED** to Mon–Thu 09:00–16:00, Fri 09:00–12:00. (Group E.)
   - **Essen driving address CORRECTED** to Altendorfer Str. 101 (not Hollestraße 3); **Munich** =
     Garmischer Str. 19–21 (Eichstätter Str. is postal only, not a separate office). (Group C2.)
   - **Hannover driving CORRECTED:** city residents use the **Stadt Hannover** office, NOT the **Region
     Hannover** office at Hildesheimer Str. 20 (which serves only the 20 surrounding towns). Confirmed on
     hannover.de: "Einwohner*innen Hannovers wenden sich bitte an die Stadt Hannover." (Group C2.)

2. **City_task_variants approach (endorsed):**
   - **Finanzamt (tax-id):** one row/city; populate `office_name`/`office_address`(single-office
     only)/`booking_url`(BZSt finder, same for all)/`city_notes_md`; **leave `appointment_required`
     null/false** — tax-id needs no appointment. Concrete addresses only for Bremen, Aachen(-Stadt),
     Munich(Servicezentrum), Leipzig, Dresden; null (finder) for the rest; Nuremberg = merged-1-Jan-2026
     note, null address.
   - **Führerscheinstelle (driving-license):** one row/city, `appointment_required=true` for all 14
     (Bremen included — reject the outlier). Concrete verified addresses: Berlin, Munich, Stuttgart,
     Cologne, Düsseldorf, Hannover(**Stadt Hannover — NOT the Region office**), Aachen(Würselen),
     Essen(Altendorfer 101). Treat Dresden,
     Leipzig, Nuremberg, Dortmund, Frankfurt, Hamburg **street addresses as provisional** — booking URL
     is the reliable pointer; verify the address on the city page before pinning, or soft-state it.
   - **ABH trio (visa-conversion / fiktionsbescheinigung / work-permit-change):** **reuse
     residence-permit's 15 rows via app-layer fallback in `getVariant()`** — do NOT create 45 rows.
     Only confirmed per-city extra: Berlin work-permit-change online via service.berlin.de (candidate
     `city_step_overrides` insert).

3. **Keep as ranges / hedges, never hard single numbers:** Sperrkonto amounts ("as of 2026, ~€992/mo
   students; confirm with mission"), N26/Sparkasse fees (qualitative), student GKV ~€120–140/mo, driving
   total cost ~€35–90 and processing 4–14 weeks, ADAC translation ~€50–85, Steuer-ID delivery ~2–4 weeks,
   D-visa validity/lead-time (no statutory number).

4. **Drop entirely (unverifiable / false-precision):** Fintiba/Expatrio exact fees + Coracle pause; the
   exact €13,092/€1,091 Chancenkarte Sperrkonto figure; the "10 working days" Blue Card deadline; Stuttgart
   "2 Jan 2026 ZIA" date; Cologne "Köln-Mitte defunct" office count; ELSTER "1–2 week" activation and the
   "2025 form reorganisation"; BZSt postal fallback "Referat St II 7".

5. **Stable single numbers safe to publish as fact (re-verified this pass):** Rundfunkbeitrag €18.36/mo &
   €55.08/qtr; SCHUFA BonitätsAuskunft €29.95 (page-1-for-landlord); JAEG 2026 €77,400/yr (€6,450/mo);
   ZAB €208/€104; IHK-FOSA €100–600; Anerkennungspartnerschaft §16d(3), 12mo→max 3yr, A2; Blue Card §18g
   day-one change + 30-day/12-month window; BAMF hotline +49 30 1815-1111 (Mon–Thu 9–16, Fri 9–12);
   Steuererklärung 2025 due 31 Jul 2026 + 4-year voluntary window; Nuremberg Finanzamt merger 1 Jan 2026.

6. **Sources & dates:** retained facts carry their source URL + access date (mostly 2026-07-05; a few
   Group A carry 2026-07-04 from the research pass). On deploy, set `guides.last_verified_at = 2026-07-05`
   for the touched guides and **append** (don't replace) new source URLs to the existing `sources` jsonb
   arrays.
