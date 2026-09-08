# Rules — how to work on Germany Guide

> **Read this before writing anything.** These are not preferences; they are
> constraints. If a task seems to require breaking one, stop and ask.
> Status lives in [`status.md`](status.md), open work in [`todo.md`](todo.md), and
> problems we have already solved in [`solutions.md`](solutions.md) — check that
> first when something breaks.

## 0. The goal and the scope guard (never drift)

**The goal:** walk international students and workers through the entire journey
to Germany — from the first thought to fully settled — with steps that adapt to
their **exact city**, because the same federal paperwork works differently at
every city's counter.

**This site is NOT** a city-comparison tool, a forum, a visa consultancy, a
housing/job marketplace, or a culture/tourism blog. All of these were explicitly
rejected. **Do not re-litigate them.** City content covers bureaucracy and
settling in — never tourism.

## 1. Content: never fabricate, always cite

- **Never invent a city fact, figure, address, office name, fee or deadline.**
  Research it first-hand from the **official** source (the city, the Land, the
  Studierendenwerk, the authority itself).
- Every city-specific claim carries a **`last_verified` date** and, for
  `city_facts`, a **`source`**.
- City content must state the **method**: `walk_in` / `appointment` / `email` /
  `online` / `post`.
- **Dorm figures come from the Studierendenwerk's own price list**, never a rent
  aggregator. An aggregator once put Ingolstadt ~€45/month too low.
