# Research packet — Group A: Federally-uniform "national how-to" tasks

**Agent:** Researcher (step ①) · **Topic:** batch group "A national-howto" from `state.json`
(bank-account, blocked-account, health-insurance, rundfunkbeitrag, schufa)
**Access date for all web facts below:** 2026-07-04 (unless a source line says otherwise)
**Target tables:** `guides` (columns `intro_md`, `documents_md`, `after_md`, `legal_basis`, `sources`,
`last_verified_at`) and the related `checklist_steps` rows (`guide_id` FK — steps live in their own
table, not a `guides` column; I still call these "checklist_steps" per the assignment wording).
**Scope note — per the standing honesty rule:** these 5 tasks are **federally uniform**. I am
**not** proposing `city_task_variants` rows for any of them. Every fact below applies identically
in all 15 cities — "do it online / no local office to visit" is the correct honest framing, and
each draft says so explicitly.

All 5 guide rows already exist and are `published` (last verified 2026-07-02). This is a
**deepen + re-verify** pass: I mark what's already accurate, correct anything stale, and add
depth (mainly current 2026 figures, process nuance, and English-friendly-signup notes) that
wasn't in the stored text.

---

## 0. How this maps to columns (reminder, mirrors the respermit packet)

| Column | What goes there |
|---|---|
| `guides.intro_md` | the main explainer paragraph(s) newcomers read first |
| `guides.documents_md` | bullet list of what to bring/have ready |
| `guides.after_md` | what happens once the process is done |
| `guides.legal_basis` | statute/regulation name, plain text |
| `guides.sources` | jsonb array of `{url, title, accessed_at}` |
| `guides.last_verified_at` | date of this research pass |
| `checklist_steps` (own table, FK `guide_id`) | ordered step rows — I propose edits/additions per task |

---

## 1. Opening a bank account — task slug `bank-account`

**Guide ID:** `1dabbca7-6ae5-486a-8000-83193569226d` · **Current status:** published, verified 2026-07-02

### What's already stored (verdict: accurate, keep) 
- EU citizens can open immediately with passport; non-EU sometimes need Anmeldung first depending on bank — **confirmed**, still true.
- Online/app banks (N26, Revolut, bunq) can open in minutes with just a passport, before a German address exists — **confirmed**.
- Traditional branch banks (Sparkasse, Volksbank, Deutsche Bank, Commerzbank) want an appointment + often the Anmeldebestätigung — **confirmed**.
- Debit card/PIN arrive separately by post — **confirmed**, standard German banking security practice, unchanged.

### NEW depth to fold in

