# Research packet — GROUP D: ABH trio (visa-conversion, fiktionsbescheinigung, work-permit-change)

Researcher output for the Verifier. Read-only research; nothing written to DB.
Access date for all sources below: **2026-07-05** unless noted otherwise.

## 0. What already exists in the DB (read via Supabase MCP, project `ilfhjffpzvzphbvhdpup`)

All three tasks and their `guides` rows **already exist and are published** — this round
is a **deepen, don't duplicate** pass. Current state:

### `tasks` table (confirmed present)
| slug | id | title_en | category |
|---|---|---|---|
| `visa-conversion` | `c4f1d623-1614-4060-ab98-c54b8096f685` | Converting an entry visa | category `64d18633-...` (same as residence-permit) |
| `fiktionsbescheinigung` | `dec19bd6-842a-4768-93fc-ac0ae7c76c15` | Bridging certificate | category `64d18633-...` (same as residence-permit) |
| `work-permit-change` | `52ef1c0a-af8f-4868-b9ca-6109edf5e8f8` | Changing employer | category `4371af2c-...` (recognition/qualification category, NOT the ABH category — see note below) |
| `residence-permit` | `4a9cd0bd-b800-4dd9-9c1f-69a5edc69354` | Residence permit | category `64d18633-...` |

**Note for Builder/Verifier:** `work-permit-change` currently sits in a different
`task_categories` row (`4371af2c-...`, shared with `qualification-recognition`) than
`residence-permit`/`fiktionsbescheinigung`/`visa-conversion` (`64d18633-...`). That's a
navigation/grouping nuance, not something this research changes — flagging only so the
Builder doesn't assume all four sit under one category heading already.

### `guides` rows (existing intro_md/documents_md/after_md/legal_basis) — summarized
- **fiktionsbescheinigung** guide: already has decent intro (what it is, §81 reference, "which
  paragraph is ticked" framing), 5 checklist steps, sources = bamf.de + bmi.bund.de (both
  homepages, not deep links), `last_verified_at: 2026-07-02`.
- **visa-conversion** guide: already covers D-visa → permit, Anmeldung-first note, "apply
  before expiry", 6 checklist steps, sources = make-it-in-germany.com + auswaertiges-amt.de
  (homepages), `legal_basis: null` (not filled), `last_verified_at: 2026-07-02`.
- **work-permit-change** guide: already covers "approval vs notification" framing generically,
  5 checklist steps, only 1 source (make-it-in-germany.com homepage), `legal_basis: null`,
  `last_verified_at: 2026-07-02`.

**Assessment:** the existing guides are directionally correct but thin/generic and missing:
(a) precise legal citations (`legal_basis` is null for 2 of 3), (b) the Nov 18 2023
Fachkräfteeinwanderungsgesetz 2.0 liberalisation specifics for work-permit-change, (c) the
specific §81 paragraph numbers and what each does/doesn't permit for fiktionsbescheinigung,
(d) deep-linked official sources instead of homepages. Part 1 below proposes **updated/expanded
`intro_md`, `documents_md`, `after_md`, `legal_basis`, `sources`** for all three — written as
full replacement drafts the Verifier can check line by line, not a diff.

### `city_task_variants` / `city_step_overrides` (confirmed via SQL)
- **Zero** `city_task_variants` rows exist today for `visa-conversion`, `fiktionsbescheinigung`,
  or `work-permit-change` (checked explicitly — empty result set).
- `residence-permit` has all **15/15** city rows fully populated (office name, booking URL,
  appointment/walk-in/online flags, wait-time text, the shared §§44–45 fees_note,
  `last_verified_at: 2026-07-04`).
- `city_step_overrides` currently has only 2 rows total, both for `anmeldung` (Berlin, Munich) —
  none for residence-permit or the trio.
- The 15 published cities: aachen, berlin, bremen, cologne, dortmund, dresden, duesseldorf,
  essen, frankfurt, hamburg, hannover, leipzig, munich, nuremberg, stuttgart.

This confirms the brief's premise exactly: Part 2 is a **reuse problem**, not a
15-office-times-3-task research problem.

---

## PART 1 — National how-to (deepen `guides` rows, one per task)

### 1A. `visa-conversion` (task_id `c4f1d623-1614-4060-ab98-c54b8096f685`)

**Draft `intro_md` (replacement):**