- Private-market rents are a **cited range**, never a quote. If the only figure
  you can find is older, **say the year in the text** ("ran about €402/month in
  2024") rather than passing it off as current.
- Prefer a **regional fact you can verify** (e.g. "the regional AOK here is
  AOK Bayern") over a specific address you cannot.
- Keep the disclaimers: general information, **not legal advice**; link the
  official source.
- **How it is written is a rule too, not a preference.** Every reader-facing
  string follows [`writing.md`](writing.md): plain English on the GOV.UK model,
  **no em dashes**, bold rationed to two spans per 150 words, no scaffolding
  labels (`**The flow:**`), no idiom or editorial adverbs. Content that reads as
  machine-written costs us the trust that `last_verified` was supposed to buy.

## 2. Where content lives, and which fields actually render

**All content lives in Supabase**, never hardcoded — the only exception is the
small city/persona card config in `src/lib/site-config.ts`. Content tables are
public-read; user tables are per-user RLS. Project ref `ilfhjffpzvzphbvhdpup`.
After a schema change: regenerate `src/lib/supabase/types.ts` **and** run the
security advisors.

Model: `phases` → `steps` → `city_steps` (per-city overrides) + `city_facts`
(local info that is not a task). Plus `glossary_terms`, `problems`, `letters`,
`updates`, and per-user `profiles` / `user_progress`.

**Per-city surfaces that reach visitors** (verified 2026-09-04):

| Field | Renders where |
|---|---|
| `city_steps.method` / `method_note` | the method chip |
| `city_steps.address`, `tips`, `links` | compact card |
| `city_steps.content_md` | **"How it works in <City>"** on `/cities/[city]/[slug]` |
| `steps.quick_action` | the filled one-line action (all cities, one template) |
| `city_facts` | city hub + the matching compact step |

- `quick_action` is **one hand-written template per step** with `{tokens}` that
  auto-fill from city + step data. **Never** hand-write per city × persona.
- An unfillable `{token}` is dropped along with its leading connector, so write
  connectors the renderer understands (` - `, ` . `, ` , `).
- **Fallback rule:** a step with no `city_steps` override must still render —
  the universal `quick_action` plus whatever `city_facts` exist. Never a broken card.
- `city_facts` categories: `first_days`, `housing`, `insurance`, `banking`,
  `while_waiting` (six facts per city is the established shape).

## 3. Design and code

- **No emojis anywhere on the site.** Expression comes from lucide icons,
  typography, photography and motion.
- **No em dashes in UI copy either** — titles, buttons, empty states, error
  messages and meta descriptions all follow [`writing.md`](writing.md).
- **Unmistakably German at first glance:** flag palette
  (cream/black/crimson/gold), the tricolor top stripe, real German city
  photography, and German terms (Anmeldung, Ausländerbehörde…) as first-class
  vocabulary.
- Design tokens and theme live in `src/app/globals.css` (light **and** dark).
  Fonts: DM Sans (body) + Cabinet Grotesk (display, self-hosted in `src/fonts`).
- Motion: **Framer Motion only**, animate `transform`/`opacity`, always respect
  `prefers-reduced-motion` (MotionConfig is global). Enter-only animations for
  step/wizard transitions — no exit-blocking `AnimatePresence mode="wait"` on
  interactive flows.
- **This is not the Next.js you know** — see [`../AGENTS.md`](../AGENTS.md) and
  read the guide in `node_modules/next/dist/docs/` before writing code.
  Middleware is **`src/proxy.ts`**, not `middleware.ts`.
- **Every image must be verifiably licensed.** Never add a photo of unknown
  provenance. The one canonical credits file is
  [`../public/images/CREDITS.md`](../public/images/CREDITS.md), updated in the
  **same commit** as any image change. Do not start a second credits table.

## 4. Database work — hard-won gotchas

*Fuller write-ups, with symptoms and repair SQL, are in [`solutions.md`](solutions.md).*

- **Check before you insert.** Query the live DB first; do not trust these docs
  for counts:
  `select c.slug, count(cs.id) from cities c left join city_steps cs on cs.city_id=c.id group by c.slug`
- Row counts from `list_tables` are **stale planner estimates** (it reported 3
  cities when there were 36). Always use a real `count(*)`.
- Key inserts by slug (`SELECT … FROM cities c, steps s WHERE c.slug=…`) so a
  missing row fails cleanly instead of corrupting data.
- **Apostrophe trap:** inside dollar-quoting (`$md$…$md$`) a doubled `''` is
  **literal**, not an escape — it renders as "Berlin''s". Use a single `'`.
  Repair with
  `regexp_replace(content_md, '''''([A-Za-z])', '''\1', 'g')`,
  which spares real plural possessives ("three months'' cold rent").
- Markdown is rendered with GFM. A numbered list written inline
  (`1. … 2. …`) collapses into **one** list item — put each step on its own line.

## 5. Verification — required before saying "done"

```
npx tsc --noEmit && npx eslint . && npm run build
```

All three must pass. If the change touched any reader-facing string, also run
the style detectors in [`writing.md`](writing.md) §8 — the build cannot see an
em dash. For UX changes, walk **both** visitor types — an Explorer
(no city, "just exploring") and a Committed visitor ("moving soon" + a city) —
through plan → journey → step, in **light and dark** mode. Verify in the browser
rather than asking the owner to check.

## 6. Deploying

- Vercel deploys from `main` via the GitHub app; feature branches make preview
  deploys only.
- **Content-only changes still need a push** to rebuild the ISR-cached pages
  (`revalidate = 3600`); otherwise they trickle in over an hour. An
  `--allow-empty` commit is the accepted way to fire the webhook.
- Commits can reach GitHub **without** triggering a build. Afterwards, confirm
  the tip commit actually deployed (`list_deployments`, or the dashboard) —
  "committed" does not mean "live". germanyguide.net is the production alias on
  the latest READY `target: production` deploy.

## 7. Working model

- **The owner does nothing manually** — no Supabase Studio edits. Claude does the
  work, including researching city data from official sources. The owner only
  answers short "needs your local confirmation" lists and reports bugs.
- One chat per task/milestone, in this project folder.
- Traffic first; **monetization is deferred** — do not add it.
- **Keep [`status.md`](status.md) and [`todo.md`](todo.md) current at the end of
  every session.** They are the only things a fresh Claude will trust.
- **Log anything that cost you time in [`solutions.md`](solutions.md)** — that file
  exists to stop the next session re-diagnosing a problem we already fixed.
