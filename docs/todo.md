# To-do — what's left, in priority order

> Rules are in [`rules.md`](rules.md); what already exists is in
> [`status.md`](status.md). Keep this file honest: delete finished items rather
> than marking them done, and move anything shipped into `status.md`.
>
> Last updated: **2026-09-08**

---

## 1. Blocked on the owner (Claude cannot do these)

These are dashboard/account actions outside the codebase. **Custom SMTP — long
the most urgent item here — is done and proven** (2026-09-08, see `status.md`),
so signup and password reset no longer sit on the default sender's ~2/hour cap.
Nothing on this page is now urgent in that sense.

- [ ] **Finish the newsletter: set `CRON_SECRET`.** The newsletter itself went
      live 2026-09-08 (see `status.md`) — signup, confirmation email and delivery
      all verified. What is left is the **monthly digest cron**, which refuses to
      run without `CRON_SECRET` in Vercel Production. Generate one with
      `openssl rand -base64 32`, add it, and redeploy (env vars are read at build
      time). Then confirm the owner's own pending subscription from the email and
      use `/admin/newsletter` → "Send a test to me" before the first real digest.
      Note `NEXT_PUBLIC_SITE_URL` in Vercel predates the www move and is
      referenced nowhere in `src/` — safe to delete, and worth deleting so it
      stops looking meaningful.
- [ ] **Enable leaked-password protection** and a minimum length of 8 (the
      security advisor flags this).
- [ ] **Legal check before serious traffic:** confirm the real name/address in
      `/impressum`. The contact address is now `kontakt@germanyguide.net` on both
      `/impressum` and `/privacy` (was a Gmail address) — that part is done.
- [ ] **Search Console — one thing left to check.** Verification, sitemaps and
      the first indexing requests are done (2026-09-08, see `status.md`). The
      open item: the `https://www.germanyguide.net/sitemap.xml` entry read
      "couldn't fetch" on submission. The file was hand-validated and is fine,
      and the apex sitemap entry reads Success with 266 pages, so discovery is
      not blocked — but confirm the www entry flips to Success. If it is still
      failing after a few days, delete and re-add it. Traffic data lags by days
      or weeks; don't act on an empty dashboard.
- [ ] **`TAVILY_API_KEY`** in Vercel *Production* to switch on the AI web-search
      rung. Vercel gotchas: exact name, tick Production, save **before** redeploy.
- [ ] **Google OAuth consent screen:** set app name "Germany Guide" + logo in
      Google Cloud (free) so the dialog stops showing the supabase.co domain.
- [ ] **Owner's two drone photos: optimise and record, then use or remove.**
      `public/images/dji_fly_20250827_…jpg` and `dji_fly_20260121_…jpg` are the
      **owner's own photos**, so there is no attribution question — but they are
      **8.8 MB / 8064×4536** and **8.1 MB / 6956×3913**, roughly 5× the project's
      1600px standard, and nothing on the site references them, so ~17 MB sits in
      the repo doing no work. Metadata check: **no GPS tags** (good), but camera
      EXIF, an XMP block and an ICC profile remain, which the project's standard
      strips. Both show the same white church with a pillared belfry over a flat
      Bavarian-looking town (summer dusk and winter haze).
      **Needs from the owner:** which city/place this is. Then: resize to 1600px,
      strip metadata, rename `city-<slug>.jpg`, add a `CREDITS.md` line as an
      owner-original (same wording as `city-ingolstadt.jpg` /
      `city-erlangen.jpg` — provenance for future reference, not third-party
      attribution), and wire into `site-config.ts`. If they are not meant for the
      site, delete them so the repo stops carrying them.
- [ ] **City photos.** Most of the 40 cities render the branded placeholder
      (`image: null`). Send licensed photo links; each must be recorded in
      `public/images/CREDITS.md` per the image-licensing rule.

## 2. Important — real bugs and gaps

- [ ] **Signup shows `{}` on an unexpected error.** `friendlyAuthError` in
      `src/components/auth/sign-in-form.tsx` returns the raw message for
      unmatched errors, so a server 500 renders literally as `{}`. Needs a
      generic fallback string. *Small fix, bad first impression.*
- [ ] **Persona mismatch.** The homepage advertises Refugee / EU citizen /
      Joining family, but the `/plan` wizard only offers Student / Skilled worker
      / Not sure yet. Either build those paths or stop advertising them.
- [ ] **Accessibility:** several selectable cards (plan options, "Read the guide",
      problem cards, city/letter chips) are buttons/links with **empty accessible
      names**. Screen-reader users cannot tell them apart.
