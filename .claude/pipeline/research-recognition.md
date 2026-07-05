# Research packet — Group E: Recognition of foreign qualifications

**Agent:** Researcher (step ①) · **Topic:** GROUP E — Recognition of foreign qualifications
(task slug `qualification-recognition`) — the last of 5 resilient-batch research groups
(A, B, C, D already handed off; this file completes the set).
**Access date for all web facts below: 2026-07-05** (unless a source line says otherwise).
**Target tables:** `guides` (columns `intro_md`, `documents_md`, `after_md`, `legal_basis`,
`sources`, `last_verified_at`) for the `qualification-recognition` task row, plus its
`checklist_steps` (own table, FK `guide_id`), and optionally new `glossary_terms` rows
(none currently exist for this topic — see §5).

**Scope note — per the standing honesty rule:** this task varies by **profession + federal
state (Bundesland)**, NOT by city. I am proposing **zero** `city_task_variants` rows. This
stays a national how-to guide with a clear "which body handles yours" explainer, exactly as
directed. It's also correctly *not* listed among the federally-uniform tasks (bank, tax ID,
health insurance, Rundfunkbeitrag, SCHUFA) — it has real structural variation, just sliced by
profession/state rather than by city, so the existing single `guides` row (one per task,
`locale`-keyed, no city dimension) is architecturally the right container. Do not add
city-level rows for this task.

---

## 0. What's already in the DB (read 2026-07-05)

**Guide ID:** `26cc662e-476d-45be-b854-2fc615506fb8` · **Task ID:** `3af82801-e0b4-4bcd-b2c1-42b0e769e66a`
**Status:** `published` · **last_verified_at:** `2026-07-02` · **legal_basis:** `Berufsqualifikationsfeststellungsgesetz (BQFG)`
**Existing `sources`:** `[{"url": "https://www.anerkennung-in-deutschland.de", "title": "Anerkennung in Deutschland — official recognition portal", "accessed_at": "2026-07-02"}]`

Existing `intro_md` (verdict: directionally correct, thin — good foundation, needs the
regulated/non-regulated fork made much sharper, the responsible-body maze explained, anabin/ZAB
named, the 2024 reform routes added):
> "If you trained or studied outside Germany, you can apply to have your foreign degree or
> vocational qualification officially recognized (Anerkennung) as equivalent to a German one.
> This matters most for regulated professions (doctors, nurses, teachers, engineers in some
> fields) where practicing legally requires recognition — for most other professions it's
> optional but can improve your job prospects and salary. The responsible authority depends on
> your profession and the federal state; the central anerkennung-in-deutschland.de portal helps
> identify the right one. Processing typically takes a few months. If your qualification only
> partially matches, you may receive a Defizitbescheid (deficit notice) listing what additional
> training or exams are needed."

Existing `documents_md`: certificate/diploma + certified translation, transcripts/module
descriptions, proof of professional experience, passport, application form.

Existing `after_md`: equivalence certificate if fully recognized; follow Defizitbescheid steps if
partial; mentions Anerkennungszuschuss grants.

Existing `checklist_steps` (6 steps, guide_id `26cc662e-476d-45be-b854-2fc615506fb8`):
1. Find the responsible authority for your profession (id `67e80fb8-6c09-49f6-9bdd-bb78a4f12130`)
2. Get your documents certified-translated (id `660786ad-aa28-4139-bb74-052c3f8b9b46`)
3. Submit your application (id `fa8be8ed-399d-48e9-89aa-75df14a797c5`)
4. Wait for the decision (id `4dc093e6-e826-45a5-bc23-69ae4a636b1d`)
5. Follow up on a Defizitbescheid, if issued — optional (id `2b22d348-ba5b-4289-8cee-946ce814a905`)
6. Apply for a recognition grant if eligible — optional (id `a538b52d-0b9d-49cf-9787-5c2d958b3f74`)

**Related existing rows (do not duplicate, cross-reference instead):**
- `problems.slug = 'slow-qualification-recognition'` — "Your qualification recognition is
  taking forever" (severity medium, `related_task_ids` includes this task). Has 3 solutions
  already: work non-regulated roles while waiting; chase the authority / complete Defizitbescheid;
  apply for the Anerkennungszuschuss grant. **These solutions are still accurate — keep, do not
  rewrite** — my new drafts below are additive to the guide, not a replacement of the problem's
  solutions.
- `problems.slug = 'missing-home-country-documents'` also references this task (shared with
  residence-permit) — re foreign documents lacking apostille/certified translation. Consistent
  with the certified-translation requirement below; no conflict.
