# Status — what exists and when it landed

> Snapshot of reality. Rules are in [`rules.md`](rules.md); open work in
> [`todo.md`](todo.md). **Verify counts against the live DB before relying on
> them** — see rules §4.
>
> Last updated: **2026-09-08**

## Where it stands

**Live at www.germanyguide.net** (the apex `germanyguide.net` 301s to it). Next.js 16 (App Router, TS strict, Tailwind v4) on
Vercel, content in Supabase (`ilfhjffpzvzphbvhdpup`), Framer Motion, Vercel
Analytics (cookieless).

| Content | Count |
|---|---|
| Cities live | **40** (0 coming_soon) |
| `city_steps` | **126** — every city has the big three (anmeldung, residence-permit, visa-extension); Munich/Ingolstadt/Nuremberg add public-transport + find-housing-remotely |
| `city_facts` | **240** — all 40 cities × 6 (first_days, housing ×2, insurance, banking, while_waiting) |
| Guide steps | 30 across 5 phases (decide → prepare → arrive → settle → live) |
| Glossary terms | 82 |
| Problems & solutions | 18 |
| Letter Helper entries | 13 |
| `/updates` items | 10 (+ RSS) |

**Features:** stage-first plan wizard, adaptive journey checklist, compact
per-city step pages + full Germany-wide guides, city hubs, glossary, problems,
Letter Helper, `/updates` + RSS, JSON-LD (Organization/WebSite/HowTo/Breadcrumb/
FAQ), per-step SEO titles/descriptions, canonicals, sitemap.

