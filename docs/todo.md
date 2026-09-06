# To-do — what's left, in priority order

> Rules are in [`rules.md`](rules.md); what already exists is in
> [`status.md`](status.md). Keep this file honest: delete finished items rather
> than marking them done, and move anything shipped into `status.md`.
>
> Last updated: **2026-09-06**

---

## 1. Blocked on the owner (Claude cannot do these)

These are dashboard/account actions outside the codebase. The first two are the
only genuinely **urgent** items on this page.

- [ ] **Custom SMTP** (Supabase → Auth → Emails). The default sender is capped
      around 2 emails/hour and rejects `@example.com` — **it will fail under real
      traffic**, breaking signup and password reset. Set up Resend or Postmark.
      The domain now has real mailboxes (`team@` / `kontakt@germanyguide.net`,
      iCloud+ custom domain), so sender identity is settled — what is missing is
      a **sending** provider and its API key. **DNS caution:** the root domain's
      MX records now point at iCloud; verify the sending domain on a
      **subdomain** (`send.germanyguide.net`) so its records cannot collide with
      the mailboxes, and set `Reply-To: team@germanyguide.net`.
- [ ] **Switch the newsletter on.** All the code is built and deployed but
      dormant; the forms tell visitors it is unavailable rather than losing
      their address. Needed, in this order:
      1. **Resend account** (free: 3,000/month, 100/day) and verify
         **`send.germanyguide.net`** — a subdomain, so its records cannot
         collide with the iCloud MX on the root. Add the DKIM/SPF records
         Resend shows you.
      2. **Turn Resend's open- and click-tracking OFF.** `/privacy` states that
         we use neither; leaving them on makes that page untrue.
      3. Vercel env vars, **Production**: `RESEND_API_KEY`,
         `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API), and
         `CRON_SECRET` (any long random string — without it the cron route
         refuses to run at all). Optional: `NEWSLETTER_FROM`,
         `NEWSLETTER_REPLY_TO`, `NEWSLETTER_MAX_PER_RUN`.
      4. Use the same Resend account for the **custom SMTP** item above — one
         setup covers both.
      5. Then check `/admin/newsletter`: it should stop saying "not switched
         on". Subscribe yourself, confirm from the email, and press "Send a
         test to me" before the first real digest.
- [ ] **Auth URL config + email templates.** Site URL `https://germanyguide.net`,
      redirect `https://germanyguide.net/**`. Recovery/confirm templates must link to
      `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
      (and `type=email&next=/journey` for the signup confirmation).
- [ ] **Enable leaked-password protection** and a minimum length of 8 (the
      security advisor flags this).
- [ ] **Legal check before serious traffic:** confirm the real name/address in
      `/impressum`. The contact address is now `kontakt@germanyguide.net` on both
      `/impressum` and `/privacy` (was a Gmail address) — that part is done.
- [ ] **Search Console:** click Verify, submit `sitemap.xml`. Traffic data lags by
      days or weeks — don't act on an empty dashboard.
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
