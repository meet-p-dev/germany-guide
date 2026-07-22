# Project state — read me first

> **Purpose.** This is the portable "brain" for Germany Guide: what the site is,
> where it stands right now, what to use, what NOT to touch, and what's still
> pending. It is **git-tracked and inside the repo on purpose** — so any Claude,
> on any account or surface (desktop app *or* terminal CLI), picks it up. Rules
> live in [`CLAUDE.md`](../CLAUDE.md) and [`AGENTS.md`](../AGENTS.md); this file
> is the *living status* layer. **Keep it current — update it at the end of any
> work session** (it is the one place a fresh Claude will trust).
>
> Last updated: 2026-07-22 (QA round 2: 5 mobile/nav/chat/scroll/footer fixes).

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
  patelmeet.2905@gmail.com is the first admin.
  ⚠️ **As of 2026-07-22 the admin code is present in the working tree but
  UNCOMMITTED** (`src/app/admin/`, `src/components/admin/`, `src/lib/admin/`,
  `admin-nav-link.tsx` show as untracked in `git status`). Commit it so the work
  is safe before relying on it.
- **SEO/traffic:** JSON-LD (Organization/WebSite/HowTo/Breadcrumb/FAQ), Vercel
  Analytics (cookieless), per-step `seo_title`/`seo_description`, canonicals.
  `/updates` = human-approved "what changed in Germany" items + RSS. Goal is
  **traffic first, monetization deferred** — do not push monetization yet.
- **AI features (Groq):** letter decoder on `/letters`, step Q&A, sitewide chat
  widget with a trust ladder (site → web → honest fallback). `GROQ_API_KEY` is
  set in Vercel. Web-search rung needs a `TAVILY_API_KEY` (still pending).

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