- [ ] **Verify both AI features actually work in production.** They can read as
      "not switched on" in some environments even with the key set — check before
      demoing.

## 3. Automation — the review gate is in, the sweeps are not scheduled

The gate itself is built (see `status.md`), so these are safe to run: nothing
they find can reach the site unreviewed.

- [ ] **Per-city pass on the 13 remaining `method = online` cities.** Erlangen is
      corrected; the other 13 still show an "online" chip that their first-time
      readers cannot use. Each needs its real in-person route checked (walk-in vs
      appointment) before `method` can be set honestly - see `solutions.md`.
- [ ] **Schedule the sweeps.** `/link-check` monthly, `/verify-figures`
      quarterly and hard every January, `/updates-scout` weekly. They exist as
      commands but nothing runs them yet — today they are manual.
- [ ] **First real run of `/link-check`** across all 40 cities. This has never
      been done; the Munich walk-in and Nuremberg address errors both survived
      months because nothing was watching. Expect real findings.
- [ ] **Reconcile the content counts in `status.md`.** A live `count(*)` on
      2026-09-07 returned 41 cities, 36 problems, 141 glossary terms and 22
      letters against the documented 40 / 18 / 82 / 13. Either the docs drifted
      or rows landed without a changelog entry. Worth an hour: check the 41st
      city has `city_steps` (only 40 do) and that the extra problems/glossary
      rows are finished, not drafts.
- [ ] **Staleness surfacing.** Nothing yet flags a `last_verified` that has gone
      old. A query on the `/admin` overview would make rot visible instead of
      silent.
- [ ] **Agent-facing runbook for `/city-research`** once the first few cities are
      done — capture what a good `city_steps` row actually contains, so batch
      runs stay consistent.

## 4. Worth doing next (content depth)

- [ ] **The two extra `city_steps`** (`public-transport`,
      `find-housing-remotely`) exist only for Munich, Ingolstadt and Nuremberg.
      Extend to the other 37 cities — needs the local operator and the real
      student ticket price per city, plus the local Studierendenwerk for housing.
      *This is the main remaining content lift.*
- [ ] **Per-step SEO labels for the remaining steps.** `CITY_STEP_SEARCH_LABEL`
      in `src/lib/seo.ts` covers the five steps that have `city_steps` rows. Any
      new city step falls back to the long editorial `steps.title`, which will
      truncate again — add a short search label at the same time as the rows.
- [ ] **Persona-split costs.** The data model has no per-persona figure, so the
      compact card is persona-neutral. "€43 because you're a student" needs
      per-persona `city_step` figures before it can be shown honestly.
- [ ] **Re-verify every figure each January** — see the list in
      [`status.md`](status.md). Searching content for "2026" finds them.
- [ ] **Journey Map rebuild** as a whole-journey view (done ▪ next ▪ locked, with
      "needs Anmeldung" reasons from `depends_on`). Partially in place.

## 5. Nice to have / low priority

- [ ] Owner sanity-check on a few local facts: private-market rents come from
      asking-price indices rather than an official Mietspiegel (fine as a cited
      range, but a local eye helps); the Nuremberg WG figure (~€425) is from a
      **2023** index and flagged as dated in the text; TK is only one insurer per
      city; bank names are editorial, not endorsements; Ingolstadt's
      Canisiusstiftung capacity/prices were never confirmed on its own site.
- [ ] More `city_facts` categories per city if a city warrants it (six is the
      current shape, not a hard cap).
- [ ] Backlinks are the biggest remaining traffic lever — expat forums, university
      pages, city subreddits. **Outreach, not code.**

## 6. Explicitly not doing

Rejected on purpose. Do not resurrect without a deliberate decision:

- City **comparison** tools, a forum, visa consultancy, a housing/job
  marketplace, culture/tourism content (see the scope guard in `rules.md`).
- **Monetization** — traffic first. (Raised again 2026-09-06; still parked.
  Note that running ads in the EEA requires a consent-management platform, which
  would make `/privacy` untrue as written — so this is a real change, not a
  switch to flip.)
- **Moving the entity to India to escape GDPR** — considered 2026-09-06 and
  rejected on the facts: GDPR Art. 3(2) follows the *users*, not the company, so
  a site targeting people moving to Germany stays in scope. It would also add an
  Art. 27 EU-representative duty and India's DPDP Act on top, while ad networks
  demand a CMP for EEA traffic regardless. Confirm with a lawyer before ever
  revisiting.
- Hand-writing `quick_action` per city × persona (~1,188 cards). One template per
  step, filled from data.
