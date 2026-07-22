# Project state — read me first

> **Purpose.** This is the portable "brain" for Germany Guide: what the site is,
> where it stands right now, what to use, what NOT to touch, and what's still
> pending. It is **git-tracked and inside the repo on purpose** — so any Claude,
> on any account or surface (desktop app *or* terminal CLI), picks it up. Rules
> live in [`CLAUDE.md`](../CLAUDE.md) and [`AGENTS.md`](../AGENTS.md); this file
> is the *living status* layer. **Keep it current — update it at the end of any
> work session** (it is the one place a fresh Claude will trust).
>
> Last updated: 2026-07-22 (blueprint added: compact/full split gated by city
> selection + real city hubs via a new `city_facts` table — see "Planned
> direction" below; not built yet).

## What this site is (1-paragraph version)

**Germany Guide** (germanyguide.net) walks international students and workers
through the entire journey to Germany — from the first thought to fully settled —
with steps that **adapt to their exact city**, because the same federal paperwork
works differently at every city's counter (Munich appointment-only Anmeldung;
Ingolstadt online → surname-team → one visit; Nuremberg online). See `CLAUDE.md`
for the locked goal and the scope guard. **It is NOT** a city-comparison tool, a
forum, a visa consultancy, a housing/job marketplace, or a culture/tourism blog.
These were explicitly rejected — don't re-litigate them.

## Stack & where things live (what to use)

- **Next.js 16** (App Router, TS strict, Tailwind v4) on **Vercel** — deploys
  from `main` via the Vercel GitHub app; feature branches make preview deploys
  only. **This is NOT the Next.js you know** — read `AGENTS.md`; middleware is
  `src/proxy.ts`, not `middleware.ts`.
  - **Deploy gotcha (verified 2026-07-22):** commits can reach GitHub without
    triggering a Vercel build — the last commit of a session often sits on
    `origin/main` un-deployed. An explicit `git push` (add an
    `--allow-empty` commit if HEAD is already pushed) fires the webhook and
    Vercel builds within seconds. After finishing work, verify the tip commit
    actually deployed: `list_deployments` (Vercel MCP) or the dashboard — don't
    assume "committed" means "live." germanyguide.net is the production alias on
    the latest READY `target: production` deploy.
- **Supabase** (Postgres + RLS) holds ALL content — never hardcode content in
  code (the only exception is the small city/persona card config in
  `src/lib/site-config.ts`). Content tables are public-read; user tables are
  per-user RLS. Project ref `ilfhjffpzvzphbvhdpup`. After schema changes:
  regenerate `src/lib/supabase/types.ts` and run the security advisors.
- **Framer Motion** only for motion; animate `transform`/`opacity`, always
  respect `prefers-reduced-motion` (MotionConfig is global).
- Content model: `phases` → `steps` (atomic, persona-filterable) → `city_steps`
  (per-city overrides w/ method + `last_verified`). Plus `glossary_terms`,
  `problems`, `letters`, `updates`, and per-user `profiles` / `user_progress`.
- Verify before claiming done: `npx tsc --noEmit && npx eslint . && npm run build`
  must all pass. For UX changes walk both an Explorer (no city) and a Committed
  visitor (city + "moving soon") through plan → journey → step, light + dark.

## What NOT to do (hard rules — full list in CLAUDE.md)

- **No emojis anywhere on the site.** Expression = lucide icons, type, photos, motion.
- **Every image must be verifiably licensed.** Never add a photo of unknown
  provenance. The ONE canonical credits file is
  [`public/images/CREDITS.md`](../public/images/CREDITS.md) (updated in the same
  commit as any image change). Do not add credit tables elsewhere.
- **Never fabricate city data or figures.** Every city claim is researched
  first-hand from official sources and carries a `last_verified` date + method
  (walk_in / appointment / email / online / post).
- Keep the German identity: flag palette (cream/black/crimson/gold), tricolor
  top stripe, real German city photography, German terms as first-class vocab.
- Keep disclaimers (general info, not legal advice) and link official sources.

## Current state (as of 2026-07-22)