**Auth:** email + password (8+ chars, mixed case, number) + Google OAuth;
sign-up collects full name + home country; forgot/reset flow. Apple sign-in is
built but hidden (owner's Apple Developer account inactive) — restore from git in
`provider-buttons.tsx`.

**Automation:** the **review gate** — agents research, humans publish. Sweeps
live as slash commands in `.claude/commands/` (`/link-check`, `/verify-figures`,
`/city-research`, `/updates-scout`, `/session-close`); findings queue in
`proposed_changes` and are approved at `/admin/review`. Contract and SQL shapes
in [`automation.md`](automation.md). Nothing an agent finds reaches the site
without a human pressing Approve.

**Admin:** full-CRUD editor at `/admin` over all content tables, schema-driven
from `src/lib/admin/schema.ts`, writes via Server Actions. Access is gated by the
**DB, not the UI**: admin membership lives in a dedicated `public.admins` table
(*not* a role on `profiles`, which is self-updatable), and `public.is_admin()`
drives write RLS on every content table. Grant via `/admin/admins` or a SQL
insert. Owner patelmeet.2905@gmail.com is the first admin.

**AI (Groq):** letter decoder on `/letters`, step Q&A, sitewide chat widget with
a trust ladder (site → web → honest fallback). `GROQ_API_KEY` is set in Vercel.
The web-search rung still needs `TAVILY_API_KEY`.

## Changelog

### 2026-09-08
- **Canonical host is `www.germanyguide.net`.** Every canonical, the sitemap,
  `metadataBase`, the JSON-LD `BASE_URL`, the RSS feed, robots.txt and the
  newsletter links said `https://germanyguide.net` — but Vercel 301s the apex to
  `www`, so all 266 sitemap URLs and every `<link rel="canonical">` pointed at a
  redirect. Owner confirmed `www` is the intended host, so the code moved to it
  rather than the redirect being flipped. Includes the RFC 8058
  `List-Unsubscribe` endpoint, where a 301 on a POST breaks one-click
  unsubscribe in some mail clients. Mailboxes (`kontakt@`, `team@`) and the
  `send.germanyguide.net` sending subdomain are unrelated and unchanged.
- **Custom SMTP is live and proven.** Supabase Auth → Emails → SMTP Settings is
  enabled against `smtp.resend.com:465`, username `resend`, sender
  `noreply@germanyguide.net` / "Germany Guide". **Verified end to end on
  2026-09-08** by sending a real password reset from `/signin`: Resend logged it
  as **Delivered** to the owner's Gmail. Before that test nothing had ever been
  sent — Resend's dashboard read "No sent emails yet" — so the configuration had
  never actually been exercised. The default-SMTP cap that `todo.md` warned
  would break signup under real traffic is gone.
- **The Resend domain is the ROOT `germanyguide.net`** (Verified, region
  **Ireland `eu-west-1`**), *not* the `send.` subdomain the docs planned for.
  Resend's own layout keeps the mailboxes safe anyway: DKIM on the root, and
  return-path SPF/MX on `send.germanyguide.net`, so the root MX stays iCloud's.
  Consequence for code: the visible sender must be `@germanyguide.net`. The
  newsletter's `NEWSLETTER_FROM` had defaulted to `@send.germanyguide.net`,
  which Resend would have rejected — fixed 2026-09-08.
- **Mail DNS is complete as of 2026-09-08.** Added in Cloudflare and confirmed
  live on the authoritative nameservers *and* public resolvers (1.1.1.1,
  8.8.8.8):
  - `send` **MX** → `feedback-smtp.eu-west-1.amazonses.com`, priority 10. This
    was genuinely missing while **Resend's UI showed the row as "Verified"** —
    a stale badge cached from setup two months earlier. Without it, bounce and
    complaint feedback had nowhere to route. **Trust DNS over a provider's
    dashboard badge.**
  - `_dmarc` **TXT** → `v=DMARC1; p=none;` (monitor-only, no enforcement).
  Re-checked after the change: root MX is still `mx01/mx02.mail.icloud.com`,
  root SPF still `include:icloud.com`, the `send` SPF and the root DKIM
  untouched, and Resend still reads **Verified**.
- **Never switch on Resend's "Enable Receiving".** It asks for an MX on **`@`
  (the root)** pointing at `inbound-smtp.eu-west-1.amazonaws.com`, which would
  override the iCloud MX and **break the `kontakt@` and `team@` mailboxes**. It
  currently reads "not started" and must stay that way. This is the concrete
  form of the collision the docs had warned about in the abstract.
- **Resend open/click tracking is off** (no custom tracking subdomain
  configured), which is what `/privacy` claims. Leave it off.
- **Supabase Auth moved to the www host** (project `ilfhjffpzvzphbvhdpup`,
  Authentication → URL Configuration). Site URL is now
  `https://www.germanyguide.net`. The redirect allowlist holds **both**
  `https://germanyguide.net/**` and `https://www.germanyguide.net/**` — the
  apex entry is kept deliberately so a recovery or confirmation link already
  sitting in someone's inbox still resolves. Verified by reloading the page,
  not just by the success toast.
  - The **email templates were already correct** and needed no edit: both use
    `{{ .SiteURL }}`, so they picked up the new host on their own. Confirm
    sign-up links to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}`
    `&type=email&next=/journey`, reset password to the same with
    `&type=recovery&next=/reset-password`. `todo.md` had been carrying this as
    outstanding; it was stale.
- **Search Console is verified and wired up** (account
  `germanyguide.net@gmail.com`). The property is a **Domain property,
  `sc-domain:germanyguide.net`**, which covers every subdomain and both
  protocols — so it already covers `www` and no separate www property is
  needed. A second, older URL-prefix property `https://germanyguide.net/`
  also exists; it only covers the apex, which now just redirects, so it is
  effectively dead weight (harmless, left in place).
  - Sitemaps: the apex `https://germanyguide.net/sitemap.xml` was submitted
    2026-09-07 and reads **Success, 266 pages** (it follows the redirect and
    now serves the www URLs). `https://www.germanyguide.net/sitemap.xml` was
    added 2026-09-08 and currently says "couldn't fetch" — the file was
    validated by hand (no BOM, correct namespace, 266 locs, all www, no
    duplicates, 36 KB, `200 application/xml`), so this is Google's fetch
    queue, not the file. Re-check it.
  - **Indexing requested** for 5 URLs: `/`, `/cities`, `/process`,
    `/cities/munich/anmeldung`, `/cities/berlin/residence-permit`.
  - **The homepage had been dropped as "Page with redirect."** Its last crawl
    was **2026-07-06**, when Googlebot followed `www` to a redirect. A live
    test on 2026-09-08 now returns "URL is available to Google / Page can be
    indexed", so the host fix resolved it — but it explains why the site has
    no index presence at all today.
  - **Rich-result reality check:** the live test lists **Breadcrumbs** as the
    only detected enhancement. `FAQPage` is not reported (Google restricted
    FAQ rich results to government and health sites in 2023) and `HowTo` is
    not reported (Google retired HowTo rich results in 2023). Both schemas are
    still worth keeping for entity understanding and AI surfaces, but neither
    will produce a visual snippet. Do not chase them.