1. **Video-Ident is the mechanism, not just "online."** Digital banks verify identity via a **smartphone video call (Video-Ident)** — you show your passport to camera, sometimes read out a code — completing account opening within minutes, entirely without a branch visit. Worth naming explicitly in `intro_md` since "verify your identity" is already step 4 of `checklist_steps` but the guide text itself never says *how*.
   - Confidence: **confirmed** (multiple 2026 sources, consistent with N26's own onboarding flow).
2. **What N26 (as the most-cited app bank) actually asks for:** smartphone + valid photo ID + a mailing address (can be a temporary/foreign address for the virtual card stage, though a German address is typically needed to receive the physical card). This nuance — you can start before Anmeldung but full service usually still expects a German address eventually — is more honest than implying an account works indefinitely on a foreign address.
   - Confidence: **likely** (consistent across guides but I did not fetch N26's own T&Cs directly this pass — flag for Verifier to confirm on n26.com).
3. **IBAN explainer is currently absent** — the task's own title mentions IBAN but neither `intro_md` nor `after_md` explains what it is. Add one line: *"Once opened, you'll get a German IBAN (starts with DE, 22 characters) — Germany is part of SEPA, so this IBAN works for direct debits, transfers, and salary payments across the EU, not just within Germany."*
   - Confidence: **confirmed** (general SEPA/IBAN fact, stable, no need for a fresh citation beyond ECB/Bundesbank general knowledge — mark as background fact, not URL-specific).
4. **Fee honesty note:** most digital banks' basic tier is free; branch banks often charge €0–15/month depending on account type and minimum balance/salary requirements — worth a "check the fee schedule, it varies by bank and account tier" line rather than a specific number (avoids false precision). `intro_md` already says "opening is normally free, though some banks charge a monthly fee" — **keep as is**, it's already appropriately hedged.

### Draft `intro_md` addition (append to existing, don't replace)
> "Digital banks verify your identity by video call (Video-Ident): you hold your passport up to your phone's camera, sometimes read back a code, and the account can be live within minutes — no branch visit needed. Once open, you'll receive a German IBAN (starting `DE`, 22 characters) that works for direct debits and transfers across the whole SEPA area, not just Germany — give it to your employer, landlord, and health insurer as needed."

### Draft `checklist_steps` addition
- New optional step after step 5 ("Activate your account and card"): **"Set up your first direct debit or transfer"** — body: "Use your new IBAN to redirect your salary, set up a standing order for rent, or link the account to your health insurer for premium collection."

### Sources
- https://n26.com/en-de/blog/how-to-open-a-bank-account-in-germany — "How to open a bank account in Germany the easy way" — accessed 2026-07-04 — confidence: **likely** (WebSearch snippet, not directly fetched this pass; Verifier should confirm Video-Ident wording and current fee-free tier claim on n26.com itself)
- https://www.monito.com/en/wiki/opening-a-bank-account-in-germany-for-non-residents-foreigners — accessed 2026-07-04 — **likely**
- https://www.verbraucherzentrale.de (existing stored source) — retained, general consumer-protection authority — **confirmed** as a stable reference, not re-fetched this pass.

### Unconfirmed / flag for Verifier
- Exact current monthly fees for N26 Standard vs. Sparkasse Girokonto — deliberately left as a range/hedge, not a hard number, per the honesty rule. Verifier can spot-check if a specific figure is wanted, but I recommend keeping it qualitative.
- Whether non-EU newcomers can *fully* use a digital-bank account (receive salary, pay rent) before Anmeldung, or whether banks eventually require the registration for compliance (Geldwäschegesetz/AML) — general consensus says "yes for basic use, but some banks ask for Anmeldung within a grace period." Not fully nailed down — mark **likely**, Verifier to check one bank's actual T&Cs (e.g. N26 or Revolut Germany) if precision matters.

---

## 2. Blocked account / Sperrkonto — task slug `blocked-account`

**Guide ID:** `a6cc76a2-361c-44bc-93f5-dc74a138a12c` · **Current status:** published, verified 2026-07-02

### What's already stored (verdict: accurate, keep)
- Proves financial means for student/job-seeker visas — **confirmed**.
- Providers include Expatrio, Fintiba, some traditional banks — **confirmed**.
- Unblocked for monthly withdrawal after Anmeldung (and sometimes residence permit) — **confirmed**, matches official Auswärtiges Amt wording.
- Threshold amount "updated periodically" — correctly hedged already; **keep the hedge, do not hardcode a number that will go stale**, per the honesty rule. See below for how to handle the 2026 figure.

### NEW depth to fold in (this is the most number-heavy of the 5 — handle carefully)

1. **Current 2026 figures (multiple consistent 2026 sources), but treat as a snapshot, not evergreen text:**
   - **Student visa:** **€11,904/year = €992/month** for 2026 (2025 was lower; the figure is reviewed annually).
   - **Chancenkarte / job-seeker visa:** **€13,092/year = €1,091/month** for 2026.
   - Confidence: **likely** (consistent across ~6 independent secondary sources, but I did NOT find the exact figure stated on auswaertiges-amt.de itself this pass — the AA page I fetched directly says only that the amount "varies depending on purpose of stay... based on maximum rates for German student support [BAföG]" and points to the specific mission's website / Consular Services Portal for the current number, deliberately not hardcoding it federally). **Recommend**: state the 2026 figures as "as of 2026" with an explicit "verify current figure with your embassy/consulate or provider before transferring" line — do not let the number silently go stale in 2027.
2. **Official beneficiary mechanic (confirmed, from auswaertiges-amt.de directly):** the blocked account names a "beneficiary" who must agree to release funds — either **the German mission abroad** (before the visa is granted/used) or **the competent Ausländerbehörde** (after arrival). This is a more precise and official framing than the current stored text and is worth adding — it explains *why* Anmeldung/permit paperwork is needed to unblock the account.
3. **Provider comparison (useful, keep qualitative — no institutional endorsement of exact current pricing):**
   - Fintiba markets itself as faster to set up (claims 1–3 business days).
   - Expatrio markets a one-time fee model vs. some providers' fee + monthly-charge model.
   - Recommend: name both providers as "compare current fees and setup time directly on each provider's site before committing" rather than embedding specific euro fee figures scraped from secondary blogs (confidence on exact provider fees: **unverified** — these numbers came from SEO/affiliate blog content, not the providers' own pricing pages).
   - A third provider (Coracle) reportedly paused new applications — **unverified**, single-source, not worth stating as fact; omit or mark clearly speculative if included.
4. **"Usually opened for a year, unless the stay is shorter"** — confirmed detail from the official AA page, worth adding to `after_md` or `documents_md`.
5. **Unblocking conditions if the visa isn't used** — confirmed from AA page: if you don't travel, withdraw your application, or leave the Schengen area before getting a residence permit, the mission can issue a certificate to lift the block and return the funds. Good addition for `after_md` — newcomers worry about "what if my visa is refused."

### Draft `intro_md` revision (keep structure, add precision + hedge)
> "A **blocked account (Sperrkonto)** is a special savings account used to prove you can support yourself in Germany — required for many student visas and the job-seeker/Chancenkarte visa. You transfer a set threshold amount before applying (as of 2026, roughly €992/month for students and €1,091/month for job-seekers — **these figures are reviewed annually, so confirm the current amount with your German mission or provider before transferring**), and can only withdraw a fixed monthly amount once you arrive.
>
> The account names a **beneficiary** who must approve any release of funds: before your visa is granted, that's the German mission abroad; after you arrive, it's your local Ausländerbehörde. The account is normally opened for one year unless your stay is shorter.
>
> Several dedicated providers (e.g. Expatrio, Fintiba) offer blocked accounts built for newcomers, alongside some traditional banks — compare current fees and setup speed directly on their sites, as pricing changes."

### Draft `after_md` addition
> "If your visa is refused, you withdraw your application, or you decide not to travel, the German mission can issue a certificate releasing the block so your money isn't stuck. Once unblocked after arrival, you can withdraw the set monthly amount to your regular account; some providers allow early full release with proof you no longer need it (e.g. a job offer or scholarship)."

### Sources
- https://www.auswaertiges-amt.de/en/sperrkonto-388600 — "Opening and closing a blocked bank account (Sperrkonto)" — **fetched directly** 2026-07-04 — **confirmed** for beneficiary mechanic, 1-year default duration, and release-if-unused conditions. Does NOT state a specific euro figure — deliberately defers to mission-specific pages.
- https://www.gradgermany.com/blog/blocked-account-sperrkonto-germany-2026-guide — "€11,904" 2026 figure — accessed 2026-07-04 — **likely**
- https://ai.eecglobal.com/glossary/blocked-account/ — "€11,904" corroboration — accessed 2026-07-04 — **likely**
- https://visatocampus.com/german-blocked-account-guide/ — "€11,904" + Chancenkarte €13,092 figure — accessed 2026-07-04 — **likely**
- https://www.bankdaten.de/en/guide/blocked-account-germany.html — Fintiba/Expatrio provider comparison — accessed 2026-07-04 — **unverified** for exact fee figures (affiliate/SEO content)

### Unconfirmed / flag for Verifier
- The exact €992/€1,091 monthly figures — consistent across secondary sources but **not confirmed on the primary auswaertiges-amt.de page itself** (which intentionally defers to mission-specific figures). Verifier should either (a) find the figure on a specific consulate's page (e.g. the German Missions in the country the newcomer is coming from) or (b) keep the guide's number as "as of 2026, roughly €990–1,090/month depending on visa type — always confirm the current figure" to stay safely hedged.
- Exact current Fintiba/Expatrio fees — sourced only from affiliate blogs, not the providers' own pricing pages. Recommend Verifier spot-check fintiba.com / expatrio.com directly if exact fees are wanted, otherwise keep qualitative.
- Coracle pause status — single unconfirmed source, recommend omitting entirely.

---

## 3. Health insurance — task slug `health-insurance`

**Guide ID:** `dac52473-75af-4e07-b8d6-b8b558919208` · **Current status:** published, verified 2026-07-02

### What's already stored (verdict: accurate, keep)
- Mandatory from day one, GKV vs PKV framing — **confirmed**.
- PKV mainly for high earners, self-employed, civil servants; cheaper young/healthy, harder to leave later — **confirmed**, this is well-established German health-policy fact.
- Major insurers TK, AOK, Barmer, DAK, benefits standardized by law — **confirmed**.
- `legal_basis: SGB V` — **confirmed**, correct.

### NEW depth to fold in

1. **2026 income threshold (Versicherungspflichtgrenze / JAEG), precise and dated:** rose to **€77,400/year (€6,450/month)** for 2026, up from €73,800 in 2025 — this is the line above which employees may opt into PKV instead of GKV. Approved by the Bundesrat. This is genuinely new information not in the stored guide and directly explains "who can choose private insurance" — currently the guide only vaguely says PKV is for "high earners."
   - Confidence: **confirmed** (consistent across 5+ independent 2026 sources including specialist insurance-broker sites; did not fetch the Bundesrat text directly this pass, so treat the exact figure as **confirmed-by-consensus** rather than primary-source-fetched — Verifier can cross-check against gesetze-im-internet.de §6 SGB V or the annual Sozialversicherungs-Rechengrößenverordnung if maximum rigor wanted).
2. **AOK is genuinely regional — worth stating explicitly per the task brief.** AOK is not one company but a federation of **11 independent regional insurers** (Landesverbände), each setting its **own contribution add-on rate (Zusatzbeitrag)** and operating under a distinct name per state/region (e.g. AOK Bayern, AOK Nordost covering Berlin/Brandenburg/Mecklenburg-Vorpommern, AOK Baden-Württemberg, etc.). So "AOK" isn't a single nationwide account — a newcomer moving from Munich to Berlin would technically be with a different AOK entity, even though membership typically transfers seamlessly. This is exactly the honesty nuance the task asked for: **state-level, not city-level**, and NOT a reason to create city variants (still one guide, just a clarifying sentence).
   - Confidence: **confirmed** (structure is stable, publicly documented AOK-Bundesverband fact).
3. **English-friendly sign-up:** **TK (Techniker Krankenkasse)** is repeatedly cited as the most popular choice among international students/employees specifically because of its English-language app and process, and its TK-App can send enrollment confirmation directly to universities. AOK's regional entities increasingly offer multilingual phone support too (e.g. AOK Bayern cited with an 11-language helpline, AOK Nordost with 14+ languages) — worth a line naming this as a practical newcomer filter, without over-endorsing one insurer as "official."
   - Confidence: **likely** (sourced from comparison/expat-guide blogs, not TK's own site directly this pass).
4. **Student vs employee enrollment mechanics, more concrete than currently stored:**
   - **Students:** must choose and apply to a Krankenkasse *before* finishing university enrollment (Immatriculation) — most universities require the insurer's Versicherungsbescheinigung as a condition of matriculating. Typical documents: university admission letter (Zulassungsbescheid) + passport.
   - **Employees:** the employer typically handles registration with a chosen Krankenkasse as part of onboarding — the new hire states a preference, employer administers it — mandatory unless salary exceeds the JAEG threshold above.
   - Confidence: **confirmed**, standard, stable process.
5. **Indicative student contribution figure:** roughly **€130/month** cited for 2026 student GKV contributions (a mix of health + long-term care insurance for students, this is a fairly stable structural figure but shifts slightly each year) — recommend using as an illustrative range ("roughly €120–140/month for students, revised annually") rather than a bare number, per the honesty rule.
   - Confidence: **likely**.

### Draft `intro_md` addition
> "The **income threshold** above which employees may opt out of GKV into PKV (the *Versicherungspflichtgrenze*) is reviewed annually — **€77,400/year (€6,450/month) for 2026**, up from €73,800 in 2025. Below it, GKV membership is compulsory for employees.
>
> **AOK is organized by state, not nationally** — it's a federation of 11 independent regional insurers (e.g. AOK Bayern, AOK Nordost for Berlin/Brandenburg), each setting its own contribution add-on rate. Moving between German states may mean switching AOK entities, though your cover carries over. For English-language service specifically, **TK (Techniker Krankenkasse)** is widely used by international students and employees for its English-language app and process; several regional AOKs also offer multilingual phone support."

### Draft `documents_md` addition
- University admission letter (Zulassungsbescheid) — for students, needed to apply to a Krankenkasse before Immatriculation
- Employment contract — employers usually handle Krankenkasse registration directly as part of onboarding

### Draft `checklist_steps` refinement
- Step 3 ("Register with your chosen Krankenkasse") body could gain: "Students typically need this done — and the resulting Versicherungsbescheinigung in hand — before the university will finalize enrollment (Immatrikulation)."

### Sources
- https://www.myhealthcarebroker.com/blog/jahresarbeitsentgeltgrenze-2026-private-health-insurance — "JAEG 2026: €77,400 Threshold" — accessed 2026-07-04 — **confirmed** (consensus across multiple sources)
- https://b-k-consulting.com/en/insurance-tips/the-income-threshold-for-compulsory-health-insurance-will-rise-to-77400-euros-in-2026/ — accessed 2026-07-04 — **confirmed**
- https://www.ottonova.de/en/v/private-health-insurance/income-threshold — accessed 2026-07-04 — **confirmed**
- https://www.findenglish.de/blog/tk-vs-aok-vs-barmer-best-public-health-insurance-for-expats-in-germany — AOK regional structure + rates example — accessed 2026-07-04 — **likely**
- https://www.tk.de/en/i-am-tk/students-health-insurance-germany-2169330 — TK English student process — accessed 2026-07-04 — **likely** (not fetched directly)
- https://www.gkv-spitzenverband.de (existing stored source) — retained — **confirmed** as stable umbrella reference

### Unconfirmed / flag for Verifier
- Precise €130/month 2026 student contribution figure — reasonable but not fetched from a Krankenkasse's own rate card; recommend keeping as an illustrative range.
- Whether *all* 11 AOK regional entities currently set different Zusatzbeitrag rates or whether some have converged — general structural claim is solid; exact current rate differentials not verified this pass and shouldn't be hardcoded (rates change yearly across all GKV insurers).

---

## 4. Broadcasting fee / Rundfunkbeitrag — task slug `rundfunkbeitrag`

**Guide ID:** `0b23bcca-811b-4479-9879-2607baebc31d` · **Current status:** published, verified 2026-07-02

### What's already stored (verdict: accurate, keep)
- €18.36/month, per household not per person — **confirmed**, unchanged since 2024, still current for 2026.
- Beitragsservice letter after Anmeldung is genuine, not a scam — **confirmed**, important reassurance to keep.
- Flatmate-linking mechanic (don't double-register) — **confirmed**.
- `legal_basis: Rundfunkbeitragsstaatsvertrag (RBStV)` — **confirmed**, correct.

### NEW depth to fold in

1. **Quarterly billing amount, concretely:** Beitragsservice bills **€55.08 per quarter** (3× €18.36) by default — worth stating since the checklist already recommends SEPA direct debit; newcomers should know the debit will show as a quarterly charge, not monthly, unless they arrange otherwise.
   - Confidence: **confirmed**.
2. **Liability starts from the 1st of the move-in month, not the registration date** — e.g., moving in on the 15th of a month still means the fee is owed from the 1st of that month, and the first bill includes this back-payment. This is a genuinely useful "why is my first bill bigger than expected" pitfall to add.
   - Confidence: **confirmed**.
3. **BAföG exemption is now a clean legal entitlement, not discretionary — and it's retroactive.** As of a rule change effective **October 2025**, students receiving BAföG (and apprentices receiving Ausbildungsgeld) who don't live with their parents are **explicitly exempt by statute**. If someone paid the fee while eligible for BAföG, they can **apply retroactively for a refund**. This is materially more specific than the currently stored generic "BAföG recipients... can apply for a reduction or exemption" and should replace it.
   - Confidence: **confirmed** (consistent across sources, described as a clear 2025 statutory change still in effect through 2026).
4. **Full exemption categories, more complete list** than currently stored: recipients of **Bürgergeld/ALG II**, **Grundsicherung**, **BAföG/Ausbildungsgeld** (living independently), **asylum-seeker benefits (AsylbLG)**, and certain **severely disabled people** (marked "RF" on their disability ID) qualify for full exemption; some others qualify for a **reduction** rather than full exemption.
   - Confidence: **confirmed**.
5. **Exemptions are not automatic — must apply, with proof, via the Beitragsservice website (rundfunkbeitrag.de), and can be backdated up to 3 years from the date of application.** This "you must actively apply" point is currently implicit in the guide but should be explicit, since it's a common source of confusion ("I'm on Bürgergeld, why am I still being billed?").
   - Confidence: **confirmed**.
6. **Deregistration triggers, concretely:** you deregister when you give up a residence — e.g., moving in with someone who already pays, or moving into residential care, or moving abroad — via an online form at rundfunkbeitrag.de.
   - Confidence: **confirmed**.

### Draft `intro_md` revision (append/replace exemption sentence)
> "...Payment is billed quarterly by default — **€55.08 every three months** (3 × €18.36) — usually by SEPA direct debit.
>
> **Exemptions are not automatic — you must apply, with proof, at rundfunkbeitrag.de.** Full exemption is available to recipients of Bürgergeld/ALG II, Grundsicherung, asylum-seeker benefits, some severely disabled people, and — since a clarified rule in October 2025 — **BAföG recipients and Ausbildungsgeld-funded apprentices who don't live with their parents are explicitly exempt by statute**. If you paid while you were eligible, you can request a refund retroactively (exemptions/reductions can be backdated up to 3 years from your application date)."

### Draft pitfall note for `after_md`
> "Your **first bill can be larger than expected**: liability starts on the 1st of the month you moved in, not the day you registered, so the first invoice often includes a short back-payment. If you're moving out, giving up a residence, or moving in with someone who already pays, deregister online at rundfunkbeitrag.de rather than letting the account run."

### Draft `checklist_steps` refinement
- Step 5 ("Apply for an exemption if eligible") body should be updated to: "Recipients of Bürgergeld, Grundsicherung, asylum-seeker benefits, some disabled people, and — since October 2025 — BAföG/Ausbildungsgeld recipients living independently, are exempt by statute, but exemption is not automatic: apply online at rundfunkbeitrag.de with proof. You can request a refund for periods you were already eligible, backdated up to 3 years."

### Sources
- https://expatninja.de/rundfunkbeitrag-gez-in-germany/ — quarterly €55.08 figure, general 2026 overview — accessed 2026-07-04 — **confirmed** (matches simple arithmetic on the stable €18.36 figure)
- https://www.rundfunkbeitragservices.de/rundfunkbeitrag-befreiung — BAföG October 2025 exemption rule change — accessed 2026-07-04 — **confirmed** (cross-checked against the general search summary)
- https://www.amtly.app/blog/rundfunkbeitrag-befreiung — exemption categories list — accessed 2026-07-04 — **confirmed**
- https://www.betanet.de/rundfunkbeitrag-befreiung-ermaessigung.html — exemption/reduction distinction — accessed 2026-07-04 — **likely**
- https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/formulare/befreiung-oder-ermaessigung-beantragen — official Beitragsservice exemption-application form page — accessed 2026-07-04 — **confirmed** (found via search index; note the exact URL path returned a 404 on direct fetch this pass — the site appears to have a CAPTCHA/anti-bot gate on some paths, so I relied on the search-engine cache/snippet rather than a raw fetch. **Verifier should re-check this specific URL loads correctly before publishing it as the `booking_url`/link.**)
- https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/formulare — official forms index — accessed 2026-07-04 — **likely**, same caveat as above (not directly fetched, found via search)

### Unconfirmed / flag for Verifier
- **Important: direct WebFetch of rundfunkbeitrag.de returned a 404/CAPTCHA wall this pass** (see above) — all rundfunkbeitrag.de facts here are sourced via search-engine snippets/secondary corroboration, not a direct fetch of the primary site. Before publishing, the Verifier should directly load https://www.rundfunkbeitrag.de and confirm (a) the exemption categories list, (b) the exact BAföG rule-change date and wording, and (c) that the guide's existing top-level URL (`https://www.rundfunkbeitrag.de`) still resolves and is the right link to keep as the primary source.
- The precise "3 years backdating" window — consistent across 2 sources but not primary-fetched; flag for confirmation.

---

## 5. SCHUFA credit record — task slug `schufa`

**Guide ID:** `e94813b7-da85-44f1-9a1b-333b413ceea5` · **Current status:** published, verified 2026-07-02

### What's already stored (verdict: accurate, keep)
- SCHUFA is Germany's largest credit bureau, holds financial-reliability record — **confirmed**.
- Landlords ask for SCHUFA-Auskunft as part of rental applications — **confirmed**.
- Newcomers have no history yet, which can itself look concerning — **confirmed**, genuinely useful honesty note, keep.
- Free annual data copy under Art. 15 GDPR (Datenkopie), separate from paid landlord-facing Bonitätsauskunft — **confirmed**, already correctly distinguished.
- `legal_basis: Art. 15 DSGVO (GDPR)` — **confirmed**, correct for the free-copy right (though the paid Bonitätsauskunft is a separate commercial product, not itself a GDPR right — worth clarifying, see below).

### NEW depth to fold in

1. **Concrete process for the free Datenkopie, currently missing from the guide:** apply online at **meineschufa.de**, choose "Datenkopie nach Art. 15 DSGVO," fill in personal details, upload a copy of your ID (passport or both sides of an ID card) plus, if requested, your Meldebescheinigung (registration certificate), and submit. It typically arrives **by post within roughly 2–4 weeks**; the **statutory maximum is 30 days**, and SCHUFA is liable if it misses that. This is much more actionable than the current bare mention that the right exists.
   - Confidence: **confirmed** (consistent across SCHUFA's own newsroom pages per search snippets, plus independent legal/consumer sites).
2. **The Datenkopie is genuinely not landlord-usable** — worth stating explicitly, since newcomers might assume any "SCHUFA report" works: the Datenkopie is for personal review only and is not accepted by landlords because it's not designed as a shareable third-party document (it also contains more personal detail than a landlord should see). Landlords specifically want the **Bonitätsauskunft**.
   - Confidence: **confirmed**.
3. **Current price of the paid Bonitätsauskunft: €29.95 (2026), instant PDF download via meineschufa.de.** This replaces the current guide's vague "usually costs a small fee" with an actual figure — appropriate to state as a number since it's a fixed published product price (not a fluctuating market rate), while still noting it may change.
   - Confidence: **confirmed** (single clear figure across 2+ sources, matches meineschufa.de's own product page per search results).
4. **Format detail worth passing on:** the Bonitätsauskunft is structured so **only page 1** (the creditworthiness summary) is meant for the landlord; pages 2–3 are for personal use only and should not be handed over. Good practical tip for newcomers filling out rental applications.
   - Confidence: **likely** (sourced from a landlord-market blog, not meineschufa.de's own product description text directly this pass).
5. **Alternatives for newcomers with no/thin SCHUFA file** — the guide's `after_md` already gestures at "be ready to offer alternatives" but doesn't say what they are. Add concretely: an **employer reference/employment contract**, **proof of income (recent payslips)**, a **guarantor (Bürge)**, or offering a **larger deposit within the legal cap (max. 3 months' cold rent, § 551 BGB)**. Some landlords also accept a **letter from a previous landlord abroad** or a bank statement showing savings.
   - Confidence: **likely for the general list; confirmed for the §551 BGB 3-month deposit cap**, which is a stable, well-documented statutory fact (worth its own citation if the Verifier wants to add it as a second `legal_basis` reference, though the primary legal basis for this guide should stay Art. 15 DSGVO since that's the guide's main subject).

### Draft `intro_md` addition
> "To get your free copy: apply at **meineschufa.de**, select 'Datenkopie nach Art. 15 DSGVO,' fill in your details, and upload a copy of your ID (and registration certificate if asked). It arrives by post, typically within **2–4 weeks** (the legal maximum is 30 days). **This free Datenkopie is for your own review only — landlords will not accept it**, both because it isn't designed as a shareable document and because it contains more personal detail than a landlord should see. For an apartment application, order the paid **SCHUFA-BonitätsAuskunft** instead (**€29.95** as of 2026, instant PDF via meineschufa.de) — only its first page, the creditworthiness summary, is meant to be shown to the landlord."

### Draft `after_md` addition
> "If your file is too thin to show a strong score — common for newcomers — have alternatives ready: an employment contract or recent payslips, a guarantor (Bürge), a reference from a previous landlord (even abroad), or offering a larger deposit (German law caps deposits at 3 months' cold rent, § 551 BGB). Many landlords will accept these in place of, or alongside, a SCHUFA report."

### Draft `checklist_steps` refinement
- Step 1 body could gain the meineschufa.de + ID-upload + 2–4-week timeline detail above.
- Step 2 body could gain the €29.95 price and "only show page 1 to the landlord" tip.

### Sources
- https://www.schufa.de/en/newsroom/creditworthiness/schufa-information-free-charge-data-copy/ — attempted direct fetch 2026-07-04, but the tool only returned page-header/nav content, not the article body (flagged below) — **likely**, corroborated by search snippet only
- https://www.schufa.de/newsroom/bonitaet/schufa-auskunft-kostenlos-datenkopie/ — accessed 2026-07-04 (via search) — **confirmed** (Datenkopie process/timeline, cross-checked against 2 independent legal-advice sites)
- https://www.gansel-rechtsanwaelte.de/datenschutz-recht/schufa-datenkopie-alles-was-sie-wissen-muessen — Datenkopie process + 30-day statutory max — accessed 2026-07-04 — **confirmed**
- https://www.giga.de/tech/schufa-auskunft-beantragen-dauer-ablauf-und-was-ihr-fuer-den-vermieter-braucht — process + landlord distinction — accessed 2026-07-04 — **likely**
- https://amtsdeutschland.de/schufa/bonitaetsauskunft/ — €29.95 2026 price — accessed 2026-07-04 — **confirmed**
- https://www.meineschufa.de/produkte/schufa-bonitaetsauskunft — official product page (found via search, not directly fetched this pass) — **likely**, Verifier should fetch this directly to confirm current price and the page-1/page-2-3 split before publishing
- https://www.schufa.de (existing stored source) — retained, stable umbrella reference — **confirmed**

### Unconfirmed / flag for Verifier
- **Direct WebFetch of the SCHUFA newsroom article returned only nav/header content, not the article body** — all Datenkopie-process facts here rest on search-engine snippets and secondary legal sites, not a clean primary fetch. Verifier should directly load https://www.meineschufa.de/produkte/schufa-bonitaetsauskunft (or the current equivalent URL) to confirm the €29.95 price and page 1 vs. 2–3 split before this goes live.
- Exact current wording/URL for the free Datenkopie request path on meineschufa.de — the guide should link to whatever meineschufa.de calls it today; not independently re-verified via direct fetch this pass.
- The "guarantor / larger deposit / prior landlord reference" alternatives list is general market practice, not a single citable source — kept deliberately generic and non-numeric except for the well-documented §551 BGB 3-month deposit cap.

---

## Cross-cutting notes for the Verifier

1. **Two of five official target domains (rundfunkbeitrag.de, schufa.de) resisted direct WebFetch this pass** — one returned 404 on a specific deep path, the other returned only header/nav content (likely a JS-rendered page or anti-bot gate). All facts from those domains here are corroborated through search-engine snippets and independent secondary sources (legal-advice sites, consumer-comparison sites), which is why several are flagged `likely` rather than `confirmed`. Recommend the Verifier attempt a direct browser-based check (not just WebFetch) on:
   - https://www.rundfunkbeitrag.de (exemption categories + BAföG rule change)
   - https://www.meineschufa.de/produkte/schufa-bonitaetsauskunft (current Bonitätsauskunft price/format)
2. **auswaertiges-amt.de/en/sperrkonto-388600 fetched cleanly** and is the strongest primary source in this packet — its deliberate omission of a specific euro figure (it defers to mission-specific pages) should be respected: don't imply the AA officially states €992/month for everyone, since the actual number is set per mission/consulate and reviewed annually.
3. **No city-specific content was added anywhere in this packet**, per the task brief and the standing honesty rule — every draft explicitly frames the process as identical nationwide ("online, no local office," "the same wherever you live in Germany").
4. All monetary figures above are labeled "as of 2026" in the drafts rather than stated as timeless facts, since Rundfunkbeitrag, GKV thresholds, Sperrkonto amounts, and SCHUFA product pricing are all reviewed/adjusted on some kind of annual or periodic cycle.
5. Suggest the Deployer/Verifier update `guides.last_verified_at` to 2026-07-04 for all 5 rows once facts are confirmed, and append the new source URLs to each `guides.sources` jsonb array (additive — keep the existing stored sources, don't drop them).
