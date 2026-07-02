# Germany Guide

A web app that helps international newcomers in Germany (students, skilled
workers, refugees, EU/non-EU) navigate bureaucracy that varies by city:
pick your city and get local guides, interactive checklists, a
problem/solution directory and a German-letter explainer.

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind 4, shadcn/ui) +
Supabase (Postgres, Auth, RLS). All content pages are statically generated
with ISR for SEO. Deploy target: Vercel.

## How it's structured

| Piece | Where |
|---|---|
| Schema (guides + per-city variants + step overrides) | [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) |
| RLS (public read of *published* rows only) | [supabase/migrations/0002_rls.sql](supabase/migrations/0002_rls.sql) |
| Postgres full-text search function | [supabase/migrations/0003_search.sql](supabase/migrations/0003_search.sql) |
| Seed data (states, 15 cities, 13 tasks, glossary, Anmeldung slice) | [supabase/seed.sql](supabase/seed.sql) |
| Core merge algorithm (generic guide ⊕ city overrides) | [lib/queries/guide.ts](lib/queries/guide.ts) |
| Flagship SEO page | [app/germany/[city]/[task]/page.tsx](app/germany/%5Bcity%5D/%5Btask%5D/page.tsx) |
| Checklist with localStorage + signed-in sync | [components/Checklist.tsx](components/Checklist.tsx) |
| AI content pipeline (drafts only, human publishes) | [scripts/](scripts/), [content-prompts/](content-prompts/) |
| Admin review & publish | app/admin/review (gated by `ADMIN_EMAILS`) |

## Setup

1. `npm install`
2. `.env.local` (already present) needs:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set
   - `SUPABASE_SECRET_KEY` — **fill in** from Supabase dashboard → Project
     Settings → API keys (needed for `/admin` and generation scripts)
   - `ANTHROPIC_API_KEY` — **fill in** to run generation scripts
   - `ADMIN_EMAILS` — comma-separated emails allowed into `/admin/review`
3. Migrations + seed are already applied to the Supabase project
   `germany-newcomer-guide`. For a fresh project: run the three files in
   `supabase/migrations/` then `supabase/seed.sql` in the SQL editor.
4. For Google sign-in: enable the Google provider in Supabase dashboard →
   Authentication → Providers (email magic links work out of the box).

## Content workflow

1. Draft with AI from official sources (never published automatically):
   ```bash
   npx tsx scripts/generate-guide.ts --task health-insurance \
     --source https://www.krankenkassen.de/... --source https://...
   npx tsx scripts/generate-variant.ts --task anmeldung --city hamburg \
     --source https://www.hamburg.de/anmeldung...
   npx tsx scripts/generate-problems.ts   # taxonomy of ~17 briefs built in
   npx tsx scripts/generate-letters.ts    # 6 letter briefs built in
   ```
   Output is validated with zod ([lib/content-schemas.ts](lib/content-schemas.ts));
   invalid model output is rejected. Drafts carry `generated_by` + a
   `confidence_note` for the reviewer.
2. Review at `/admin/review` (sign in with an `ADMIN_EMAILS` address); edit in
   Supabase Studio if needed; **Publish** stamps `last_verified_at` +
   `reviewed_by` and revalidates the static pages.
3. Monthly: `npx tsx scripts/check-freshness.ts` flags content older than 120
   days and dead source links.

## Verify end-to-end

```bash
npm run dev
```

1. Home → pick **Berlin** → open **City registration (Anmeldung)**:
   red "Appointment required" badge, booking link to service.berlin.de,
   step 3 replaced with Berlin's book-online step.
2. Switch to **Munich**: green "Walk-in possible" badge and an extra
   city-specific queue-ticket step — same generic guide underneath.
3. Any other city (e.g. Hamburg): "city details not yet verified" banner +
   generic guide.
4. Tick checklist steps → reload → still ticked (localStorage). Sign in →
   ticked steps sync to `user_task_progress` (see `/account`).
5. `/problems` (3 seeded), `/letters` (2 seeded), `/glossary` (22 terms),
   `/search?q=GEZ`.
6. `npm run build` prebuilds ~264 pages; view-source of a task page shows the
   full text (SEO).

Every guide page shows a not-legal-advice disclaimer, the last-verified date
and links to official sources — that's the trust model: the app explains,
the official source decides.