### 2026-09-07
- **On-page SEO pass, code only — no content table was touched.** New
  `src/lib/seo.ts` composes every per-city title, description and FAQ from the
  existing verified row; nothing was written to `city_steps` or `steps`.
  - **60 of the 126 city-step pages had titles over 60 characters** and were
    truncated in search, cutting off the city name. Search-first labels
    ("Anmeldung in Munich: Appointment Only") bring all 126 to <=60, and every
    description to <=160. Audited by fetching all 126 URLs, not by sampling.
  - **Canonicals added to 12 routes that had none** — `/`, `/cities`,
    `/cities/[city]` (40 pages), `/process`, `/problems`, `/costs`,
    `/why-germany`, `/glossary`, `/letters`, `/plan`. Only `/guide/[slug]`,
    `/cities/[city]/[slug]` and `/updates` had one before.
  - **FAQPage JSON-LD on all 126 city-step pages**, plus a visible "Common
    questions about <City>" section rendering the same pairs. Every answer is
    an existing field (`method_note`, `address`, cost, `deadline_rule`) — no
    generated prose, so the markup describes content that is really on the page.
  - **Internal links:** each city-step page now links to up to 3 sibling steps
    for the same city, with the step and city in the anchor text. Previously
    these 126 pages linked only up to the city hub and across to the full guide.
  - `/costs` and `/why-germany` **were missing from `sitemap.xml`** and are now in.
  - Guarded against re-publishing the eWA/eID error: the stale
    `method = 'online'` on 13 `anmeldung` rows is never rendered into a title,
    snippet or FAQ answer. See `solutions.md`.
- **The counts in this file are stale.** Live `count(*)` on 2026-09-07:
  **41 cities** (40 with `city_steps`), **36 problems**, **141 glossary terms**,
  **22 letters** — this file claimed 40 / 18 / 82 / 13. Steps and `city_steps`
  (30 / 126) still match. Nobody has audited when the extra rows landed; treat
  every count here as a hint and run the query (rules §4).

### 2026-09-06
- **Deployed to production.** The review gate went live, and with it two commits
  that had been sitting **unpushed** since 2026-09-05: the whole opt-in
  newsletter and the `kontakt@germanyguide.net` contact address. Production had
  been running `791448d` — `status.md` and `todo.md` both described the
  newsletter as "deployed", which was untrue. Watch for this: a local commit is
  not a deploy, and `git log` alone will not tell you (check `origin/main`).
- **First `/link-check` sweep run.** 204 URLs checked: 187 OK, 9 bot-blocked
  (ignored), **8 genuinely broken**. All nine resulting fixes reviewed and
  applied - Hamburg (Studierendenwerk moved to `stwhh.de`), Kiel (registration
  page 500s, new service id), Mainz x2 (Ausländerbehörde page 404s), Erlangen
  (linked a deleted news article), Dresden (deep CMS path 404s), Jena (English
  path 500s), Berlin (dorm URL needs a trailing slash), and Munich - where
  **MVV has suspended the Semesterticket**, so the card was offering a ticket
  that is no longer sold.
- **"Register online" was wrong for our whole audience in 14 cities.** The
  federal eWA takes a German Personalausweis or an EU/EEA eID-Karte only, so no
  first-time third-country arrival can use it. `method_note` rewritten for all
  14; Erlangen's `method` corrected to `walk_in`. See `solutions.md`.