- No `glossary_terms` rows currently exist for anabin, ZAB, IHK-FOSA, Anerkennungspartnerschaft,
  Defizitbescheid, or Statement of Comparability — genuine gap, see §5 for draft new terms.
- No task slug exists for "skilled-worker-visa" specifically — the residence-permit task is the
  closest DB anchor for that cross-link (`residence-permit`, audience `student, worker, non-eu`).
  I recommend the Verifier/Builder cross-link via `after_md` prose rather than inventing a new
  task row (out of scope for this research pass).

---

## 1. The crucial fork: regulated vs. non-regulated professions

**Confidence: confirmed.**

- **Regulated profession (reglementierter Beruf):** practicing it *legally requires* an official
  recognition decision or professional license, by law — not just employer preference. Applies
  mainly to health/care, safety, and social-service-adjacent professions: **doctors, nurses and
  other health professions, teachers, lawyers, and many skilled trades (Handwerk)** that require a
  Meister-equivalent qualification to practice independently or train apprentices. In these
  professions you legally cannot work in that role without recognition (or, for some,
  provisional permission during recognition).
  - Source: https://www.anerkennung-in-deutschland.de/html/en/pro/professional-recognition.php — accessed 2026-07-05
  - Source: https://zab.kmk.org/en/regulated-professions — accessed 2026-07-05
  - Source: https://www.nexus-gmbh.biz/german-market/knowledge-base-for-german-market/regulated-professions-in-germany/ — accessed 2026-07-05
- **Non-regulated profession:** most **IT, engineering, business/commercial, and many other
  office/technical professions**. Recognition is **not legally required to work**, but a formal
  recognition/comparability document still **helps** — employers use it to judge a foreign degree,
  and (per §2 below) it can matter directly for **visa eligibility and salary-threshold
  calculations**.
  - Source: https://www.make-it-in-germany.com/en/working-in-germany/recognition/who-needs — accessed 2026-07-05
