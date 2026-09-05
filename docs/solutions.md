# Solutions — problems we already solved

> **Check here first when something breaks or behaves oddly.** Every entry is a
> real problem hit while building this site, with the actual cause and the fix.
> The point is to not re-diagnose the same thing twice.
>
> **Add an entry whenever you lose more than a few minutes to something.** Format:
> what you saw → why → the fix → how to spot it next time. Write the symptom the
> way you would search for it, not the way you understood it afterwards.

---

## Server Action 500s at runtime: "a 'use server' file can only export async functions"
**2026-09-05**

- **Symptom:** the page renders, but submitting the form throws a 500 and the
  error boundary shows "Something went wrong". The server log reads
  `Error: A "use server" file can only export async functions, found object`,
  pointing at the closing brace of the actions file.
- **Cause:** the `"use server"` module also exported a plain object — the
  `initialSubscribeState` constant that `useActionState` needs as its starting
  value. Only async functions may be exported from such a file; every other
  export becomes a client-callable endpoint, which an object cannot be.
- **The trap:** `npm run build` passes. The module is only evaluated when the
  route actually runs, so the whole verification gate
  (`tsc && eslint && build`) is green and the bug still reaches the browser.
- **Fix:** keep Server Actions alone in the `"use server"` file and move state
  shapes and their `initial…State` constants to an ordinary module —
  `src/lib/newsletter-state.ts` here. Types are fine to export either way
  (they are erased); values are not.
- **Next time:** after adding any Server Action, actually submit the form in the
  browser. Passing the build proves nothing about a `"use server"` boundary.

## `tsc` fails with "Duplicate identifier" in `.next/types` after touching nothing
**2026-09-05**

- **Symptom:** `npx tsc --noEmit` fails on files that were never edited:
  `.next/types/cache-life.d 2.ts(3,1): error TS6200 … conflict with those in
  another file` and `routes.d 2.ts … Duplicate identifier 'LayoutProps'`.
- **Cause:** the project lives under `~/Documents`, which **iCloud Drive syncs**.
  When two machines (or a sync race) touch the same generated file, iCloud keeps
  both and renames one `<name> 2.ts`. Those copies land inside `.next/types/`,
  where `tsc` picks them up as real sources and sees every type declared twice.
  Nothing is wrong with the code.
- **Fix:** delete the duplicates — `.next/` is gitignored and fully regenerable:
  ```bash
  find .next -name "* 2.*" -delete
  ```
- **Next time:** the giveaway is a space-then-digit in the filename of a file you
  never wrote. Check the whole repo, not just `.next`:
  `find . -name "* 2.*" -not -path "./node_modules/*" -not -path "./.git/*"`.
  A duplicate landing in `src/` would be worse — it would compile.

## Content written but invisible on the site
**2026-09-04**

- **Symptom:** 40 cities' worth of per-city text existed in `city_steps.content_md`
  and displayed nowhere. Pages looked "thin" no matter how much was written.
- **Cause:** `StepView` was the only component rendering it, and it is used solely
  by `/guide/[slug]` — which passes `activeCitySlug={null}`, so the city branch
  never ran. The route visitors actually land on, `/cities/[city]/[slug]`, uses
  `CompactStepView`, which rendered `city_facts` but never `content_md`.
- **Fix:** added a "How it works in \<City>" section to `CompactStepView`.
- **Next time:** before writing or expanding content, confirm **which component the
  route actually renders** and that the field appears in it. Fastest check —
  grep the served HTML for a distinctive phrase:
  `curl -s localhost:3000/cities/munich/anmeldung | grep -c "some phrase"`.
  Zero hits means nobody can see it.

## Apostrophes render doubled — "Berlin''s"
**2026-09-04**

- **Symptom:** text on the site reads `Berlin''s`, `you''re`, `don''t`.
- **Cause:** inside PostgreSQL dollar-quoting (`$md$…$md$`) a doubled `''` is
  **literal** — it is only an escape inside ordinary `'…'` strings. Writing SQL-style
  escapes inside a `$md$` block puts them straight into the content.
- **Fix:** use a single `'` inside `$md$`. Repair existing rows with:
  ```sql
  UPDATE city_facts
  SET content_md = regexp_replace(content_md, '''''([A-Za-z])', '''\1', 'g')
  WHERE content_md ~ '''''[A-Za-z]';
  ```
  Requiring a following letter spares real plural possessives ("three months'' cold rent").
- **Next time:** after any bulk insert, run the detector:
  `select count(*) from <table> where content_md ~ '''''[A-Za-z]';` — expect 0.

## A numbered list renders as one run-on paragraph
**2026-09-04**

- **Symptom:** "1. Get a SIM. 2. Start the ticket. 3. Register" renders as a single
  bullet containing all the text, numbers and all.
- **Cause:** GFM only starts a new list item at a **line break**. An inline
  `1. … 2. …` is one item whose text happens to contain digits.
- **Fix:** one step per line. To repair rows in place:
  ```sql
  UPDATE city_facts
  SET content_md = regexp_replace(content_md, '\s+([2-9])\. ', E'\n\\1. ', 'g')
  WHERE category = 'first_days' AND content_md ~ '\s[2-9]\. ';
  ```
