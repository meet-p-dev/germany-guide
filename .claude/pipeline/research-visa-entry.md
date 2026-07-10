# Research packet — "Visa & Entry Permit" (journey_steps.slug = `entry-visa`)

Researcher run: **2026-07-10**. All web sources accessed **2026-07-10** unless noted otherwise.
Topic 1 of the new "journey step" content series (Visa & Entry Permit → Blocked account →
Provisional health insurance → …).

## 0. What already exists (read first, do not duplicate/contradict)

- `journey_steps` row `entry-visa` (id `ffcfbb3f-08b9-4f0a-b06e-6c533c966454`): phase `pre-arrival`,
  phase_order 1, persona `student`, `task_id = null` (skeleton), `applies_to =
  {student,worker,non-eu,family}`, status `draft`. Its current `note_md` already points to the
  Federal Foreign Office mission finder — keep that fallback, just add the real content behind it.
- Reference tasks (both **published**, both belong to `task_categories.slug = 'residence'`, id
  `64d18633-45e9-4eb9-9d66-dccf8b536f6c`): `residence-permit` (task id `4a9cd0bd-…`) and
  `visa-conversion` (task id `c4f1d623-…`). Their guides establish the site's voice and the
  existing hard rule: *do not invent per-country visa document checklists — link to the AA mission
  finder instead.* This packet's job is to responsibly go further than that rule for the first
  time, with real sourced per-nationality facts, while keeping the same honesty discipline.
- `blocked-account` task (id `9849369a-…`, category `money`) is **already published** and already
  states the blocked-account figure: **~€992/month (~€11,904/year), reviewed annually, 2026
  figure**, sourced to `auswaertiges-amt.de/en/sperrkonto-388600`. **Do not restate a different
  number** in this packet — cross-reference that task instead so the two pages never disagree.
- No existing table captures **per-nationality** variance (only `city_task_variants` /
  `city_step_overrides` exist, and those are for city variance). See §5 "Schema/placement note"
  for how I suggest handling this without a schema change, plus an optional future-table idea.
- `documents_md` renders as plain Markdown via `react-markdown` (`components/Markdown.tsx`), so
  headings/bullet lists work fine — confirmed by reading `app/tasks/[task]/page.tsx` and
  `app/germany/[city]/[task]/page.tsx`.
- `lib/content-schemas.ts` `guideSchema`: `intro_md` ≥100 chars, `documents_md`/`after_md` ≥20
  chars, `steps` array **3–12 items**, `sources` ≥1. My draft below fits these (12 steps exactly).

---

## 1. Proposed task + guide (generic, nationality-agnostic core)

### `tasks` row (new)
| field | value |
|---|---|
| `slug` | `entry-visa` |
| `category_id` | `64d18633-45e9-4eb9-9d66-dccf8b536f6c` (`residence` / "Visa & residence") |
| `title_en` | Visa & Entry Permit |
| `title_de` | Nationales Visum (D) |
| `summary` | Get the correct national (D) visa at the German mission responsible for you before you travel — or check whether your nationality is exempt. |
| `audience` | `{student,worker,non-eu,family}` (matches the existing `journey_steps.applies_to`) |
| `sort_order` | `0` (it must sort **before** `residence-permit` (1) and `visa-conversion` (2) in the same category — it is chronologically first) |
| `locale` | `en` |

Title/title_de deliberately match the existing `journey_steps` row's `title_en`/`title_de` so the
displayed title doesn't change when `journey.ts` starts preferring `task.title_en` over the
skeleton's own `title_en` (see `lib/queries/journey.ts` lines 111–113).

### `guides` row (new, `task_id` = the new task's id)

**`intro_md`** (confidence: mostly `confirmed`, two `likely` items flagged inline):