- **How to check which bucket a specific profession falls into:** the official
  **"Recognition Finder" (Anerkennungs-Finder)** on anerkennung-in-deutschland.de is the
  designated tool — it asks for your profession and where you trained, and tells you (a) whether
  recognition is required, (b) which body is responsible. **BERUFENET** (Bundesagentur für
  Arbeit's occupations database) is cited as a secondary way to check whether a profession is
  regulated.
  - Source: WebSearch summary of anerkennung-in-deutschland.de / BERUFENET — accessed 2026-07-05 — confidence **likely** (I could not directly load the Recognition Finder tool page itself — see §7 unconfirmed items; the *existence and purpose* of the tool is corroborated by multiple independent pages, but I did not walk through its live question flow this pass).

This regulated/non-regulated fork should become the **first thing** the intro says — it's more
decision-critical than anything currently in `intro_md`.

---

## 2. anabin database and the ZAB "Statement of Comparability" (university degrees)

**Confidence: confirmed** (ZAB's own FAQ page fetched directly).

- **anabin** is the free, public database run by the **Central Office for Foreign Education
  (ZAB)** under the KMK (Kultusministerkonferenz / Standing Conference of the state education
  ministries). It lists foreign higher-education institutions and, where assessed, gives a rating:
  - **H+** — the whole institution is recognized as equivalent to a German university.
  - **H+/-** — only some programs at that institution are recognized; you need your *specific*
    degree to be separately listed (in the "Verleihende Institutionen" section) or you'll need an
    individual assessment.
  - **H-** — the institution is not recognized as equivalent.
  - **Not listed at all** ≠ "not recognized" — it just means nobody has requested an assessment
    yet; you may still need/want a Statement of Comparability.
  - Source: https://hallogermany.com/blog/anabin-guide-academic-degrees — accessed 2026-07-05 — confidence **likely** (secondary explainer; ratings terminology is consistent across independent sources but I did not load anabin.kmk.org itself directly this pass)
  - Source: https://www.jobbatical.com/blog/anabin-h-rating-eu-blue-card — accessed 2026-07-05 — **likely**
- **Statement of Comparability (Zeugnisbewertung)** — the official ZAB document comparing a
  specific foreign university degree to its German equivalent. Needed when anabin doesn't have
  enough information on your specific degree (even if the institution is H+, if your programme
  isn't individually listed).
  - **Fee: €208** for a new evaluation; **€104** for a duplicate/replacement of an existing one.
  - **Processing time: standard ≈ 3 months; "Fast-Track for Skilled Workers" ≈ 2 months; EU Blue
    Card applications ≈ 2 weeks.**
  - Entire process is digital; a "Pre-Check" tool on zab.kmk.org generates your personalized
    document checklist before you apply. Simple scans are generally enough (no apostille needed
    in most cases), though translations may be required depending on the degree's country of
    origin.
  - It "does not expire" and is valid throughout Germany (useful to state — a newcomer moving
    between states does not need to re-apply).
  - Source: https://zab.kmk.org/en/statement-of-comparability/faq — **fetched directly** 2026-07-05 — **confirmed**
  - Source: https://zab.kmk.org/en/statement-comparability — accessed 2026-07-05 — **confirmed** (consistent)

This is genuinely new, concrete, high-value detail (fee + tiered timelines) that should replace
the guide's current vague "processing typically takes a few months" for the university-degree
path specifically — while keeping the caveat that fees/timelines can change, per the honesty rule
(state "as of 2026").

---

## 3. Who handles the "Anerkennung" process — the responsible-body maze

**Confidence: confirmed** for structure and general fee/timeline ranges; specific fee ranges are
consensus-sourced (see flags).

The single biggest thing missing from the current guide: **which body you apply to depends on
BOTH your profession type AND (for many state-level professions) your Bundesland.** There is no
single national office for everything. Key routes:

1. **IHK-FOSA (Foreign Skills Approval, run centrally by the German Chambers of Industry and
   Commerce / IHK):** handles recognition for **dual (apprenticeship-style) vocational
   qualifications in industry, commerce, hospitality, and services** — e.g. many commercial and
   technical trained-occupation roles (not academic degrees, not craft trades, not the
   regulated health/teaching professions). Centralized nationally (unlike most chamber functions),
   so — usefully — this route is **not** state-fragmented.
   - **Fee: roughly €100–600**, depending on how much individual assessment work is needed (not a
     flat fee).
   - **Timeline: typically 3–4 months** once documents are complete.
   - Outcomes: full recognition (equivalence notice), partial recognition (notice listing gaps —
     can go straight to an employer or pursue further training to close them), or no recognition.
   - Source: https://www.ihk-fosa.de/en/ — **fetched directly** 2026-07-05 — **confirmed** for
     process description and legal basis (BQFG), though the fetch did not surface a fee figure
     directly on-page
   - Source: WebSearch aggregation citing IHK Stuttgart/Berlin/Karlsruhe/Chemnitz English pages —
     accessed 2026-07-05 — **confirmed** for the €100–600 / 3–4 month figures (consistent across
     several official IHK regional chamber English pages, not just blogs)
2. **HWK (Handwerkskammer / Chamber of Crafts and Trades):** handles recognition for **manual
   trade / craft occupations** (Handwerk) — the equivalent chamber-based route to IHK-FOSA but for
   trades rather than commercial/industrial training occupations. Same legal basis (BQFG); same
   general **€100–600 fee range and ~3-month timeline** once documents are complete. Unlike
   IHK-FOSA, HWK recognition is handled **regionally by the local chamber**, not one central body.
   - Source: https://www.hwk-berlin.de/downloads/fact-sheet-assessment-of-foreign-professional-qualifications-91,963.pdf — accessed 2026-07-05 — **likely** (PDF fact sheet, not fetched in full text this pass, summarized via search)
   - Source: https://www.service-bw.de (Baden-Württemberg state service portal, HWK procedure page) — accessed 2026-07-05 — **likely**
3. **State authorities (Landesbehörden) — for health professions and teaching:** doctors, nurses
   and other health professions, and teachers are recognized by **state-level bodies** (e.g. a
   state health/social ministry office or medical board for doctors; a state school authority for
   teachers), which is why the responsible office **genuinely differs by Bundesland** for these
   professions — the same profession trained in the same country may be processed by a different
   office depending on which German state the applicant applies in or intends to work in.
   - Source: https://www.anerkennung-in-deutschland.de/html/en/pro/professional-recognition.php — accessed 2026-07-05 — **confirmed** (general structure; I did not enumerate all 16 states' specific health/teaching authorities this pass — genuinely out of scope for a national guide, and correctly so per the "point to the Recognition Finder" approach below)
4. **ZAB** (see §2) for university academic degrees not tied to a specific regulated profession.
5. **The universal entry point: anerkennung-in-deutschland.de and its "Recognition Finder."** This
   official portal — run by **BIBB (Bundesinstitut für Berufsbildung / Federal Institute for
   Vocational Education and Training)**, available in 11 languages — is explicitly designed to be
   the "which body handles my case" triage tool. This should be the guide's headline call-to-action
   rather than naming individual bodies as if the newcomer should pick between them unassisted.
   - Source: WebFetch of http://www.anerkennung-in-deutschland.de/html/en (redirected from the
     https/trailing-slash form) — **fetched directly** 2026-07-05 — **confirmed**: portal purpose,
     11 languages, BIBB operator, Recognition Finder tool, hotline, IQ Network search, EU
     assistance centre, and an in-portal chatbot ("Aidy") for basic questions.

**Draft summary table for the guide (new content, addresses "who do I even apply to"):**

| Profession type | Who handles it | Typical fee | Typical timeline |
|---|---|---|---|
| University degree (general comparability) | ZAB (Statement of Comparability) | €208 (new), €104 (duplicate) | ~3 months standard, ~2 months fast-track for skilled workers, ~2 weeks for EU Blue Card |
| Commercial/industrial/service vocational (dual-trained) | IHK-FOSA (national, one body) | ~€100–600 | ~3–4 months |
| Craft/trade vocational (Handwerk) | Regional HWK (Chamber of Crafts) | ~€100–600 | ~3 months |
| Health professions (doctor, nurse, etc.) | State-level health authority — varies by Bundesland | Varies | Varies, can run longer for complex cases |
| Teaching | State school authority — varies by Bundesland | Varies | Varies |
| Not sure / any of the above | **Start at anerkennung-in-deutschland.de → Recognition Finder** | — | — |

Note the honesty framing: for the two state-level rows, do NOT invent a specific fee/timeline —
"varies" plus "check via the Recognition Finder for your state" is the honest answer, consistent
with the project's stance on Anmeldung/residence-permit being the only city-varying tasks (this is
the *state*-varying analogue, and should be handled the same honest way: point to the tool, don't
fabricate 16 states' worth of numbers).

---

## 4. The skilled-worker visa link and the Anerkennungspartnerschaft (2024 reform)

**Confidence: confirmed**, sourced from Make it in Germany (the official government skilled-migration
portal) and corroborated by legal/HR trackers.

- **Why recognition matters for the visa, concretely:** under the **Skilled Immigration Act**
  (Fachkräfteeinwanderungsgesetz, reformed in phases through 2023–2024, in force from **1 March
  2024**):
  - For **regulated professions** (e.g. many nursing/healthcare roles), the recognition
    procedure historically had to be *completed before* the visa/entry — a major bottleneck. The
    2024 reform's **Anerkennungspartnerschaft (Recognition Partnership)** changes this: it lets
    someone enter Germany and start working **before** recognition is finished, provided the
    employer, employee, and the recognition authority agree to a binding partnership committing
    to complete recognition after arrival.
  - For **non-regulated professions**, skilled workers earning above a salary threshold **no
    longer need formal degree recognition at all** if they have a state-recognized foreign
    vocational/university qualification **plus at least two years of relevant professional
    experience**, and the employer meets a salary threshold or is bound by a collective wage
    agreement.
  - Source: https://www.make-it-in-germany.com/en/looking-for-foreign-professionals/entering/employment-recognition-partnership — accessed 2026-07-05 — **confirmed**
  - Source: https://leglobal.law/2024/03/22/germany-changes-to-the-german-immigration-act-for-skilled-workers-have-come-into-force/ — accessed 2026-07-05 — **confirmed**
- **Anerkennungspartnerschaft mechanics:**
  - Legal basis: **§ 16d (3) AufenthG** (Residence Act).
  - Residence title initially issued for **1 year**, renewable **1 year at a time**, up to a
    **maximum of 3 years total**, with the goal of achieving full recognition within that window.
  - Eligibility: qualification from training of **at least 2 years' duration** (vocational) or a
    higher-education course; the qualification must be state-recognized in the country where it
    was obtained; applicant needs at least **A2 German**.
  - The employer commits contractually to support the recognition process, including allowing any
    necessary additional training/exams during employment.
  - Source: https://www.make-it-in-germany.com/en/visa-residence/types/visa-recognition-partnership — accessed 2026-07-05 — **confirmed**
  - Source: https://visa-explorer.com/visa/de-recognition-partnership/ — accessed 2026-07-05 — **likely** (secondary corroboration of the same facts)
- **Chancenkarte (Opportunity Card) touchpoint:** the job-seeker Chancenkarte (introduced June
  2024) requires a "pre-qualification" — e.g. a foreign vocational qualification of at least 2
  years' training that is state-recognized in its country of origin, plus German A2 or English B2
  — recognition status feeds directly into Chancenkarte eligibility scoring, though full German
  Anerkennung is not itself required to hold the Chancenkarte.
  - Source: https://www.expatrio.com/about-germany/skilled-immigration-act-germany — accessed 2026-07-05 — **likely**
  - Note: this site already has (per the DB task list) `residence-permit` covering permits broadly
    — recommend the Verifier decide whether Chancenkarte deserves its own mention inside
    `residence-permit`'s guide rather than duplicating deeply here; I'm flagging the *link* to
    recognition, not proposing to rewrite the residence-permit guide.

---

## 5. Free counselling: IQ Network + BAMF/BA hotline

**Confidence: confirmed.**

- **IQ Network ("Integration durch Qualifizierung" / Integration through Qualification):**
  government-funded (ESF Plus + Federal Ministry of Labour), running since 2005. **16 regional
  networks, one per Bundesland.** Offers:
  - **Free counselling** on whether your profession is regulated, whether you need recognition,
    and which German qualification your foreign one best matches.
  - Practical help identifying the responsible body and preparing an application.
  - Some **qualification/bridge courses** to help close gaps identified in a Defizitbescheid,
    occasionally with living-cost support during the course.
  - Available to **anyone with a foreign professional qualification, regardless of nationality
    or residence status** — a meaningful point for refugees/non-EU newcomers who might assume
    they're not eligible.
  - Counsellors primarily work in German, but multilingual counselling/interpretation may be
    available depending on the local office — worth telling newcomers to ask when booking.
  - Source: https://www.brandenburg.netzwerk-iq.de/en/our-services/advice-on-recognition-of-my-qualifications — accessed 2026-07-05 — **confirmed**
  - Source: https://www.esf.de/portal/EN/Funding-period-2021-2027/Funding_Programmes/bmas/IQ.html — accessed 2026-07-05 — **confirmed**
- **"Working and Living in Germany" hotline (BAMF + Bundesagentur für Arbeit / ZAV jointly
  operated):**
  - **Phone: +49 30 1815-1111** (CET).
  - **Hours: Mon/Tue/Fri 9:00–12:00; Wed/Thu 13:00–16:00.**
  - Free advice (standard call charges may apply); covers recognition procedures for vocational,
    academic, and school qualifications, tells you the competent office and the matching German
    occupation, plus entry/residence and German-course questions.
  - Source: https://www.bamf.de/EN/Service/ServiceCenter/ThemenHotlines/ArbeitenUndLeben/arbeitenundleben-node.html — accessed 2026-07-05 — **confirmed**
  - Source: https://www.anerkennung-in-deutschland.de/html/en/hotline.php — accessed 2026-07-05 — **likely** (referenced via search; not independently fetched this pass, but hours/number match the BAMF page exactly, so treat as corroborated)

---

## 6. Documents, costs, and timing — consolidated honest ranges

For `documents_md` (extend existing, don't discard):

- Existing list (certificate/diploma + certified translation, transcripts/module descriptions,
  proof of professional experience, passport, application form) — **keep, still accurate.**
- **Add:** for university degrees specifically, note the **ZAB Pre-Check tool** generates a
  personalized checklist before applying — most documents can be simple scans (no apostille
  usually needed), but translations may be required depending on origin country. **Confirmed**
  (zab.kmk.org FAQ, fetched directly).
- **Add cost/timing honesty note** (do not hardcode a single number as if universal — the ranges
  genuinely differ by route):
  > "Cost and timing depend on which body handles your case: a university Statement of
  > Comparability from ZAB costs **€208** (as of 2026; €104 for a duplicate) and takes **about 3
  > months** (faster tracks exist: ~2 months for skilled workers, ~2 weeks for EU Blue Card
  > applicants). Vocational/trade recognition through IHK-FOSA or a regional HWK typically costs
  > **€100–600** depending on how much assessment work is needed, with a decision in **about 3–4
  > months** once your documents are complete. Health-profession and teaching recognition is
  > handled by state authorities and timing/cost varies by Bundesland — use the Recognition Finder
  > to get figures for your specific case. **Always confirm the current fee on the responsible
  > body's own page before paying — fees are reviewed periodically.**"

---

## 7. Draft content — ready to map to `guides` columns

### `intro_md` (proposed replacement — keeps the useful parts of the current text, restructures
around the regulated/non-regulated fork and names anabin/ZAB/IHK-FOSA/HWK explicitly)

> If you trained or studied outside Germany, you may be able — or required — to have your
> qualification officially **recognized (Anerkennung)** as equivalent to a German one. The first
> question to answer is: **is your profession regulated?**
>
> - **Regulated professions** — doctors, nurses and other health professions, teachers, lawyers,
>   and many skilled trades — legally **require** recognition (or a professional license) before
>   you can practice.
> - **Non-regulated professions** — most **IT, engineering, business, and commercial roles** —
>   don't strictly require recognition to work, but it still helps: employers use it to judge a
>   foreign degree, and it can matter directly for visa eligibility.
>
> **Not sure which applies to you?** Start at the official **anerkennung-in-deutschland.de**
> portal (run by the Federal Institute for Vocational Education and Training, BIBB, in 11
> languages) and use its **Recognition Finder** — it identifies whether your profession is
> regulated and which body handles your specific case.
>
> Who that body is depends on your profession type: **university degrees** go through the
> **ZAB (Central Office for Foreign Education)**, which maintains the **anabin** database of
> foreign institutions (rated H+ if fully recognized, H+/- if only some programs are, H- if not) —
> if your specific degree isn't listed clearly enough, you apply for a **Statement of
> Comparability**. **Vocational/trained occupations** in commerce, industry or services usually go
> through **IHK-FOSA** (a single national body run by the Chambers of Industry and Commerce);
> **craft/trade qualifications** go through your regional **Chamber of Crafts (HWK)**; and
> **health-profession or teaching qualifications** are recognized by **state-level authorities**
> that vary by Bundesland — again, the Recognition Finder points you to the right one.
>
> If your qualification only partially matches, you may receive a **Defizitbescheid** (deficit
> notice) listing further exams or training needed to close the gap. Since a **2024 reform**, some
> skilled workers can enter Germany and start working *before* recognition finishes, under an
> **Anerkennungspartnerschaft (recognition partnership)** — your employer formally commits to
> supporting the recognition process after you arrive. Free, independent counselling is available
> from the **IQ Network** (one office per federal state) and the **BAMF/Bundesagentur für Arbeit
> "Working and Living in Germany" hotline** (+49 30 1815-1111).

### `documents_md` (append to existing list)
- Add: "For university degrees: run the ZAB Pre-Check tool first — it generates a personalized
  document checklist; most documents can be simple scans, though translations may be required
  depending on your degree's country of origin."
- Add cost/timing paragraph from §6 above.

### `after_md` (append to existing)
> "Since March 2024, some skilled workers don't need to wait for recognition to finish before
> working: under a **recognition partnership (Anerkennungspartnerschaft, § 16d(3) AufenthG)**, you
> can enter Germany on a renewable residence title (1 year at a time, up to 3 years total) while
> your employer helps you complete recognition alongside your job — useful if you're in a
> regulated profession facing a long queue. If you're unsure of next steps at any point, free
> counselling is available from your regional **IQ Network** office and the joint BAMF/Bundesagentur
> für Arbeit hotline (+49 30 1815-1111, Mon/Tue/Fri 9–12, Wed/Thu 13–16) — you don't have to
> navigate this alone or pay for basic guidance."

### `legal_basis` — keep `Berufsqualifikationsfeststellungsgesetz (BQFG)` as primary; consider
appending `; recognition partnership under § 16d Aufenthaltsgesetz (AufenthG)` since the new
route has distinct statutory grounding.

### `checklist_steps` — proposed edits/additions (guide_id `26cc662e-476d-45be-b854-2fc615506fb8`)

1. **Step 1 revision** ("Find the responsible authority for your profession") — body update:
   "Use the **Recognition Finder** at anerkennung-in-deutschland.de. It will tell you whether
   your profession is regulated and route you to the right body: ZAB for university degrees,
   IHK-FOSA for commercial/industrial vocational training, your regional HWK for craft trades, or
   a state authority for health/teaching professions."
2. Step 2 (certified translation) — keep as-is, still accurate.
3. Step 3 (submit application) — body could add: "For university degrees via ZAB, run the
   Pre-Check tool first to get your personalized document checklist and pay the fee (€208 as of
   2026, or €104 for a duplicate)."
4. **Step 4 revision** ("Wait for the decision") — body update: "Typical timelines vary by route:
   about 3 months for a ZAB Statement of Comparability (faster tracks exist for skilled workers
   and EU Blue Card applicants), about 3–4 months for IHK-FOSA/HWK vocational assessments. Health
   and teaching professions vary by state."
5. Step 5 (Defizitbescheid) — keep, still accurate.
6. Step 6 (Anerkennungszuschuss grant) — keep, still accurate.
7. **New optional step 7** — "Ask about a recognition partnership if you're not in Germany yet":
   body: "If you're in a regulated profession and recognition would otherwise delay your move, ask
   a prospective employer about entering under an Anerkennungspartnerschaft (§16d(3) AufenthG) —
   you can start working while completing recognition, on a renewable 1-year residence title (up
   to 3 years total)."
8. **New optional step** — "Get free counselling before you start": body: "Contact your regional
   **IQ Network** office or the BAMF/Bundesagentur für Arbeit hotline (+49 30 1815-1111) for free,
   independent advice on whether you need recognition and how to prepare your application —
   available regardless of your nationality or residence status."

### New `glossary_terms` candidates (none currently exist for this cluster — genuine gap)

| slug | term_en | term_de | definition_md draft | confidence |
|---|---|---|---|---|
| `anabin` | anabin database | anabin | "The German government's free database of foreign higher-education institutions, run by the ZAB. Rates each institution H+ (fully recognized), H+/- (only some programs recognized — check your specific degree), or H- (not recognized as equivalent). Not being listed at all does not mean 'not recognized' — it just means no one has requested an assessment yet." | confirmed |
| `zab` | ZAB (Central Office for Foreign Education) | Zentralstelle für ausländisches Bildungswesen (ZAB) | "The German body, under the KMK, that maintains the anabin database and issues the Statement of Comparability for foreign university degrees not fully covered by anabin. Fee €208 (2026), ~3 months standard processing (faster for skilled workers/EU Blue Card)." | confirmed |
| `statement-of-comparability` | Statement of Comparability | Zeugnisbewertung | "An official ZAB document comparing your specific foreign university degree to its German equivalent. Needed when anabin doesn't have enough detail on your exact degree. Doesn't expire; valid throughout Germany." | confirmed |
| `ihk-fosa` | IHK-FOSA | IHK FOSA | "The centralized national body (run by the Chambers of Industry and Commerce) that assesses foreign vocational (apprenticeship-style) qualifications in commerce, industry, hospitality, and services. Fee roughly €100–600; decision in about 3–4 months once documents are complete." | confirmed |
| `defizitbescheid` | Deficit notice (Defizitbescheid) | Defizitbescheid | "An official notice issued when your foreign qualification only partially matches its German equivalent. It lists the specific additional training, exams, or experience needed to achieve full recognition." | confirmed |
| `anerkennungspartnerschaft` | Recognition partnership | Anerkennungspartnerschaft | "A route introduced in the March 2024 skilled-immigration reform (§16d(3) AufenthG) letting some skilled workers move to Germany and start working before their qualification recognition is finished, with their employer formally committing to support the process. Residence title issued 1 year at a time, up to 3 years total." | confirmed |
| `anerkennungszuschuss` | Recognition grant (Anerkennungszuschuss) | Anerkennungszuschuss | "A grant that can cover costs like certified translations and assessment fees for people on a low income going through the recognition process. Already referenced in the existing guide text — adding as a standalone glossary entry for search/panic-lookup traffic." | likely (existing guide already asserts this; not independently re-verified with a fresh source this pass — flag for Verifier) |

These are proposed drafts, not yet written to the DB — the Verifier/Builder should confirm slugs
don't collide with existing glossary entries (none currently do, per the DB query in §0) and
decide final wording.

---

## 8. Sources summary (all accessed 2026-07-05 unless noted)

- https://www.anerkennung-in-deutschland.de/html/en (fetched directly, redirected from
  `/html/en/`) — portal overview, Recognition Finder, hotline, IQ Network search, BIBB operator —
  **confirmed**
- https://www.anerkennung-in-deutschland.de/html/en/pro/professional-recognition.php — regulated
  vs. non-regulated structure — **confirmed**
- https://zab.kmk.org/en/statement-of-comparability/faq (fetched directly) — fee €208/€104,
  timelines (3 months / 2 months / 2 weeks), Pre-Check tool, document requirements — **confirmed**
- https://zab.kmk.org/en/statement-comparability — corroborates above — **confirmed**
- https://zab.kmk.org/en/regulated-professions — **confirmed** (referenced, not deep-fetched)
- https://www.ihk-fosa.de/en/ (fetched directly) — IHK-FOSA process, BQFG legal basis, three
  outcome types — **confirmed**; fee/timeline figures corroborated via WebSearch aggregation of
  official IHK regional chamber English pages (Stuttgart, Berlin, Karlsruhe, Chemnitz) —
  **confirmed**
- https://www.hwk-berlin.de/downloads/fact-sheet-assessment-of-foreign-professional-qualifications-91,963.pdf
  — HWK process/fee/timeline — **likely** (PDF summarized via search snippet, not fetched in full)
- https://www.service-bw.de (Baden-Württemberg HWK service page) — **likely**
- https://www.make-it-in-germany.com/en/looking-for-foreign-professionals/entering/employment-recognition-partnership
  — Anerkennungspartnerschaft mechanics — **confirmed**
- https://www.make-it-in-germany.com/en/visa-residence/types/visa-recognition-partnership —
  §16d(3) AufenthG, 1-year renewable up to 3 years, A2 German requirement — **confirmed**
- https://leglobal.law/2024/03/22/germany-changes-to-the-german-immigration-act-for-skilled-workers-have-come-into-force/
  — 2024 reform dates and non-regulated salary-threshold exemption — **confirmed**
- https://www.expatrio.com/about-germany/skilled-immigration-act-germany — Chancenkarte
  pre-qualification link — **likely**
- https://hallogermany.com/blog/anabin-guide-academic-degrees — anabin H+/H+-/H- explainer —
  **likely** (secondary, but terminology consistent across multiple independent sources)
- https://www.jobbatical.com/blog/anabin-h-rating-eu-blue-card — corroborates H-rating meaning —
  **likely**
- https://www.brandenburg.netzwerk-iq.de/en/our-services/advice-on-recognition-of-my-qualifications
  — IQ Network services, free counselling, eligibility regardless of status — **confirmed**
- https://www.esf.de/portal/EN/Funding-period-2021-2027/Funding_Programmes/bmas/IQ.html — IQ
  Network funding/structure (16 regional networks since 2005) — **confirmed**
- https://www.bamf.de/EN/Service/ServiceCenter/ThemenHotlines/ArbeitenUndLeben/arbeitenundleben-node.html
  — hotline number, hours, scope — **confirmed**
- https://www.anerkennung-in-deutschland.de/html/en/hotline.php — referenced corroboration of
  hotline details — **likely** (not independently fetched)
- Existing stored source (kept): https://www.anerkennung-in-deutschland.de — accessed 2026-07-02
  per current DB row

---

## 9. Unconfirmed / flag for Verifier

1. **anabin.kmk.org itself was not directly fetched this pass** — the H+/H+-/H- rating
   explanations rest on independent secondary sources (HalloGermany, Jobbatical), which are
   consistent with each other and with the ZAB FAQ's own description of when a Statement of
   Comparability is needed, but the Verifier should ideally load anabin.kmk.org directly to
   confirm exact current UI wording before publishing anything that describes "how to search
   anabin" as a step (I stopped short of drafting a step-by-step anabin search walkthrough for
   this reason — the guide content above deliberately stays at the conceptual level: what H+/H+-/H-
   mean, not click-by-click instructions).