- **Next time:** check the rendered `<ol>` has more than one child, not just that
  the text looks right in the database.

## Run-on text in the plan card — "…expires)Landesamt für Einwanderung"
**2026-09-04**

- **Symptom:** every city's compact plan card ran the address straight onto the
  previous sentence with no space.
- **Cause:** the `steps.quick_action` templates ended `…){address}.` with no
  separator between the closing bracket and the token.
- **Fix:** use a separator the renderer understands — ` - {address}`.
  `renderQuickAction` drops an unfillable token **together with its leading
  connector** (` - `, ` . `, ` , `), so cities without an address still read
  cleanly. Do not use an em dash: only ASCII `-.,;:` are treated as droppable.
- **Next time:** when editing a `quick_action` template, view a city **with** the
  token filled and one **without** it.

## Almost created duplicate city rows
**2026-09-04**

- **Symptom:** a sweep suggested only 3 cities had `city_steps`, so 12 inserts were
  staged. In reality 36 cities already had them — the inserts would have doubled
  rows and duplicated the city tabs.
- **Cause:** row counts from `list_tables` are **stale planner estimates**
  (`reltuples`), not live counts. It reported 3 cities when there were 36.
- **Fix / prevention:** always confirm with a real grouped count before writing:
  ```sql
  select c.slug, count(cs.id) from cities c
  left join city_steps cs on cs.city_id = c.id group by c.slug order by 2;
  ```
  Key inserts by slug (`SELECT … FROM cities c, steps s WHERE c.slug=…`) so a
  missing row inserts nothing instead of corrupting data.

## Only the last statement's result comes back
**2026-09-04**

- **Symptom:** sent several statements to `execute_sql` and only saw one result set,
  making it look like the earlier queries returned nothing.
- **Cause:** the tool returns the final statement's result only.
- **Fix:** run diagnostic `SELECT`s on their own; keep bulk `INSERT`/`UPDATE`
  batches separate from the verification query.

## Content updated in the database but the site still shows the old text
**Recurring**

- **Cause:** pages are ISR-cached (`export const revalidate = 3600`), so a content
  change trickles in over an hour.
- **Fix:** push a commit to rebuild — `git commit --allow-empty` is the accepted way
  when there is no code change.
- **Watch out:** commits can reach GitHub **without** triggering a Vercel build, and
  new *city* pages resolve immediately (`dynamicParams`) while the `/cities`
  **index** stays cached — so a new city can be reachable while the list still shows
  the old count. Confirm the tip commit actually deployed (`list_deployments`)
  rather than assuming "committed" means "live".

## Dorm rent figure was ~€45/month too low
**2026-08-08**

- **Cause:** the number came from a rent aggregator rather than the provider.
- **Fix / rule:** take dorm figures from the **Studierendenwerk's own price list**.
  Aggregators are acceptable only for private-market *ranges*, cited as such.
- **Related trap:** the Studierendenwerk is not always the local-sounding one —
  Ingolstadt *and* Nuremberg are both served by **Studierendenwerk
  Erlangen-Nürnberg**, not Munich's. Check the provider per city.

## Existing city content had gone stale and was wrong
**2026-09-04**

- **Symptom:** Munich's Anmeldung was documented as walk-in; the city had moved to
  **appointment-only**. Nuremberg's permit address was wrong (Lorenzer Straße
  instead of Äußere Laufer Gasse) and its method had changed from email to online.
- **Cause:** verified-once content was treated as permanently true.
- **Next time:** re-check `method`, office name and address against the official page
  whenever you touch a city, and move `last_verified` only when you actually
  re-verified. A `last_verified` date is a claim about your own work.

## A source blocks fetching (HTTP 402/403)
**2026-09-04**

- **Symptom:** `WebFetch` on studis-online returned 402; study.eu returned 403.
- **Fix:** do not block on one source — take the figure from a search-result summary
  that names the study (empirica / Moses Mendelssohn Institut), or find the same
  number on another page. If only an older figure exists, **state the year in the
  text** rather than presenting it as current.

## The write path disappeared mid-session
**2026-09-04**

- **Symptom:** the Supabase MCP server disconnected partway through a content run;
  content lives only in the database and there is no `supabase/` migrations
  directory to fall back on.
- **Fix:** write the pending SQL to a file, then apply it once the connection is
  restored (`/mcp` in an interactive session, or restart).
- **Next time:** for long content runs, keep the SQL in re-runnable batches keyed by
  slug so a half-finished run can be resumed safely.

## Older UI fixes worth remembering
**2026-07-22**

- **iOS Safari zoomed in on search inputs and never zoomed back out** — any input
  under 16px triggers it. All form inputs are now forced to ≥16px at ≤640px in
  `globals.css`.
- **Footer links landed the page under the sticky header** — a global
  `scroll-behavior: smooth` fought App Router scroll restoration. Removed it and
  added `scroll-padding-top` for anchor jumps.
- **Laptop header crushed "Sign in" / "Build my plan"** — the full nav now switches
  in at the `xl` breakpoint with a hamburger below, plus `whitespace-nowrap`.
- **Chat widget silently lost a message sent while offline** — it now retries on the
  browser `online` event and offers a manual "Retry now".