- **Cities: all 36 live, 0 coming_soon, 108 `city_steps` (36 × 3:** anmeldung,
  residence-permit, visa-extension). Full list + per-city office/quirk notes are
  in Supabase; the roster is Munich, Nuremberg, Ingolstadt, Berlin, Frankfurt,
  Cologne, Heidelberg, Freiburg, Aachen, Münster, Bonn, Mannheim, Hamburg,
  Stuttgart, Düsseldorf, Leipzig, Dresden, Hanover, Bremen, Dortmund, Essen,
  Karlsruhe, Darmstadt, Mainz, Saarbrücken, Kiel, Rostock, Potsdam, Magdeburg,
  Jena, Erlangen, Regensburg, Chemnitz, Wuppertal, Ulm, Kassel.
- **`/cities` renders coming_soon/live cards from the `cities` TABLE (getCities),
  not the config array** — new cities MUST be inserted into Supabase, not just
  `site-config.ts`.
- **Auth:** email + password (8+ chars, mixed case, number) + Google OAuth,
  sign-up collects full name + home country, forgot/reset flow. Apple sign-in is
  built but hidden (owner's Apple Developer account inactive) — restore from git
  in `provider-buttons.tsx`.
- **Admin:** a full-CRUD content editor at `/admin` over all 8 content tables,
  schema-driven from `src/lib/admin/schema.ts`, writes via Server Actions.
  Access is gated by the DB, not the UI: admin membership lives in a dedicated
  `public.admins` table (NOT a role on `profiles`, which is self-updatable).
  Grant via `/admin/admins` (add by email) or SQL insert into `public.admins`.
  `public.is_admin()` drives write RLS on every content table. Owner
  patelmeet.2905@gmail.com is the first admin. **Committed** (all 14 admin files
  are tracked in git as of 2026-07-22 — the earlier "uncommitted" warning is
  resolved).
- **SEO/traffic:** JSON-LD (Organization/WebSite/HowTo/Breadcrumb/FAQ), Vercel
  Analytics (cookieless), per-step `seo_title`/`seo_description`, canonicals.
  `/updates` = human-approved "what changed in Germany" items + RSS. Goal is
  **traffic first, monetization deferred** — do not push monetization yet.
- **AI features (Groq):** letter decoder on `/letters`, step Q&A, sitewide chat
  widget with a trust ladder (site → web → honest fallback). `GROQ_API_KEY` is
  set in Vercel. Web-search rung needs a `TAVILY_API_KEY` (still pending).

## Planned direction — compact/full split + real city hubs (blueprint, 2026-07-22)

> Agreed in a brainstorm on 2026-07-22. It refines roadmap step ① (the two
> funnels) into a concrete model. Nothing here overrides the scope guard or the
> hard rules.
>
> **Progress (2026-07-22):** BUILT — committed locally (`2e4c4d9` data layer,
> `c0c28ad` UI + content), **not yet pushed/deployed**. tsc + eslint + `next
> build` all clean; compact page + city hub verified rendering (dark mode, no
> console errors). What's done:
> - **Data:** `steps.quick_action` column + `city_facts` table (public-read /
>   `is_admin()` write RLS, trigger), both in `/admin` + `supabase/types.ts`.
> - **UI:** compact `CompactStepView` at `/cities/[city]/[slug]` (fills
>   `quick_action` from city+persona, what-to-bring, chips, "Read the full guide"
>   → `/guide/[slug]`, graceful fallback when no override); `CityFactsSections`
>   on `/cities/[city]`; `DeadlineClock` banner on `/journey`; Journey Map locked
>   states + blocking reasons from `depends_on`.
> - **Munich content:** 29 `quick_action` templates; `public-transport` +
>   `find-housing-remotely` flipped to `city_variable` with cited Munich overrides
>   (MVG €43 student ticket; Studierendenwerk dorms); 6 `city_facts` across all
>   five categories, every figure sourced + `last_verified` 2026-07-22.
>
> **STILL TODO:** ① push/deploy (owner's call). ② persona-split cost isn't in the
> data model yet, so the compact card is persona-neutral — the "€43 because
> you're a student" split needs per-persona city_step figures later. ③ clone
> Munich's depth to the other 35 cities. ④ small content polish: the `first_days`
> fact renders its "1." oddly (inline ordered list) — cosmetic. ⑤ a couple of
> Munich facts want the owner's local confirmation (see below).
>
> **Needs owner's local confirmation (Munich):** private-market rent figures are
> from aggregators (wg-gesucht / Investropa), not an official index — fine as a
> cited *range* but worth a local sanity-check; TK is only ONE insurer's office
> (add AOK/others if you want more); banking names (N26/DKB/Sparkasse) are
> editorial, not endorsements.

**The core idea: one source of content, shown two ways — and *city selection is
the switch* between them.**

- **No city selected (Explorer)** → show the **full / Explore** version: the
  universal story, all cases, all cities. You can't personalise without a city.
- **City selected (Committed)** → show the **compact "Build my plan"** version,
  for *that city + that persona only*: action-only, e.g. "Buy from VGI · bring
  student ID + enrolment cert · €43/mo student rate · [3 steps]." Committing to a
  city (which people do right after they get admitted) flips the whole experience
  automatically — it is NOT a toggle the user clicks. This maps exactly onto the
  existing Explorer vs Committed split.

**No duplicated content.** The facts are written once; the two views are two
*lenses* on the same rows:

| Field / table | Feeds | Notes |
|---|---|---|
| `steps.quick_action` *(NEW column)* | Build my plan (compact) | Hand-written **template per step** (~11 total), with blanks like `{operator}` `{price}` `{persona}` that auto-fill from data — so one template serves all 36 cities. Do NOT hand-write per city×persona (that's ~1,188 cards). |
| `steps.content_md` | Explore (full) | The whole guide, already exists. |
| `steps.documents` | both | "What to bring." Surface as a counter-day doc pack. |
| `steps.depends_on` | Journey Map | Already rendered per-step ("Finish first" / "Unlocks"); the Map turns it into a whole-journey view. |
| `steps.deadline_rule` / `due_offset_days` | Deadline clock | Move date → real dates → one calm countdown banner. |
| `city_steps` | fills the compact blanks | VGI, €43, appointment-only, etc. **Today only 3 per city** — the big lift is expanding this to every relevant step, city by city. |
| `city_facts` *(NEW table)* | Explore / city hub | Local info that is NOT a task: `city + category + content + source + last_verified`. Categories: `first_days`, `housing` (dorm link + how-to, or WG plan, + avg rent range), `insurance` (nearest offices), `banking` (student-friendly), `while_waiting`. Compact view borrows only the one relevant line. |

**Two pages, linked (not one expandable page):** the compact step page links out to
the full guide. Mapped to existing routes — minimal new routing, mostly repurpose +
content:

| View | Route | Action |
|---|---|---|
| Explore step (full, universal) | `/guide/[slug]` | exists |
| Compact step (city + persona) | `/cities/[city]/[slug]` | **repurpose as the compact Build-my-plan card**; add "Read the full guide →" link to `/guide/[slug]` |
| City hub | `/cities/[city]` | **expand** with the `city_facts` sections above |
| Plan wizard | `/plan` | **gate**: capture city → route into compact |
| Journey Map | `/journey` | **rebuild later** as the whole-journey map (done ▪ next ▪ locked, with "needs Anmeldung" reasons) |

**Fallback rule:** if a step has no `city_steps` override for the selected city,
the compact view falls back to the universal `quick_action` (blanks that can't fill
are omitted) plus whatever `city_facts` exist — never a broken card.

**Suggested build order:** ① add `steps.quick_action` + write the ~11 templates →
② create `city_facts` table (public-read RLS, admin CRUD, regen types) → ③ fill
**Munich** first: expand its `city_steps` to every relevant step + populate all
`city_facts` categories (every figure cited + `last_verified`) → ④ compact step
page + "full guide" link → ⑤ Deadline clock banner → ⑥ Journey Map hero. Munich
becomes the template the other 35 cities clone.

**Still bound by the hard rules:** every city fact carries `source` +
`last_verified`; never fabricate rent/figures (avg rent = a cited *range* only);
content stays in Supabase (both `quick_action` and `city_facts`); no emojis on the
site; keep disclaimers + official links.

## Working model (how the owner wants to work)

- **Meet does nothing manually** — no Supabase Studio edits. Claude does all the
  work, including researching city data from official sources (everything cited +
  `last_verified`). Meet only answers short "needs your local confirmation" lists
  for facts not verifiable online, and reports bugs.
- One chat per task/milestone, in this project folder.
- Roadmap order: ① polish the "Build my plan" + "Explore the process" funnels →
  ② Munich to 100% depth → ③ Ingolstadt → ④ Nuremberg → ⑤ more cities one at a
  time. "100% city" = every relevant step has a verified override + a rich city
  hub — still bureaucracy/settling only, never tourism (scope guard).

## Pending — things the OWNER must do (Claude cannot)

Dashboard/account actions outside the code:

- **Custom SMTP** (Auth → Emails): the Supabase default sender is capped (~2/hr),
  rejects `@example.com`, and will fail under real traffic. Set up Resend/Postmark.
- **Auth URL config + email templates:** Site URL `https://germanyguide.net`,
  redirect `https://germanyguide.net/**`; Recovery/Confirm templates must link to
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
  (and `type=email&next=/journey` for signup confirm).
- **Enable** leaked-password protection + min length 8 (advisor flagged).
- **Google OAuth consent screen:** set App name "Germany Guide" + logo in Google
  Cloud (free) so it doesn't show the supabase.co domain.
- **`TAVILY_API_KEY`** in Vercel Production to activate the AI web-search rung
  (Vercel gotchas: exact name, tick Production, save BEFORE redeploy).
- **Search Console:** click Verify, submit `sitemap.xml`. Traffic data lags
  days/weeks — don't act on empty data. Biggest remaining lever = backlinks from
  expat/university/city-subreddit pages (outreach, not code).
- **Legal:** confirm real name/address in `/impressum` and contact email in
  `/privacy` before serious traffic.
- **City photos:** most of the 36 cities render the branded placeholder
  (`image: null`). Owner will send licensed photo links; each must be recorded in
  `public/images/CREDITS.md` per the image-licensing rule.

## Known open bugs / gaps (from the 2026-07-20 walkthrough)

**Fixed 2026-07-22 (QA round 2, shipped to main):** ① iOS Safari zoom on the
Glossary/Cities search (all form inputs now >=16px on <=640px via a rule in
`globals.css`) · ② chat widget now re-sends a request that failed offline —
automatically on the `online` event, plus a manual "Retry now" button
(`chat-widget.tsx`) · ③ laptop header no longer crushes/wraps "Sign in" +
"Build my plan" — full nav moved to the `xl` breakpoint (clean hamburger below),
tighter nav spacing, `whitespace-nowrap` on the buttons · ④ removed global
`scroll-behavior: smooth` (it fought App Router scroll restoration, leaving a
footer-navigated page parked under the sticky header) and added
`scroll-padding-top` for anchor jumps · ⑤ footer now highlights the current
page. Still open below:

- **Signup error UX:** `friendlyAuthError` (`src/components/auth/sign-in-form.tsx`)
  returns the raw message for unmatched errors, so a server 500 renders literally
  as `{}`. Needs a generic fallback.
- **Both AI features may read as "not switched on"** in some envs even though the
  key is set — verify before demoing.
- **Persona mismatch:** homepage advertises Refugee / EU citizen / Joining family,
  but the `/plan` wizard only offers Student / Skilled worker / Not sure yet.
- **A11y:** several selectable cards (plan options, "Read the guide", problem
  cards, city/letter chips) are buttons/links with empty accessible names.

## Verified 2026 figures (baked into content — re-verify every January)

Blocked account €11,904/yr (€992/mo) · Deutschlandticket €63/mo · min wage
€13.90/h (→€14.60 in 2027), Minijob €603/mo · EU Blue Card €50,700 standard /
€45,934.20 shortage & new grads · Rundfunkbeitrag €18.36 · student health
~€140–150/mo · uni-assist €75 first + €30 each · ZAB Zeugnisbewertung €208 ·
D visa €75 · residence permit ~€100 · first eAT €100 / renewal €93 ·
Fiktionsbescheinigung €13 · student work 140 full / 280 half days, Werkstudent
20h/wk. **Most reset every January** — searching content for "2026" finds the spots.