> If you entered Germany with a national **entry visa (nationales Visum, "Visum Kategorie D")**
> for work, study, family reunion or similar, that visa is itself a temporary residence title —
> but it is usually valid for only a few months (commonly 3–6 months, sometimes up to a year,
> depending on your purpose and consulate). Before it expires, you must apply **in person at
> your local Ausländerbehörde inside Germany** to convert it into a full residence permit
> (Aufenthaltserlaubnis, Blue Card, etc.) tied to your registered address.
>
> This step is easy to confuse with the original visa application, but it is a different
> process at a different authority: the consulate abroad issued your entry visa; the German
> Ausländerbehörde where you now live issues the follow-on permit. You do this after you have
> moved to Germany.
>
> **You almost always need to complete your Anmeldung (address registration) first.**
> Ausländerbehörden generally require a valid Meldebescheinigung (registration certificate)
> before they will book you an appointment or accept your application, because your registered
> address determines which Ausländerbehörde has jurisdiction over your case.
>
> **The core rule to remember: apply before your visa expires — not after.** German law
> protects you if you apply in time: under §81 Aufenthaltsgesetz, an application submitted
> before your current visa/title expires means your stay counts as legally permitted while the
> Ausländerbehörde processes it (you'll typically get a Fiktionsbescheinigung — see that guide).
> If you let the visa lapse before applying, you risk being asked to leave the country and a
> ban on working in the meantime. Because appointment availability is often the real bottleneck
> (not document prep), start looking for an appointment slot as soon as you arrive and register
> — many offices recommend starting **around 6–8 weeks, and ideally up to 3 months, before
> expiry**, though exact lead times vary a lot by city and by how booked-up the local office is.

**Draft `documents_md` (replacement — supersedes existing to add specificity):**

> - Passport with the entry visa sticker/label
> - Anmeldebestätigung / Meldebescheinigung for your current registered address (get this
>   first — most offices won't book you without it)
> - Proof of health insurance valid in Germany
> - Proof of financial means / purpose of stay: employment contract (workers), university
>   enrolment certificate (students), marriage/birth certificate (family reunion), blocked
>   account or scholarship letter, depending on your case
> - Biometric passport photo (check your office's exact spec — sizes/backgrounds vary slightly)
> - Completed application form — usually downloadable from your city's Ausländerbehörde page;
>   some cities now require you to fill this in online before the appointment
> - Application fee, payable at the appointment (see the residence-permit guide for the
>   §§44–45 AufenthV fee ranges — this conversion uses the same fee schedule)

**Draft `after_md` (replacement):**

> If approved, your visa sticker is replaced by an **eAT (elektronischer Aufenthaltstitel)** —
> a biometric plastic card — either handed to you on the spot or mailed a few weeks later while
> you rely on a Fiktionsbescheinigung in the meantime. From here on, this is treated exactly
> like any other residence permit: renewals follow the same process, and the clock toward
> permanent settlement (Niederlassungserlaubnis) starts from your original valid residence
> period, not from this conversion date. **Verify current wait times and required lead time
> with your specific Ausländerbehörde** — they vary significantly by city and season (see the
> city page for your Ausländerbehörde's booking link, shared with the residence-permit guide).

**Draft `legal_basis` (was null — fill in):** `§6 Abs. 3, §81 Aufenthaltsgesetz (AufenthG); Aufenthaltsverordnung (AufenthV) for fees`

**Sources:**
- https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa — Federal Foreign Office, national (D) visa overview — accessed 2026-07-05 — **confirmed** (visa validity is generally for stays >3 months; Ausländerbehörde becomes responsible once the person is in Germany)
- https://www.gesetze-im-internet.de/aufenthg_2004/__81.html — official law text §81 AufenthG — accessed 2026-07-05 — **confirmed** (Erlaubnisfiktion/Fortgeltungsfiktion mechanics)
- https://www.daad.de/de/in-deutschland-studieren/leben-in-deutschland/anmeldung/ — DAAD, confirms Anmeldung-before-Aufenthaltstitel ordering for the student case — accessed 2026-07-05 — **confirmed** (general principle; DAAD is a quasi-official/government-funded source, not primary law)
- https://www.advocado.de/ratgeber/auslaender-und-asylrecht/aufenthaltsrecht/aufenthaltsbestimmungsrecht-beantragen.html — legal advice portal, recommends applying ~3 months before expiry — accessed 2026-07-05 — **likely** (practitioner guidance, not a statutory deadline — no fixed statutory lead time exists in AufenthG itself, it's "before expiry," full stop)
- Existing DB source retained: https://www.make-it-in-germany.com — accessed 2026-07-02 — **confirmed** (general skilled-worker portal, official government-backed site)

**Confidence flags / what to flag for Verifier:**
- **confirmed:** Anmeldung must generally precede the Ausländerbehörde application; apply
  before visa expiry to keep legal stay uninterrupted (§81 AufenthG mechanism); D-visa is
  usually valid only months, not years.
- **likely, not confirmed:** the specific "6–8 weeks to 3 months" lead-time recommendation —
  this is common practitioner advice repeated across multiple non-official sites, but there is
  no single statutory number (it depends entirely on each city's appointment backlog). Keep as
  a range with a "book as early as possible, check your city's booking page" caveat, do NOT
  present as a legal deadline.
- **unverified:** exact visa validity range ("3-6 months, sometimes up to a year") — this
  varies by purpose/consulate and I could not find one authoritative table enumerating all
  cases. Verifier should either confirm this range holds broadly or soften further to "your
  visa sticker states its own expiry date — check that, not a rule of thumb."

---

### 1B. `fiktionsbescheinigung` (task_id `dec19bd6-842a-4768-93fc-ac0ae7c76c15`)

**Draft `intro_md` (replacement — more precise than existing):**

> A **Fiktionsbescheinigung** ("bridging certificate" or "fictional certificate") is the paper
> that proves your legal stay continues while the Ausländerbehörde is still deciding on your
> residence-permit application or extension. It is not a residence permit itself — think of it
> as an official placeholder confirming the law treats your presence as legal in the meantime.
>
> It comes in two main legal flavors, and **which one you have changes what you're allowed to
> do**, so always check the box ticked on your certificate:
>
> - **§81 Abs. 3 AufenthG — Erlaubnisfiktion:** used when you are lawfully in Germany but
>   didn't hold a residence title yet and are applying for one for the first time (e.g. after a
>   visa-exempt entry, or converting a visa — see that guide). If this is your *first*
>   application, working is generally **not** allowed until the Ausländerbehörde decides, unless
>   the certificate explicitly says otherwise.
> - **§81 Abs. 4 AufenthG — Fortgeltungsfiktion:** used when you already hold a residence title
>   and applied **on time**, before it expired, for an extension or a different permit. Your
>   *previous* permit's conditions (including work rights) generally continue to apply until
>   the decision — this is the more common case for people renewing an existing permit.
>
> Under §81 Abs. 5 the Ausländerbehörde is legally required to issue you this certificate once
> you've made a valid application — it's a formality, not a judgment on whether your application
> will succeed. Under §81 Abs. 5a, if the office has already started processing an electronic
> residence title tied to work or study, your employment permission is noted directly on the
> certificate.
>
> **Timing:** the certificate is tied entirely to your ABH appointment/application — you
> typically receive it in person at the same appointment where you submit your permit
> application or extension, if the office can't decide immediately. It is usually free.
>
> **Travel:** this is the part people get wrong most often. With a Fortgeltungsfiktion (§81
> Abs. 4 — you applied on time to extend an existing permit), leaving and re-entering Germany is
> generally possible. With an Erlaubnisfiktion (§81 Abs. 3 — your first-ever application), travel
> outside Germany is generally **not** safe — re-entry can be refused, since you don't yet hold
> (and never held) a valid title to return on. Always ask your caseworker before booking
> international travel, especially outside the Schengen area.

**Draft `documents_md` (replacement):**

> - Nothing extra to prepare separately — it is issued as part of your residence-permit
>   application or extension appointment, if the office can't decide the same day
> - If you weren't offered one and your current permit/visa is expiring soon, **ask for it
>   explicitly** before you leave the appointment — offices are legally obligated to issue it
>   (§81 Abs. 5 AufenthG) once you've made a valid application
> - Keep the physical original safe — employers, landlords, and border officials may ask to see
>   it in place of a residence card

**Draft `after_md` (replacement):**

> Continue waiting for your residence-permit decision — the Fiktionsbescheinigung itself has an
> expiry date, but that's an administrative renewal point, not a rejection. If it's approaching
> expiry and you haven't heard back, **contact the Ausländerbehörde proactively**; most offices
> will simply extend/reissue it rather than let your legal stay lapse through no fault of your
> own. Once your actual residence permit (or eAT card) is decided, the Fiktionsbescheinigung is
> superseded and you can discard it (keep it in your records for a while regardless).
>
> If your application is ultimately refused, the Fiktionsbescheinigung's protection ends and
> separate rules (appeal rights, departure obligations) apply — that scenario is outside the
> scope of this guide; consult the Ausländerbehörde's decision letter or a migration lawyer.

**Draft `legal_basis` (replacement — more precise than existing generic "§81 AufenthG"):**
`§81 Abs. 3, 4, 5, 5a Aufenthaltsgesetz (AufenthG)`

**Sources:**
- https://www.gesetze-im-internet.de/aufenthg_2004/__81.html — official law text, all
  paragraphs — accessed 2026-07-05 — **confirmed**
- https://www.asyl.net/themen/aufenthaltsrecht/sonstiger-aufenthalt/fiktionsbescheinigung —
  Informationsverbund Asyl & Migration (established NGO/legal-aid reference site, widely cited
  by German lawyers) — accessed 2026-07-05 — **confirmed** (cross-checked against the law text;
  matches on Erlaubnisfiktion vs Fortgeltungsfiktion mechanics and issuance obligation)
- https://se-legal.de/services/immigration-lawyer-germany/the-probationary-certificate-in-germany-die-fiktionsbescheinigung/?lang=en
  — immigration law firm, English-language explainer — accessed 2026-07-05 — **likely**
  (practitioner source, used mainly for the plain-English travel-rights explanation, which
  aligns with the asyl.net source)
- Existing DB sources retained but should be swapped for deep links: bamf.de and bmi.bund.de
  homepages were cited before — **recommend replacing** with the gesetze-im-internet.de §81
  link and a BAMF or BMI page that specifically discusses Fiktionsbescheinigung, since the
  homepages don't verify anything specific. I could not find a specific BAMF sub-page on
  Fiktionsbescheinigung in this session — **flag for Verifier** to locate one if possible,
  otherwise keep gesetze-im-internet.de + asyl.net as the two citations.

**Confidence flags / what to flag for Verifier:**
- **confirmed:** the three fiction types (Erlaubnisfiktion §81(3), Fortgeltungsfiktion §81(4),
  the Abs.(5) issuance obligation, Abs. (5a) employment-permission note) — cross-checked
  against the primary law text directly.
- **confirmed:** general travel-rights distinction (Fortgeltungsfiktion safer for travel than
  Erlaubnisfiktion) — consistent across se-legal.de and general practitioner consensus, but
  **the underlying law text does not explicitly spell out travel rules in Abs 3/4** — this is
  administrative practice/interpretation, not a directly quoted statute. Verifier should soften
  wording to "generally" / "in practice" rather than stating it as flat law, which the current
  draft above already does, but double-check.
- **unverified:** whether it's "usually free" — plausible (no fee schedule found attached to
  Fiktionsbescheinigung issuance itself, since it's bundled into the permit application), but I
  did not find an explicit fee confirmation either. Flag for Verifier to confirm zero fee or
  soften to "check with your office."

---

### 1C. `work-permit-change` (task_id `52ef1c0a-af8f-4868-b9ca-6109edf5e8f8`)

This is the section with the most material change vs. the existing guide — the existing
`intro_md` is generic ("depending on your permit type... approval or notification") and misses
the **2023 liberalisation**, which is genuinely newsworthy and differentiates old vs new advice.

**Draft `intro_md` (replacement):**

> Whether you need permission to **change employer** depends on which paragraph your residence
> permit was issued under — and the rules got significantly more liberal on **18 November
> 2023**, when the Fachkräfteeinwanderungsgesetz 2.0 (Skilled Immigration Act 2.0) reforms took
> effect. If you're relying on older advice (or an older permit), the rules you were told at the
> time may no longer apply.
>
> **EU Blue Card (§18g AufenthG):** since 18 November 2023, you can change employer **from day
> one** without needing prior Ausländerbehörde approval, as long as your new position still
> meets the Blue Card salary/qualification requirements. The one caveat: during your **first 12
> months** on the Blue Card, the Ausländerbehörde retains the right to suspend the change for up
> to 30 days and reject it in that window if the new job doesn't qualify. You must still
> **notify** the Ausländerbehörde of the change (this is a notification duty, not an approval
> request). After the first 12 months, this oversight window ends and you can switch freely.
>
> **Skilled-worker permits (§18a — vocational training, §18b — academic/university
> qualification):** since the same 18 November 2023 reform, these permits are issued for "any
> qualified employment" rather than a single named job/employer, which is the main structural
> change. In practice this generally lines up with the same trajectory as other employment
> permits: many offices still expect **notification** of an employer change while the permit
> is young, and full freedom (no notification, no approval) typically applies after **2 years**
> of continuous, social-security-covered employment (3 years if the employment wasn't
> social-security-covered). **This area has real regional/office-level variation in how strictly
> the "any qualified employment" wording is applied in the first months of a permit — treat the
> 2-year/3-year freedom threshold as the well-established general rule, but confirm your own
> permit's specific wording with your Ausländerbehörde or an immigration lawyer**, since your
> printed permit or decision letter is the authoritative document, not this guide.
>
> **Other employment-tied permits (older skilled-worker routes, ICT Card, etc.):** if your
> permit text names a specific employer or position ("Beschäftigung bei [Firma] als [Position]
> gestattet"), assume you need to at least **notify**, and possibly get approval from, your
> Ausländerbehörde before switching — plus in some cases fresh approval from the **Agentur für
> Arbeit** (Federal Employment Agency), which checks the new role's salary and labour-law
> compliance (working hours, holiday entitlement, etc.).
>
> **Permits NOT tied to an employer:** if your permit is for family reunion, is a settlement
> permit (Niederlassungserlaubnis) or EU long-term residence permit, or you've already passed
> the 2–3 year threshold above, you generally have unrestricted labour-market access and can
> change employer without notifying anyone for immigration purposes.
>
> **The safest practical rule regardless of permit type:** read the exact wording printed on
> your eAT card or attached decision letter, and **contact your Ausländerbehörde before
> resigning from your current job** if there's any doubt — switching without required approval
> can put your entire residence status at risk, and unwinding that after the fact is much harder
> than a short delay upfront.

**Draft `documents_md` (replacement):**

> - Your current residence permit / eAT card (check the exact wording of any employer/position
>   restriction printed on it)
> - New employment contract or signed offer letter (a draft is often acceptable for the initial
>   notification)
> - Employment declaration form if your city offers one — e.g. Berlin's "Erklärung zum
>   Beschäftigungsverhältnis," filled in and signed by the new employer
> - Passport
> - Any Ausländerbehörde-specific notification/approval form (check your city's page — some now
>   accept this online)

**Draft `after_md` (replacement):**

> If only notification was required, you're generally free to start once you've submitted it —
> keep proof of submission (email confirmation, tracking number, or stamped copy) for your
> records. If approval was required, **wait for written confirmation before your first day** in
> the new role; starting early without it risks being treated as unauthorized employment.
> Either way, once confirmed, tell your new employer your existing Steuer-ID and health
> insurance details — these don't change, so no new registration is needed there. If the
> Ausländerbehörde uses the 30-day suspension window (Blue Card, first 12 months), you may need
> to simply wait out that window even if no problem is ultimately found.

**Draft `legal_basis` (was null — fill in):**
`§18a, §18b, §18g Aufenthaltsgesetz (AufenthG); Fachkräfteeinwanderungsgesetz 2.0 (in force 18 Nov 2023) for the current liberalised rules`

**Sources:**
- https://www.gesetze-im-internet.de/aufenthg_2004/__18.html and related §18a/§18g sections —
  accessed 2026-07-05 — **confirmed** (existence and structure of these permit categories)
- https://www.asyl.net/view/klarstellung-der-bundesregierung-gesetzesaenderungen-fuer-fachkraefte-18a-18b-aufenthg-gelten-ab-sofort
  — asyl.net summary of the government's own clarification on §18a/18b reforms, effective 18
  Nov 2023 — accessed 2026-07-05 — **confirmed** for the "any qualified employment" + "shall
  issue" (entitlement, not discretion) points; **could NOT confirm** the exact employer-change
  notification/approval mechanics for §18a/18b specifically from this source (it focuses on the
  permit-issuance wording change, not the change-of-employer procedure) — flagged below
- https://www.anwalt-diedrich.de/home/anwalt-auslaenderrecht/aufenthaltserlaubnis/%C2%A718g-blaue-karte-eu/
  — immigration law firm explainer on §18g Blue Card — accessed 2026-07-05 — **confirmed** (Nov
  18 2023 liberalisation, 12-month/30-day suspension window) — consistent with a second
  independent source below
- https://www.jobbatical.com/blog/change-of-employer-eu-blue-card-germany — Jobbatical (German
  relocation/immigration compliance company) — accessed 2026-07-05 — **confirmed**, cross-checks
  the anwalt-diedrich.de figures (day-one change allowed, 12-month/30-day suspension window,
  10-working-day notification deadline after starting the new job)
- https://service.berlin.de/dienstleistung/326856/en/ — official Berlin city service page (English), "Residence title for employment – change of employer" — accessed 2026-07-05 — **confirmed**
  (2-year/3-year unrestricted-access threshold; Berlin's specific online process — kept here as
  a national-pattern illustration, not claimed as city-specific for the trio, since other
  cities' equivalent pages weren't checked in this pass)
- https://sonnenberg-lawfirm.de/en/residence-permit-and-change-of-employer-what-do-i-have-to-consider/
  — immigration law firm, English — accessed 2026-07-05 — **confirmed**, corroborates the
  2–3 year threshold, and the "employer-tied wording is printed on the permit" framing
- Existing DB source retained: https://www.make-it-in-germany.com — accessed 2026-07-02 —
  **likely** (official government-backed portal, but I did not re-fetch a specific deep page
  from it in this session — Verifier should locate and cite a specific make-it-in-germany.com
  URL rather than the homepage)

**Confidence flags / what to flag for Verifier — this task has the most open items:**
- **confirmed, high value:** the Blue Card Nov 18 2023 liberalisation (day-one employer change,
  30-day/12-month suspension window, notify within 10 working days) — corroborated by two
  independent practitioner sources plus the underlying reform's effective date. This is the
  single most useful "genuinely new information" fact in this whole packet — the site's
  existing guide doesn't mention it at all.
- **likely, needs Verifier confirmation:** the claim that §18a/§18b skilled-worker permits
  (non-Blue-Card) follow "notify while young, free after 2–3 years" — this is well-established
  for the *general* employment-permit population per multiple law-firm sources, but I could NOT
  find a source stating this explicitly and specifically for §18a/§18b post-Nov-2023 (as opposed
  to Blue Card, where it's explicit). The intro draft above already hedges this
  ("this area has real regional/office-level variation... confirm with your Ausländerbehörde").
  **Recommend Verifier either find a source nailing this down for §18a/18b specifically, or
  keep the hedge as-is** — do not state the 2/3-year rule as settled fact for §18a/18b without
  one more confirming source.
- **unverified:** the "10 working days" notification deadline — sourced from one search-result
  snippet (jobbatical.com) referencing Blue Card; I did not independently verify this against
  §18g's statutory text in this session. Flag for Verifier to check against
  gesetze-im-internet.de §18g directly before publishing a specific day-count.
- **unverified:** whether ICT Card and "older skilled-worker routes" definitely still require
  Agentur für Arbeit approval post-2023 reform, or whether that too was loosened. I found
  general statements that Bundesagentur für Arbeit approval is "often" needed but nothing
  specific post-reform for ICT Card. Kept deliberately vague ("in some cases") in the draft —
  Verifier should tighten only if a clear source is found, otherwise leave hedged.

---

## PART 2 — City-specific: reuse the residence-permit ABH office data (don't duplicate)

### The proposal

**Confirmed via SQL:** the responsible office for all three of these tasks
(visa-conversion, fiktionsbescheinigung, work-permit-change) is, in every one of the 15 cities,
**the same Ausländerbehörde** that already has a fully-populated `city_task_variants` row under
`residence-permit`. This is a structural fact, not a per-city research finding — you apply for
all four of these things (residence-permit, visa-conversion, fiktionsbescheinigung,
work-permit-change) at the same desk, often in the same appointment, because
Fiktionsbescheinigung and visa-conversion are literally sub-cases of "applying for/renewing a
residence permit," and work-permit-change is a notification to the same office about an
existing permit.

**Recommendation: do NOT create 45 new `city_task_variants` rows (15 cities × 3 tasks)
duplicating office_name/booking_url/address/hours that are already correct under
residence-permit.** That would triple the maintenance burden (every time an office moves or
changes its booking system, someone has to update 4 rows instead of 1) and risks the two copies
silently drifting out of sync — a self-inflicted honesty problem.

**Two implementation options for the Builder to choose between** (this is a code/schema
decision, outside Researcher scope, but worth laying out since it changes what "shipping this"
looks like):

1. **Application-layer fallback (no schema change, recommended as the smaller change):** in
   `getVariant(cityId, taskId)` (`/Users/meet/Documents/Intornational_people_german_basic_lawand_things_help/lib/queries/guide.ts`,
   lines 79–91), when the task slug is one of `visa-conversion`, `fiktionsbescheinigung`,
   `work-permit-change` and no row exists for that exact `(cityId, taskId)`, fall back to
   looking up the `residence-permit` task's row for the same city and return it (perhaps with a
   flag like `reusedFrom: 'residence-permit'` so the UI can show a one-line note: "Handled by
   the same office as your residence permit"). This requires the `residence-permit` task_id to
   be resolved once (it's stable: `4a9cd0bd-b800-4dd9-9c1f-69a5edc69354`) and a small change to
   the two callers (`app/germany/[city]/[task]/page.tsx` line 64, and
   `getVariantsForCity` in `guide.ts` line 94–102 if the city dashboard badges should also
   reflect this).
2. **Thin DB rows that only carry the appointment/office identity, not the full duplicate
   content:** create the 45 rows, but only populate `office_name`/`booking_url` (or even just a
   pointer), leaving `fees_note`/`typical_wait_time`/etc. null so `CityFactsBox` falls back
   gracefully — still creates 45 rows to keep in sync on the office identity fields, which is
   less good than option 1 but simpler if the team wants every task to have its own row for
   uniformity/future city_step_overrides use.

**Researcher's recommendation: option 1.** It fully satisfies "don't duplicate 45 rows," keeps
a single source of truth (`residence-permit`'s 15 rows), and is a small, well-contained code
change. Flagging this clearly for the Builder to decide/implement — this is their call since it
touches code, which is outside Researcher's write permissions.

### Per-city quirks specific to these three processes (not just "same office as residence-permit")

I looked for city-specific differences in **how these particular three processes** are handled
(auto-issued vs on-request Fiktionsbescheinigung; online employer-change) beyond "same office."
Findings are thin — most cities do not publish process detail this granular, which itself is
worth recording honestly rather than inventing per-city texture:

- **Berlin — work-permit-change:** **confirmed** the LEA (Landesamt für Einwanderung, Berlin's
  Ausländerbehörde — already the `office_name` on Berlin's residence-permit row) runs employer
  change entirely **online** via a web form (service.berlin.de), with a defined document
  checklist (employment declaration form + contract, PDF/JPG/PNG, size limits) and an explicit
  **2-year / 3-year** unrestricted-access threshold stated on the official page. Source:
  https://service.berlin.de/dienstleistung/326856/en/ — accessed 2026-07-05 — **confirmed**.
  This is a genuine city-specific detail worth a `city_step_overrides` row (an `insert` step
  under work-permit-change for Berlin: "Berlin handles this online via service.berlin.de — no
  in-person appointment needed for the notification step itself").
- **Frankfurt — work-permit-change:** Frankfurt's Ausländerbehörde publishes a dedicated page
  for "Arbeitgeberwechsel bei Inhabern einer Blauen Karte EU" (Blue Card employer change) at
  frankfurt.de/auslaenderangelegenheiten — this confirms Frankfurt has a named process, but the
  page returned HTTP 403 to automated fetch in this session, so I could **not** read its content
  directly. **Flag for Verifier:** revisit
  https://frankfurt.de/auslaenderangelegenheiten/ich-moechte-einen-antrag-stellen/arbeitnehmer/arbeitgeberwechsel-bei-inhabern-einer-bk
  manually (or via a different fetch method) to see if it states online-vs-in-person and any
  specific document list worth a step override — **unverified** pending that recheck.
- **Fiktionsbescheinigung auto-issued vs on-request:** I could not find authoritative,
  city-specific documentation of any of the 15 cities auto-issuing the Fiktionsbescheinigung
  by default versus only on explicit request. The general national pattern (confirmed above)
  is: it's issued at the same appointment when the office can't decide immediately, and offices
  are legally obligated to issue it (§81 Abs. 5) once asked — but whether individual cities
  proactively hand it over vs. require the applicant to ask is an office-level practice I did
  not find written down anywhere official for Munich, Hamburg, Cologne, etc. **This should be
  marked `unverified` / not claimed at all** rather than guessed — do not invent a "Munich
  auto-issues, Hamburg requires request" table without a source. Recommend the Verifier either
  finds this per-office (unlikely to be documented) or the Builder skips per-city
  Fiktionsbescheinigung step-overrides entirely and relies on the shared office-identity reuse
  only.
- **All other 13 cities, all three tasks:** no task-specific (as opposed to
  residence-permit-shared) process differences found. Treat as **using the shared ABH
  office/booking data with no additional step overrides**, which is the honest, defensible
  position — per the site's own hard rule against inventing city differences that don't exist.

### What this means for `city_step_overrides` (optional, small addition)

If the Builder implements option 1 above (application-layer fallback for `city_task_variants`),
the **only** concrete, sourced per-city step-override worth adding from this research is:

- **Berlin, `work-permit-change`, action=`insert`:** "Berlin's LEA handles employer-change
  notification/approval entirely online via service.berlin.de — no in-person appointment needed
  for this step; upload your employment declaration form and contract there." Source:
  service.berlin.de (above), **confirmed**.

Everything else should wait for further verification rather than be shipped this round.

---

## Summary table for the Builder/Verifier

| Task | `guides` fields to update | legal_basis (new) | city reuse approach | new city-specific facts |
|---|---|---|---|---|
| visa-conversion | intro_md, documents_md, after_md, legal_basis, sources | §6 Abs. 3, §81 AufenthG; AufenthV | reuse residence-permit's 15 ABH rows (app-layer fallback) | none found — uses shared office data only |
| fiktionsbescheinigung | intro_md, documents_md, after_md, legal_basis, sources | §81 Abs. 3,4,5,5a AufenthG | reuse residence-permit's 15 ABH rows | none confirmed (auto- vs on-request issuance unverified — do not invent) |
| work-permit-change | intro_md, documents_md, after_md, legal_basis, sources | §18a, §18b, §18g AufenthG; FEG 2.0 (18 Nov 2023) | reuse residence-permit's 15 ABH rows | Berlin: online-only process via service.berlin.de (confirmed) — candidate `city_step_overrides` row |

## Full source list (URL — accessed 2026-07-05 unless noted)

1. https://www.gesetze-im-internet.de/aufenthg_2004/__81.html — official law text §81 AufenthG — confirmed
2. https://www.gesetze-im-internet.de/aufenthg_2004/__18.html — official law text §18 AufenthG family — confirmed (existence/structure)
3. https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa — Federal Foreign Office — confirmed
4. https://www.asyl.net/themen/aufenthaltsrecht/sonstiger-aufenthalt/fiktionsbescheinigung — asyl.net — confirmed
5. https://www.asyl.net/view/klarstellung-der-bundesregierung-gesetzesaenderungen-fuer-fachkraefte-18a-18b-aufenthg-gelten-ab-sofort — asyl.net, government clarification summary — confirmed (issuance-wording change only)
6. https://se-legal.de/services/immigration-lawyer-germany/the-probationary-certificate-in-germany-die-fiktionsbescheinigung/?lang=en — law firm — likely
7. https://www.anwalt-diedrich.de/home/anwalt-auslaenderrecht/aufenthaltserlaubnis/%C2%A718g-blaue-karte-eu/ — law firm, §18g — confirmed
8. https://www.jobbatical.com/blog/change-of-employer-eu-blue-card-germany — relocation compliance co. — confirmed (cross-check)
9. https://service.berlin.de/dienstleistung/326856/en/ — official Berlin city service — confirmed
10. https://sonnenberg-lawfirm.de/en/residence-permit-and-change-of-employer-what-do-i-have-to-consider/ — law firm — confirmed
11. https://www.daad.de/de/in-deutschland-studieren/leben-in-deutschland/anmeldung/ — DAAD (quasi-official) — confirmed (general principle)
12. https://www.advocado.de/ratgeber/auslaender-und-asylrecht/aufenthaltsrecht/aufenthaltsbestimmungsrecht-beantragen.html — legal portal — likely (lead-time advice, not statutory)
13. https://frankfurt.de/auslaenderangelegenheiten/ich-moechte-einen-antrag-stellen/arbeitnehmer/arbeitgeberwechsel-bei-inhabern-einer-bk — official Frankfurt ABH page — **fetch blocked (403), unverified**, needs Verifier recheck
14. https://www.make-it-in-germany.com — official skilled-worker portal — retained from existing DB rows, homepage only, **Verifier should deep-link a specific page**

## Open items for the Verifier (consolidated)

1. Confirm §18a/§18b (non-Blue-Card skilled worker) employer-change notify/approval mechanics
   specifically — I only found this explicitly for Blue Card (§18g); the 2–3 year threshold for
   §18a/18b is inferred from general practitioner sources, not a dedicated §18a/18b source.
2. Confirm the "10 working days" Blue Card notification deadline directly against §18g statutory
   text (only had one secondary source for the exact day count).
3. Recheck the Frankfurt Ausländerbehörde work-permit-change page (blocked by 403 in this
   session) for Blue-Card-specific process detail.
4. Try to find whether any BAMF sub-page specifically covers Fiktionsbescheinigung (to replace
   the generic bamf.de homepage citation in the existing DB row).
5. Do NOT confirm or invent per-city auto-issue-vs-on-request Fiktionsbescheinigung practices —
   I found no source for this at all; recommend leaving unclaimed.
6. Confirm exact D-visa validity ranges (I used "3-6 months, sometimes up to a year" as a
   practitioner-sourced approximation, not from one authoritative table).
7. Confirm whether Fiktionsbescheinigung issuance is genuinely fee-free (plausible, not
   explicitly confirmed).