- **Review gate built.** New `proposed_changes` table (admin-only both ways, no
  public read) plus `/admin/review` with before/after, the source link, and
  Approve / Reject. Scheduled agents queue proposals here instead of writing to
  content tables, which is what keeps rule #1 true once the site updates itself.
  Three guards: a **table+field whitelist** (an agent reading a hostile web page
  still cannot aim a write at `admins` or `profiles`), **optimistic concurrency**
  against a `current_value` snapshot (a stale finding is refused, not applied
  over a newer human edit), and **NOT NULL `source_url`**. `last_verified` moves
  only when the reviewer ticks "I checked the source" — never automatically.
  Writes go through the admin's own cookie client so RLS authorizes them exactly
  as a manual `/admin` edit; the service role is deliberately not used.
- **Five slash commands** in `.claude/commands/` encoding the sweeps and the
  project's hard rules, plus [`automation.md`](automation.md) as the contract.
- `coerceValue` split out of `coercePayload` so one proposed field can be
  coerced without a surrounding form.
- Logged the **iCloud `node_modules` eviction** trap in `solutions.md`
  (`ETIMEDOUT` from `readFileSync`, `tsc` at 9 min wall / 3 s CPU).

### 2026-09-05
- **Opt-in newsletter built** (dormant until the owner sets two env vars).
  Double opt-in throughout: `newsletter_subscribers` +  `newsletter_sends`
  tables, RLS on with **no** anon/authenticated policy so addresses are
  unreachable from the browser and every access goes through the service role.
  Signup in the footer and on `/updates`, an opt-in toggle on `/account`,
  `/newsletter/confirm` and `/newsletter/unsubscribe`, RFC 8058 one-click
  unsubscribe at `/api/newsletter/unsubscribe`, and `/admin/newsletter` with
  counts, the pending queue, test-send and send-now. A monthly Vercel cron
  (`vercel.json`, 09:00 on the 1st) mails every update not yet delivered and
  skips itself when nothing is new. **The 160 existing account holders are not
  subscribers** — an account is not consent, so they only receive mail if they
  opt in. `/privacy` gained a section covering exactly what is stored.
