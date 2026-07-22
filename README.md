# Germany Guide

**germanyguide.net** — walks international students and workers through the
entire journey to Germany, from the first thought to fully settled, with steps
that adapt to their exact city. The same federal paperwork works differently at
every city's counter (walk-in in Munich, appointment in Ingolstadt, email-first
in Nuremberg) — Germany Guide is built around exactly that difference.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Tailwind CSS v4) on Vercel
- **Supabase** (Postgres + RLS, Auth via email + password and Google/Apple
  OAuth) — all guide content lives in the database and is editable without a
  redeploy, either in Supabase Studio or through the in-app `/admin` editor
- **Framer Motion** for the animation system (scroll reveals, journey timeline,
  checklist micro-interactions), fully `prefers-reduced-motion`-aware

## Architecture

| Path | Purpose |
| --- | --- |
| `src/app` | Routes: front page, `/process`, `/plan` (onboarding), `/journey` (checklist), `/guide/[slug]`, `/cities/[city]/[slug]`, `/problems`, `/letters`, `/glossary`, `/costs`, `/why-germany`, `/updates`, `/admin` (content editor), `/account`, auth (`/signin`, `/reset-password`, `/auth`), legal (`/impressum`, `/privacy`) |
| `src/lib/content.ts` | Typed content data layer (cached Supabase reads) |
| `src/lib/profile-store.tsx` | Visitor profile + progress: localStorage-first, syncs to the account when signed in |
| `src/lib/supabase/` | Generated DB types + browser/server/content clients |
| `src/components` | Design system, motion primitives, feature components |
| `src/proxy.ts` | Session refresh (Next 16 proxy, formerly middleware) |

Content model: `phases` → `steps` (the atomic unit, persona-filterable) →
`city_steps` (per-city overrides with method, contacts, tips and a
`last_verified` date). Plus `glossary_terms`, `problems`, `letters` and
per-user `profiles` / `user_progress`.

## Development

```bash
npm install
npm run dev        # needs .env.local with the Supabase URL + publishable key
npx tsc --noEmit   # typecheck
npx eslint .       # lint
npm run build      # full static build (fetches content from Supabase)
```

Content edits happen in Supabase Studio; pages revalidate hourly. Editing a
`city_steps` row updates the live site without a deploy.
