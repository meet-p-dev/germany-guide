# Status — what exists and when it landed

> Snapshot of reality. Rules are in [`rules.md`](rules.md); open work in
> [`todo.md`](todo.md). **Verify counts against the live DB before relying on
> them** — see rules §4.
>
> Last updated: **2026-09-06**

## Where it stands

**Live at germanyguide.net.** Next.js 16 (App Router, TS strict, Tailwind v4) on
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

### 2026-09-06
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