- **Real mailboxes on the domain.** `team@germanyguide.net` and
  `kontakt@germanyguide.net` exist (iCloud+ Custom Email Domain, so the root
  domain's MX records now point at Apple). `/impressum` and `/privacy` show
  `kontakt@germanyguide.net` instead of the old Gmail address, as a `mailto:`
  link. Anything that *sends* mail must verify a **subdomain**
  (`send.germanyguide.net`) so it cannot collide with those MX records.

### 2026-09-04
- **`city_steps.content_md` is now rendered.** It previously reached no page at
  all: `StepView` was its only consumer, used solely by `/guide/[slug]`, which
  passes `activeCitySlug={null}`. Added a **"How it works in \<City>"** section to
  `CompactStepView`, so all 40 cities' local detail is finally visible on
  `/cities/[city]/[slug]`. Verified in light and dark mode.
- **`city_facts` extended from 3 cities to all 40** (18 → 240 facts). Dorm
  figures from each city's own Studierendenwerk; rents cited to empirica /
  Moses Mendelssohn Institut summer semester 2026, with 2024 figures labelled as
  such; insurance names the correct regional AOK (11 of them) instead of invented
  addresses.
- **4 new cities: Augsburg, Würzburg, Göttingen, Bochum** (36 → 40), each
  verified against the official city sites, plus their `site-config.ts` cards.
- Expanded `city_steps` content + tips for **Hamburg, Stuttgart, Düsseldorf,
  Leipzig** (~570–690 → ~1,400–1,750 chars/step).
- Re-verified the 9 original city procedures. Corrections: **Munich Anmeldung is
  appointment-only** (was documented as walk-in); **Nuremberg permits are online**
  (was email) at the Amt für Migration und Integration, Äußere Laufer Gasse 25
  (the old "Lorenzer Straße 20" was wrong); Munich's office is now the
  Servicestelle für Zuwanderung und Einbürgerung, processing **up to 10 months**.
- Fixed the `quick_action` `{address}` separator, which rendered
  "…expires)Landesamt…" on **every** city's plan card.
- Fixed doubled apostrophes ("Berlin''s") from `''` inside dollar-quoted SQL, and
  reflowed all 40 `first_days` facts so their numbered lists render properly.
- Docs restructured into `rules.md` / `status.md` / `todo.md`.

### 2026-09-03
- Three `/updates` items: the Deutschlandticket price index (from 2027 the price
  is calculated, announced by 30 Sept, applies 1 Jan), minimum wage €14.60/h +
  Minijob €633/mo from 1 Jan 2027, and a 36-cities item superseding the stale
  "all 30 city guides live" note in prose.

### 2026-08-08
- **Ingolstadt and Nuremberg** brought to Munich's depth: `city_steps` 3 → 5 each
  (public-transport, find-housing-remotely) plus 6 `city_facts` each.
- Key finding: both cities' halls are run by **Studierendenwerk
  Erlangen-Nürnberg**, not Munich's — check the provider per city.

### 2026-07-22
- Compact/full split built: `steps.quick_action` column + `city_facts` table
  (public-read / `is_admin()` write RLS), both wired into `/admin` and
  `supabase/types.ts`; `CompactStepView`; city-hub facts sections; deadline
  banner; journey-map locked states from `depends_on`.
- Munich filled first: 29 `quick_action` templates, 6 `city_facts`.
- `/admin` content editor shipped and committed.
- QA round 2 fixes: iOS Safari zoom on search inputs, chat-widget offline retry,
  laptop header crush, global smooth-scroll removed, footer active state.

### 2026-07-18 → 07-20
- Full rebuild of germanyguide.net; auth (password + OAuth); naive-user
  walkthrough that produced the open bug list in `todo.md`.
- Guide content pass: all 30 steps given full requirements, costs, deadlines and
  **red-flag** sections; after-guide sections grown to 13 letters, 18 problems,
  82 glossary terms.

## Verified 2026 figures (re-verify every January)

Blocked account **€11,904/yr (€992/mo)** · Deutschlandticket **€63/mo** (reduced
Bavarian student rate €43) · minimum wage **€13.90/h** (→ €14.60 in 2027),
Minijob **€603/mo** (→ €633) · EU Blue Card **€50,700** standard /
**€45,934.20** shortage & new graduates · Rundfunkbeitrag **€18.36** · student
health insurance **~€140–150/mo** · uni-assist €75 first + €30 each · ZAB
Zeugnisbewertung €208 · D visa €75 · residence permit ~€100 · first eAT €100 /
renewal €93 · Fiktionsbescheinigung €13 · student work 140 full / 280 half days,
Werkstudent 20h/week · national WG-room average **€512/mo** (MMI, March 2026).

**Most of these reset every January** — searching content for "2026" finds them.

## City traps worth remembering

**Wrong building / wrong authority** (costs weeks):
- **Aachen** — permits are the *StädteRegion* Aachen, not the city.
- **Saarbrücken** — permits are the ZAB at the LAVA in **Lebach, ~30 km away**.
- **Cologne** — permits split across **9 district offices by registered address**.
- **Göttingen, Augsburg** — city vs surrounding *Landkreis* are separate authorities.
- **Hamburg** — Welcome Center for workers, Amt für Migration for students.
- **Kiel, Wuppertal** — registration and permit at different addresses; Wuppertal's
  registration office **moved Dec 2025** to Döppersberg 41.
- **Augsburg** — Bürgeramt is at An der Blauen Kappe 18, *not* the Rathaus.
- **Essen** — the Ausländerbehörde is **closed Wednesdays**.
- **Bochum** — Querenburg, the office nearest the RUB campus, is **closed**.

**Local wins worth surfacing:**
- **Stuttgart** — Anmeldung **and** first permit in *one visit* at any Bürgerbüro
  except Mitte.
- **Ulm** — still takes **walk-ins Mon–Fri**.
- **Leipzig** — walk-ins allowed, new slots weekdays 17:00, and re-registering
  also updates the address on your residence permit.
- **Göttingen** — official **emergency-ticket** fallback when no slot exists.
- **Magdeburg** — **08:00–09:00 walk-in window**.
- **Dortmund** — **abolished its hall waiting list** (Aug 2024); rooms are posted
  online and you apply directly.
- **Bochum** — finished eAT collected with **no appointment** (Historic Town Hall
  pickup box).
- **Würzburg** — walk-in Service-Points, caseworkers by **first letter of surname**.