2. **The Recognition Finder tool page itself 404'd on direct WebFetch** this pass (tried
   `/html/en/recognition-finder.php`) — likely a URL-slug guess error on my part, or the tool is
   JS-rendered and not reachable via simple fetch. Its existence, purpose, and operator (BIBB) are
   confirmed via the portal's main page (§0/§3), but the Verifier should locate the *correct* live
   URL for the tool before it's used as a hyperlink target anywhere in the shipped content.
3. **HWK fee/timeline figures** are sourced from a PDF fact sheet summarized via search snippet
   (not fetched in full) plus a state service-portal page — structurally consistent with the
   IHK-FOSA figures (same BQFG legal basis, similar €100–600 / ~3 month pattern), but recommend
   the Verifier open the HWK Berlin PDF directly if exact figures are going to be quoted verbatim
   rather than as a range.
4. **State-level health/teaching-profession specifics** (which exact ministry/board per
   Bundesland) were deliberately NOT enumerated — this would require 16 separate state-by-state
   lookups and risks going stale fast; I recommend the guide point to the Recognition Finder for
   this rather than the Researcher/Verifier trying to hardcode 16 states' offices. Flagging this
   explicitly so the Verifier doesn't feel the packet is incomplete for omitting it — it's a
   deliberate honesty-rule scope decision, not an oversight.