> Before you can register an address, open a bank account, or do almost anything else in Germany,
> most non-EU/EEA/Swiss nationals need a **national visa — the "D-visa"** — issued by the German
> embassy or consulate responsible for their place of residence, **before travelling**. EU, EEA and
> Swiss citizens do not need any visa (freedom of movement) and are out of scope for this guide.
>
> **Do you actually need one?** A small but important group of nationalities is **exempt even for
> long stays** (work, study, family reunion — not just tourism) and can enter Germany visa-free
> and apply for the residence permit *after* arriving, at the local Ausländerbehörde, within **90
> days** of entry. Per **§41 Aufenthaltsverordnung (AufenthV)**:
> - **Fully exempt, no extra restriction:** nationals of **Australia, Canada, Israel, Japan, New
>   Zealand, the Republic of Korea, the United Kingdom, and the United States** (§41 Abs. 1
>   AufenthV). *Confirmed, quoting the law text directly — see sources.*
> - **Exempt, but may not take up employment before the permit is granted** (except a narrow list
>   of activities under §17 Abs. 2 AufenthV): nationals of **Andorra, Brazil, El Salvador,
>   Honduras, Monaco, and San Marino** (§41 Abs. 2 AufenthV). *Confirmed from the law text; the
>   practical day-to-day effect of the employment restriction is `likely` rather than `confirmed`
>   — the Verifier should look for an official diplo.de explainer of how missions handle this in
>   practice, since I could only find the bare statute plus secondary summaries.*
> - **Everyone else** applies for the D-visa before travelling. Your exact document checklist is
>   decided by the **specific German mission responsible for your country of residence** — look
>   yours up on the [Federal Foreign Office mission finder](https://www.auswaertiges-amt.de/en/about-us/auslandsvertretungen/deutsche-auslandsvertretungen)
>   and follow that mission's own checklist. See §4 below for real, sourced differences we found
>   for several major nationalities — and which ones we could **not** confirm.
>
> **How the application works, generally:** fill in the harmonised **VIDEX** online form
> (videx.diplo.de — 12 languages), print it, then **book an appointment** with your specific
> mission (the booking system itself varies a lot by country — VFS Global, iDATA, the mission's own
> RK-Termin system, or a waiting list — see §4). You must apply **in person**; VIDEX only prepares
> the paperwork; it does not submit the application. At the appointment you submit your documents
> and originals, give biometric data, and pay the fee (**€75 standard, €37.50 for minors** —
> `confirmed`, auswaertiges-amt.de).
>
> **Processing takes weeks to months** depending on your visa category and mission — the Federal
> Foreign Office's own guidance says explicitly not to expect a status update within the first
> ~3 months. Do not rely on a fixed timeline; ask your specific mission.
>
> **Validity:** national visas are usually issued for **up to 90 days** (sometimes longer, rarely
> up to a year, for people who have already been to Germany/Schengen several times before).
> **Your visa sticker states its own expiry date — that date, not a rule of thumb, governs when
> you must apply to convert it into a residence permit** at your local Ausländerbehörde (see the
> `visa-conversion` task, which already covers that step in detail — do not duplicate its content
> here, just hand off to it).

**`documents_md`** (confidence: `confirmed` unless flagged):

> General document categories needed by almost everyone applying for a D-visa (your mission's own
> checklist is still authoritative — this is the shape, not a substitute):
> - Valid **passport** (check your mission's minimum validity requirement)
> - Two completed, signed **VIDEX application form printouts**
> - **One biometric passport photo**, not older than 6 months (standard Schengen/biometric spec:
>   35×45 mm, neutral grey background, neutral expression, no head covering except for continuous
>   religious/medical reasons — `likely`: this exact spec came from secondary photo-compliance
>   sites rather than a first-party auswaertiges-amt.de spec sheet I could load directly; Verifier
>   should confirm against the current official photo sample sheet)
> - **Proof of health insurance.** Travel insurance and another EU country's EHIC card are **not**
>   sufficient. You need either unconditional enrolment confirmation from a German insurer valid
>   from your entry date, or an "incoming" policy with no cancelling conditions for a long-term
>   stay. Practically, the visa can only become *valid* once you present this proof — sometimes
>   accepted at the end of the procedure rather than at the appointment itself. (Sourced from
>   official diplo.de FAQ text; confirmed.)
> - **Proof of financial means** — via a blocked account (Sperrkonto, ~€992/month for students as
>   of 2026 — see the `blocked-account` task, do not restate a different figure here), a
>   declaration of commitment (Verpflichtungserklärung) from someone in Germany, parental
>   income/financial circumstances, or an annually renewable bank guarantee.
> - **Purpose-specific documents** — admission letter (students), employment contract (workers),
>   marriage/birth certificate (family reunion). See §3 for how these differ by persona.
> - The **application fee**: €75 (€37.50 for minors); check whether your category qualifies for a
>   fee waiver (family reunification with a German citizen is a commonly cited waiver case, but I
>   could not confirm the exact current waiver conditions from a first-party source this round —
>   flagged `unverified`, Verifier should check).
>
> *Nationality-specific additions (APS certificates, translation/apostille/legalisation rules,
> which office handles your case, appointment systems) are NOT generic — see the dedicated
> per-nationality section below. Do not assume your nationality isn't listed there means nothing
> differs for you: it means we could not verify anything both real and official for it, and you
> must use the mission finder.*

**`after_md`** (confidence: `confirmed`):

> Once approved, your D-visa is stuck into your passport as a sticker showing its own validity
> window. Travel to Germany within that window. After arrival: **register your address
> (Anmeldung)** — this determines which Ausländerbehörde is responsible for you — and then apply
> to **convert your visa into a residence permit before its printed expiry date** (the
> `visa-conversion` task on this site covers that step in full; this task's job ends at "you have
> a valid D-visa and can travel"). If you are one of the §41 AufenthV-exempt nationalities and
> travelled without a visa, your first formal step in Germany is applying directly for the
> residence permit within 90 days of entry — no visa-conversion step applies to you.

**`legal_basis`**: `§6 Aufenthaltsgesetz (AufenthG) — national visa; §41 Aufenthaltsverordnung
(AufenthV) — exemption for nationals of certain third countries; §17 Abs. 2 AufenthV — narrow
employment exception referenced by §41 Abs. 2`

**`sources`** (JSON array for the guide row):
```json
[
  {"url": "https://www.auswaertiges-amt.de/en/visa-service/215870-215870", "title": "Federal Foreign Office — Visas for Germany (overview, fee, processing time)", "accessed_at": "2026-07-10"},
  {"url": "https://www.gesetze-im-internet.de/aufenthv/__41.html", "title": "§41 AufenthV — exemption for nationals of certain states (official law text)", "accessed_at": "2026-07-10"},
  {"url": "https://daressalam.diplo.de/tz-en/service/2644764-2644764", "title": "Federal Foreign Office — health insurance in the national visa procedure", "accessed_at": "2026-07-10"},
  {"url": "https://rangun.diplo.de/mm-en/service/2296512-2296512", "title": "Federal Foreign Office — national visas for long-term stays (purposes, blocked account reference)", "accessed_at": "2026-07-10"},
  {"url": "https://kuala-lumpur.diplo.de/my-en/service/05-visaeinreise/2261780-2261780", "title": "Federal Foreign Office — VIDEX online application for national visas", "accessed_at": "2026-07-10"},
  {"url": "https://www.auswaertiges-amt.de/en/sperrkonto-388600", "title": "Federal Foreign Office — blocked account mechanics (cross-referenced, not restated)", "accessed_at": "2026-07-05 (per existing blocked-account task)"}
]
```

---

## 2. Suggested `checklist_steps` (12 steps, in order, generic guide)

| step_no | title_en | body_md (short) | doc_names | is_optional |
|---|---|---|---|---|
| 1 | Check whether you're exempt under §41 AufenthV | Nationals of Australia, Canada, Israel, Japan, New Zealand, South Korea, the UK and the USA — and, with an employment restriction, Andorra, Brazil, El Salvador, Honduras, Monaco and San Marino — can skip the D-visa entirely and apply for the residence permit after arrival. Everyone else needs the D-visa below. | [] | false |
| 2 | Find your responsible German mission | Use the Federal Foreign Office mission finder — the mission tied to your place of residence, not nationality, is the one whose checklist governs you. | [] | false |
| 3 | Identify your visa category / purpose | Study, skilled work, job-seeker (Chancenkarte), or family reunion — each has a different core document set (see persona notes). | [] | false |
| 4 | Complete any required pre-checks | Some nationalities need extra steps before they can even apply — e.g. an APS certificate for university applicants with Chinese, Indian or Vietnamese qualifications. Check §4 below for your nationality. | ["APS certificate (if applicable)"] | true |
| 5 | Arrange your financial-means proof | Usually a blocked account; see the `blocked-account` task for current amounts and providers. | ["Blocked account confirmation letter"] | false |
| 6 | Arrange health insurance for the visa | Travel insurance is not enough for the visa itself — get an "incoming" policy or an unconditional-enrolment confirmation letter. | ["Health insurance confirmation letter"] | false |
| 7 | Fill in and print the VIDEX application form | videx.diplo.de — available in 12 languages; you cannot submit it online, only print it for your appointment. | ["VIDEX printout"] | false |
| 8 | Get a biometric passport photo | Not older than 6 months; check your mission's exact photo spec sheet. | ["Biometric photo"] | false |
| 9 | Book your appointment | The booking system differs by country (VFS Global, iDATA, RK-Termin, a waiting list, or the mission's own portal) — see §4 for what we found per nationality. | [] | false |
| 10 | Attend the appointment | Bring all originals + copies + certified German translations where required; biometric data is captured here; pay the fee. | ["Passport", "VIDEX printout", "Purpose-specific documents"] | false |
| 11 | Wait for processing | Weeks to months; do not expect a status update in roughly the first 3 months. | [] | false |
| 12 | Collect your visa and check its printed expiry | Travel before that date; your next step in Germany is Anmeldung, then visa-conversion (or, if exempt, apply for the residence permit directly). | [] | false |

---

## 3. Persona notes — genuinely different core documents

### Student
- **Admission-dependent document**: unconditional university/Studienkolleg admission letter, or —
  for a prospective-student ("Studienbewerber") visa applied for before admission is final — proof
  of application/entrance-exam registration. These are two different visa sub-categories with
  different validity windows; `confirmed` this distinction exists generically, `unverified` the
  exact validity length of the Studienbewerber sub-type this round.
- **APS certificate**: mandatory prerequisite for university applicants whose qualification is
  Chinese, Indian, Mongolian or Vietnamese (not just for the visa — for admission itself). Details
  and per-country sourcing in §4. `confirmed`.
- **Financial proof**: blocked account (~€992/month, 2026 figure) is standard — cross-reference
  the `blocked-account` task, don't restate the number here.
- **Health insurance**: incoming/travel policy is typically enough to get the visa; must be
  converted to full statutory or private German health insurance once enrolled (see the separate
  `health-insurance-provisional` → `health-insurance` journey steps, already published).

### Skilled worker / job-seeker
- **Core document**: a concrete **employment contract or binding job offer** (skilled-worker /
  EU Blue Card routes), OR — for the points-based **Opportunity Card (Chancenkarte)**, introduced
  2024 — proof of a partially/fully recognised qualification plus meeting a points threshold (do
  not invent the exact point values or current salary thresholds for the Blue Card here — these
  change; point to `make-it-in-germany.com` and flag as a `check current figures` item, exactly
  per the site's honesty rule).
- **Qualification recognition**: for regulated professions this can be its own separate,
  months-long process — already covered by the existing `qualification-recognition` task; cross
  reference rather than duplicate.
- **Financial proof**: for the Chancenkarte specifically, the blocked-account task already notes
  the amount is "higher" than the student figure and must be checked with the mission — don't
  invent a number.
- **No A1 German requirement** for the work-visa document set itself (unlike family reunion,
  below) — `likely`: I found no source imposing a blanket language test for skilled-worker/
  job-seeker visas; this is an absence-of-evidence finding, not a confirmed negative, so the
  Verifier should sanity-check it rather than assume it's settled.

### Family reunion (joining a spouse/partner in Germany)
- **Core documents**: marriage certificate (often needing translation + apostille/legalisation —
  genuinely nationality-dependent, see §4), proof of the sponsor's status in Germany (residence
  permit or citizenship), proof of adequate housing/income of the sponsor.
- **A1 German language certificate is required for spouses joining a partner**, under §30 AufenthG
  — a real, sourced, persona-specific hurdle that neither the student nor worker path has.
  `Confirmed` — quoting an official diplo.de FAQ directly:
  > "All family reunion applicants desiring to join their spouse residing in Germany have to
  > provide proof that they possess a sufficient basic knowledge of the German language"
  > (A1, CEFR), via a standardised ALTE-compliant exam (e.g. Goethe-Institut "Start Deutsch 1").
  - **Documented exemptions**: physical/mental illness or disability preventing language
    acquisition; the sponsoring spouse holds an EU Blue Card, is a recognised skilled worker,
    researcher, self-employed permit holder, or ICT-card holder (specific AufenthG sections);
    the sponsor holds a settlement permit obtained via one of those routes; certain
    refugee-sponsor marriages that pre-date the sponsor's move to Germany. Missions examine other
    cases individually.
  - Source: `https://dhaka.diplo.de/bd-en/service/2685180-2685180` (Federal Foreign Office FAQ,
    hosted on the Dhaka mission's site but stating the general federal policy under §30 AufenthG —
    `confirmed`, accessed 2026-07-10).

---

## 4. Per-nationality section — what's genuinely different, sourced

Legend: **confirmed** = seen live on an official source just now · **likely** = strong secondary
corroboration but I could not load the first-party page directly · **unverified** = flagged
explicitly, Verifier should chase it.

### 🇮🇳 India — well documented, mostly confirmed
- **Appointment booking**: all national-visa appointments run through **VFS Global**'s online
  system; the mission's own RK-Termin portal remains in use for some consulates (Bangalore/Chennai
  noted specifically for booking glitches). **confirmed**.
- **APS certificate**: mandatory since **October 2022** for applicants to German
  bachelor's/master's degree programmes (also for scholarship holders and PhD/postdoc in some
  cases). **confirmed**.
- **Document authentication quirk** (flagging clearly because it's counter-intuitive): the
  mission's own FAQ states that **"attestation or apostille of Indian documents is not recognised
  by German authorities"** for the visa file — despite India being a Hague Apostille Convention
  member since 2005 (hcch.net, confirmed). This looks like a real, specific India quirk (the
  mission wants originals or its own document verification, not just an Indian apostille stamp),
  but it is surprising enough that the **Verifier should double-check this is still current
  policy** before it goes live — mark **likely**, not fully confirmed, despite being quoted
  directly from india.diplo.de.
- **Financial proof**: blocked-account figure quoted on india.diplo.de matches the site's existing
  `blocked-account` task figure (~€992/month) — internally consistent, **confirmed**.
- **English-proficiency proof**: a recognised English test certificate is required for
  English-taught programmes; a university's own exemption letter is explicitly **not** accepted.
  **confirmed**.
- Sources: `https://india.diplo.de/in-en/service/2546328-2546328` (National Visa FAQs, Federal
  Foreign Office, accessed 2026-07-10); `https://india.diplo.de/in-en/ueber-uns/mumbai/visa-newsletter-04oct2022/2566330`
  (APS introduction newsletter, accessed 2026-07-10); `https://www.hcch.net/en/instruments/conventions/status-table/?cid=41`
  (Apostille Convention status table, accessed 2026-07-10).

### 🇨🇳 China — confirmed on the structural facts, thinner on process detail
- **APS certificate**: mandatory prerequisite for most applicants with Chinese academic
  qualifications, run by the **Akademische Prüfstelle (APS)** — an official joint institution of
  the German Embassy Beijing's Culture Department and DAAD, not a private company. Without the APS
  seal, German universities generally will not admit the applicant and the embassy will not issue
  the study visa. **confirmed** (aps.org.cn is the APS's own official site, run jointly with the
  embassy).
- **Apostille Convention**: China (Mainland) became a Hague Apostille Convention member, **in
  force from 7 November 2023** — Chinese public documents can now be apostilled instead of needing
  the older, slower full consular-legalisation chain. This is a genuine, dateable, confirmed
  change (hcch.net direct fetch). Note: this does **not** apply to Hong Kong/Macau as separate
  entries in the same table — flagged for the Verifier to double check if any China-based
  applicant is actually a Hong Kong/Macau resident.
- **Visa application centres**: processing for the German mission's visa applications in China
  runs through VFS Global centres in Beijing, Shanghai, Guangzhou, Chengdu and Shenyang — **likely**
  (secondary-sourced; I could not load a china.diplo.de/peking.diplo.de page directly this round —
  both direct fetches 404'd).
- Sources: `https://www.aps.org.cn/uber-uns` and `https://www.aps.org.cn/verfahren-und-services-deutschland/chinaverfahren`
  (APS official site, accessed 2026-07-10); `https://www.hcch.net/en/instruments/conventions/status-table/?cid=41`
  (accessed 2026-07-10).

### 🇺🇸 USA — the single biggest confirmed differentiator in this whole packet
- US citizens are **fully exempt from the D-visa** under **§41 Abs. 1 AufenthV** — they can enter
  Germany with just their passport for work, study, or family reasons and apply for the residence
  permit **after arrival**, at the local Ausländerbehörde, within 90 days. **confirmed** directly
  from the law text.
- **One real exception**: if employment is meant to start **immediately upon arrival**, the
  work-permit-carrying visa must still be obtained in advance, because it is not legally possible
  to start work in Germany before the work permit exists — **confirmed**, quoted from
  germany.info: "in cases where an employment is intended to begin directly after arrival in
  Germany, a visa (which includes the work permit) has to be issued in advance."
- Sources: `https://www.gesetze-im-internet.de/aufenthv/__41.html` (accessed 2026-07-10);
  `https://www.germany.info/us-en/service/visa/employment-visa-922292` and
  `https://www.germany.info/us-en/service/visa/study-visa/916776` (accessed 2026-07-10).

### 🇧🇷 Brazil — confirmed via the law, one nuance flagged
- Brazil is in the **second tier** of §41 AufenthV (Abs. 2, alongside Andorra, El Salvador,
  Honduras, Monaco, San Marino): Brazilians can also enter visa-free and apply for the residence
  permit within Germany within 90 days — **confirmed**, quoted from the law text directly.
- **Genuine difference from the US/Canada/etc. tier**: Abs. 2 nationals **may not take up
  employment** during the visa-free window (except a narrow set of activities under §17 Abs. 2
  AufenthV) until the residence permit/work permit is actually granted. **confirmed** the
  restriction exists in the statute; **likely/unverified** exactly how strictly or loosely this is
  applied in practice day to day — I could not find an official diplo.de explainer walking through
  it operationally, only secondary aggregator summaries that mostly glossed over the Abs. 2
  employment restriction entirely. **Flag for the Verifier**: confirm with a Brasília/São
  Paulo/Rio diplo.de page if one exists.
- Source: `https://www.gesetze-im-internet.de/aufenthv/__41.html` (accessed 2026-07-10).

### 🇳🇬 Nigeria — thin; one confirmed structural fact, rest is honest "could not verify"
- **Office split**: German Embassy **Abuja** processes only a limited set of national-visa
  categories (depending on the applicant's state of residence); the **Consulate General Lagos**
  handles the rest. **likely** — this is quoted/paraphrased from Google-cached snippets of
  nigeria.diplo.de pages; my direct WebFetch of the specific pages returned 404 both times I tried
  (`nigeria.diplo.de/ng-en/2691078-2691078` and `.../2691076-2691076`), so I could not verify this
  live myself this round. **The Verifier should re-fetch nigeria.diplo.de directly.**
- **Apostille Convention**: Nigeria is **not** a contracting party (hcch.net status table,
  confirmed directly) — meaning Nigerian public documents (birth/marriage/police-clearance
  certificates) need the older **full consular legalisation chain** (Nigerian federal
  authentication + German Embassy legalisation), not a simple apostille stamp. This is a genuine,
  confirmed (via the primary treaty registry) practical burden that several of the other countries
  on this list don't have. **confirmed**.
- **No APS requirement found for Nigeria** — noted as an absence-of-evidence finding, not
  invented.
- Sources: `https://www.hcch.net/en/instruments/conventions/status-table/?cid=41` (accessed
  2026-07-10); nigeria.diplo.de content only via WebSearch snippets, not a direct fetch — see
  caveat above.

### 🇹🇷 Turkey — confirmed, and I caught my own mistake mid-research (see note)
- **Important correction I made during this research run**: my first fetch was of the
  tuerkei.diplo.de page for *non-Turkish residents of Turkey* applying at the German mission there
  (which centralises at the **Istanbul Consulate General only**) — that is a different population
  from actual **Turkish citizens**. I re-fetched the correct page for Turkish citizens themselves.
  Flagging this so the Verifier double-checks I didn't leave any bleed-through between the two.
- **For Turkish citizens**: national-visa applications can be handled by the **Embassy in Ankara**,
  the **Consulates General in Istanbul and Izmir**, and the **Consulate in Antalya** — not
  centralised the way non-Turkish-resident applications are. **confirmed**, direct fetch of
  `tuerkei.diplo.de/tr-de/service/05-visaeinreise/2703120-2703120`.
- **Appointment system**: exclusively through the external provider **iDATA** (not VFS Global, not
  VIDEX submission) — a **~€12 booking fee** plus a separate **~€39.92 service fee**, both payable
  in Turkish Lira, on top of the official €75 visa fee. **confirmed**.
- **Processing-time figures I found earlier** (family reunion 8–12 weeks, studies without
  scholarship 5 weeks, employment with pre-approval/Blue Card 4 weeks) came from the *non-Turkish
  residents* page, not the Turkish-citizens page — **I am deliberately not asserting these for
  Turkish citizens** since I couldn't confirm they carry over. **unverified for Turkish citizens
  specifically** — Verifier should pull processing times from the correct page if needed.
- Sources: `https://tuerkei.diplo.de/tr-de/service/05-visaeinreise/2703120-2703120` (Turkish
  citizens, accessed 2026-07-10); `https://tuerkei.diplo.de/tr-de/service/05-visaeinreise/2170670-2170670`
  (non-Turkish residents — cited only for the contrast, not for Turkish-citizen facts, accessed
  2026-07-10).

### 🇵🇰 Pakistan — honestly thin; only one solid confirmed fact
- **Apostille Convention**: Pakistan became a member, **in force from 9 March 2023** (hcch.net,
  confirmed directly) — a relatively recent change, meaning Pakistani applicants can now use an
  apostille rather than full legalisation, but this is recent enough that older secondary guides
  may still describe the pre-2023 legalisation process. Flag for Verifier to make sure this is
  reflected correctly and isn't contradicted by an older pakistan.diplo.de page.
- **Appointment system**: a **waiting-list model** (register online, get placed on a list, invited
  once a slot exists) for both the Islamabad Embassy and Karachi Consulate General, with an
  explicit official fraud warning ("if you are asked for money at this stage of the visa process,
  the person asking is a fraudster") — **likely**: sourced via WebSearch snippets of
  pakistan.diplo.de; my direct fetch of `pakistan.diplo.de/pk-en/service/visa-longterm-1676102`
  loaded but did not surface this waiting-list detail itself (it only gave the general visa
  category list), so I'm not fully confirming this on a first-party read this round.
- **I could not confirm any Pakistan-specific document/checklist differences** beyond the generic
  categories in §1 — saying so honestly rather than guessing, per the site's hard rule.
- Sources: `https://www.hcch.net/en/instruments/conventions/status-table/?cid=41` (accessed
  2026-07-10); `https://pakistan.diplo.de/pk-en/service/visa-longterm-1676102` (accessed
  2026-07-10, thin result — see caveat above).

### 🇻🇳 Vietnam — confirmed, and the most time-sensitive fact in this whole packet
- **APS certificate**: mandatory for Vietnamese applicants with Vietnamese academic
  qualifications applying to German bachelor's/master's programmes (school graduates without a
  Vietnamese university degree, Cao Đẳng graduates, second-bachelor's/master's applicants, and
  applicants to purely artistic programmes). **Exempt**: applicants pre-selected for a DAAD or
  MOET public scholarship, and doctoral candidates. Without a valid APS certificate, the German
  Embassy Hanoi and Consulate General Ho Chi Minh City will not even accept the visa application —
  **confirmed**, direct fetch of the APS's own vietnam.diplo.de page. Since 1 Nov 2023, APS issues
  a digitally signed "DigZert" certificate rather than paper.
- **Apostille Convention — time-sensitive**: Vietnam deposited its instrument of accession on
  **31 December 2025**, but the Convention only **enters into force for Vietnam on 11 September
  2026** (hcch.net status table, confirmed directly). **As of today (2026-07-10), Vietnam is NOT
  YET a member** — Vietnamese public documents still need the traditional full consular
  legalisation chain right now. This will change partway through this content's likely shelf
  life — flag clearly in the published copy with a "check whether this has taken effect yet" note,
  and the Verifier/Builder should consider a dated note or a reminder to revisit after
  2026-09-11.
- Sources: `https://vietnam.diplo.de/vn-de/willkommen/aktuelles/aps-1236800` (APS official page,
  accessed 2026-07-10); `https://www.hcch.net/en/instruments/conventions/status-table/?cid=41`
  (accessed 2026-07-10).

### Countries considered but not written up
I limited deep per-country research to the eight above (matching the brief's suggested set). I did
not research further nationalities this round — if the Verifier or a future cycle wants to extend
this list (e.g. Iran, Egypt, Ukraine, Philippines — all plausible large applicant groups), it
should follow the same discipline: only add a country subsection when there's a genuine, sourced,
official-channel fact, and explicitly note when there isn't one.

---

## 5. Schema/placement note (for Verifier/Builder/Planner judgment, not a demand)

There is currently no DB structure for "facts that vary by nationality" — only `city_task_variants`
/ `city_step_overrides` exist, and those are keyed to city, not nationality. For this cycle, my
draft above places the per-nationality material as a clearly-headed Markdown section (the
"per-nationality section" content in §4) that could be appended to `documents_md` as further
`##`-level subsections (`react-markdown` renders this fine, confirmed by reading
`components/Markdown.tsx` and its two call sites). That's a zero-schema-change way to ship this
cycle.

If this "real per-nationality facts" approach is meant to recur for other topics later in the
series (the brief mentions blocked account, provisional health insurance, etc. — though those are
federally uniform and likely won't need this), a small dedicated table mirroring
`city_task_variants` (e.g. `task_nationality_notes`: `task_id`, `country_code`, `note_md`,
`confidence`, `sources` jsonb, `last_verified_at`) would let this render as a structured table/grid
instead of a markdown wall of text. I am **not** proposing this as something to build now — it's a
future-cycle idea for the Planner to weigh, since schema changes are the Builder's call with the
user's sign-off, not mine to enact.

---

## 6. Summary of confidence flags (for the Verifier's triage)

**High-confidence, re-check quickly:**
§41 AufenthV country lists and conditions (primary law text, quoted directly); US exemption +
germany.info employment-start exception; health-insurance rule (travel insurance insufficient);
VIDEX process description; Vietnam APS + Vietnam's Apostille non-membership-until-Sept-2026;
India's VFS Global + APS-since-Oct-2022; China's APS via aps.org.cn; family-reunion A1 requirement
+ exemptions (dhaka.diplo.de); Apostille Convention status table for all 8 countries
(hcch.net direct fetch).

**Needs the Verifier's attention specifically:**
1. India's "attestation/apostille not recognised" claim — surprising, quoted directly, but flagged
   `likely` not `confirmed` given how counter-intuitive it is.
2. Brazil's §41 Abs. 2 employment restriction — confirmed in the statute, but I found no official
   diplo.de walk-through of how it plays out practically.
3. Nigeria's Abuja/Lagos office split — I could not load nigeria.diplo.de directly (404 both
   times); this rests on WebSearch snippets only.
4. Pakistan's waiting-list appointment system — same caveat, thin sourcing, and I found **no**
   Pakistan-specific document differences at all worth publishing beyond the generic list.
5. The biometric-photo spec (35×45mm etc.) — sourced from secondary photo-compliance sites, not a
   first-party AA spec sheet I could load this round.
6. The family-reunification visa fee waiver claim in §1 documents_md — explicitly marked
   `unverified`, should be confirmed or cut before publishing.
7. Turkey: make sure the processing-time figures from the *non-Turkish-residents* page never get
   attributed to Turkish citizens in the final copy — I kept them separate on purpose.

**Nothing in this packet should be published with invented exact figures** — every number either
has a source+date attached or is explicitly flagged as unverified/needing a check-current-figures
note, per the site's hard rule.
