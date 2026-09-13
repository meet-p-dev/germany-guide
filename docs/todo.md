# To-do — what's left, in priority order

> Rules are in [`rules.md`](rules.md); what already exists is in
> [`status.md`](status.md). Keep this file honest: delete finished items rather
> than marking them done, and move anything shipped into `status.md`.
>
> Last updated: **2026-09-13**

---

## 1. Blocked on the owner (Claude cannot do these)

These are dashboard/account actions outside the codebase. **Custom SMTP — long
the most urgent item here — is done and proven** (2026-09-08, see `status.md`),
so signup and password reset no longer sit on the default sender's ~2/hour cap.
Nothing on this page is now urgent in that sense.

- [ ] **Confirm the newsletter's own subscription, then watch the first cron.**
      All three env vars are set and the newsletter is live (2026-09-08, see
      `status.md`). Two loose ends, neither urgent:
      1. The owner's subscription is at status **`pending`** — open the
         confirmation email and click the link, which is the one leg of the flow
         nobody has exercised yet.
      2. The monthly cron first fires **1 October 2026, 09:00**. Its authorised
         path cannot be tested from outside (Vercel supplies the bearer token),
         so check Resend's log or `/admin/newsletter` that morning. Before then,
         `/admin/newsletter` → "Send a test to me" is the safe rehearsal.
      Also worth deleting: `NEXT_PUBLIC_SITE_URL` in Vercel predates the www
      move and is referenced nowhere in `src/`.
- [ ] **Enable leaked-password protection** and a minimum length of 8 (the
      security advisor flags this).
- [ ] **Legal check before serious traffic:** confirm the real name/address in
      `/impressum`. The contact address is now `kontakt@germanyguide.net` on both
      `/impressum` and `/privacy` (was a Gmail address) — that part is done.
- [ ] **Search Console: read the Domain property once it has processed.** The
      404, soft-404 and noindex causes were fixed and deployed 2026-09-13
      (`8477181`, see `status.md`). The owner then **removed the old URL-prefix
      property** (`https://germanyguide.net/`), so the *Validate fix* runs
      started there are gone with it. What remains is the **Domain property
      `sc-domain:germanyguide.net`**, which covers www and the apex together
      and is the only one needed. On 2026-09-13 its Page indexing report still
      read "Processing data". When it shows numbers, open each row of *Why
      pages aren't indexed* and press *Validate fix* on 404, Soft 404 and
      noindex. The www sitemap now reads **Success, 266 pages** (it had read
      "couldn't fetch" on 2026-09-08). The 370
      *Discovered / Crawled, currently not indexed* URLs are not a code fault:
      they need backlinks and time (see §2b).
- [ ] **Give the index checker read access, then run it.** Follow the six
      steps in `automation.md` ("One-time setup for `seo:index-status`"):
      a Google Cloud service account, its JSON key saved outside the repo, and
      its email added as a Restricted user in Search Console. Then
      `npm run seo:index-status` checks all 269 URLs in a few minutes.
- [ ] **Bing Webmaster Tools:** sign in at bing.com/webmasters and choose
      *Import from Google Search Console*. IndexNow already sends Bing the
      pages; this adds Bing's own reports.
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

## 2b. Growth, Stage 1 (free channels, started 2026-09-13)

Traffic first, and free channels before paid ones: ads bring visits that stop
when the budget stops, while indexed pages keep bringing people in. Material is
in `marketing/`. **Claude drafts, the owner approves every post and every
message**; nothing is sent from an automated login.

- [ ] **Film and post the 10 Reels** in `marketing/reels.md`, starting with #1
      (online Anmeldung does not work for non-EU arrivals). Re-check each fact
      on its linked page first. Schedule through Meta Business Suite, or connect
      Metricool so Claude can queue drafts for approval.
- [ ] **Send the 8 backlink emails** in `marketing/outreach.md` from
      `kontakt@germanyguide.net`, one follow-up after 7 days, and track status
      in the table.
- [ ] **Finish the creator shortlist** to about 20 (6 found so far) and check
      each channel's last upload before pitching.
- [ ] **Instagram bio link** should point at a tagged URL
      (`?utm_source=instagram&utm_medium=social`) so Vercel Analytics can
      separate social traffic.
- [ ] Stage 2 (small Meta ad test) waits until Stage 1 has run for a few weeks
      and the owner sets a budget. **No Meta Pixel**: it needs a consent banner
      and would make `/privacy` untrue. Use UTM links instead.

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
- [ ] **Check the extra problems, glossary and letters rows are finished.** The
      counts in `status.md` are now reconciled against a live `count(*)` (41
      cities, 129 city_steps, 287 city_facts, 36 problems, 141 glossary terms,
      22 letters). What was never established is *when* the extra problems,
      glossary and letter rows landed, or whether they are complete rather than
      drafts. Worth a read-through. Fürth is built and this is no longer a
      city-count question.
- [ ] **Staleness surfacing.** Nothing yet flags a `last_verified` that has gone
      old. A query on the `/admin` overview would make rot visible instead of
      silent.
- [ ] **Agent-facing runbook for `/city-research`** once the first few cities are
      done — capture what a good `city_steps` row actually contains, so batch
      runs stay consistent.

## 3b. House-style cleanup (new, 2026-09-08)

The standard now exists in [`writing.md`](writing.md); the corpus predates it.
**Do not attempt one sweeping rewrite** — 595 prose rows is a rewrite of the
site, and a bulk regex over em dashes produces comma splices at scale. Work in
this order, highest visible return first. **The `src` UI pass is done**
(2026-09-08, see `status.md`); what is left is the database:

- [ ] **The 30 `steps.content_md` rows.** Every one has an em dash, averaging
      7.8 each, and these carry the Germany-wide guides.
- [ ] **The 86 `city_steps` rows opening `**The flow:**`**, highest-traffic
      cities first. Also the ~20 bold spans per row.
- [ ] **`city_facts`**, 240 rows — mostly a dash-and-bold fix, not a rewrite.
- [ ] **`problems`, `letters`, `glossary_terms`** as they are next touched.
- [ ] **A `/style-check` sweep** in `.claude/commands/`, running the §8
      detectors and queueing rewrites through `proposed_changes` like any other
      content change.

Facts, figures and `last_verified` do not move during a style pass. If a plain
rewrite needs a fact you cannot verify, leave the fact out.

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