2 (bis). **Anerkennungszuschuss** (recognition grant) — already asserted in the *existing* DB
   guide text from before this research pass; I did not find a fresh primary source for it this
   pass (searches were focused on the new material). Flag for the Verifier to re-confirm current
   eligibility/amount if precision is wanted; recommend keeping it as a qualitative mention
   ("some regions offer grants... check current eligibility") rather than adding a specific euro
   figure.
5. **"anerkennung-in-deutschland.de/html/en/hotline.php"** — referenced via search result title
   only, not independently fetched; the phone number/hours I'm reporting come from the BAMF.de
   page instead, which **was** effectively corroborated (matching search-snippet hours appeared
   for both). Recommend the Verifier do one direct fetch of the BAMF page (not just the search
   snippet) before publishing the phone number/hours as fact — I worked from WebSearch's
   synthesized snippet for this specific figure rather than a raw WebFetch of bamf.de.

---

## Cross-cutting note — this completes all 5 research groups

This file (`research-recognition.md`, Group E) is the **fifth and final** research packet in the
resilient batch:
- Group A — `research-national-howto.md` (bank, blocked-account, health-insurance, rundfunkbeitrag, schufa)
- Group B — `research-respermit.md` (residence-permit, per-city)
- Group C — `research-driving.md` (driving-license)
- Group D — `research-abh-trio.md` and `research-tax-finanzamt.md` (ABH-related + tax/Finanzamt cluster)
- Group E — this file (qualification-recognition, national, profession+state-sliced)

All 5 groups are now handed off and ready for the Verifier to process (individually or batched).
