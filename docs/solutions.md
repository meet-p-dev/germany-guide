# Solutions — problems we already solved

> **Check here first when something breaks or behaves oddly.** Every entry is a
> real problem hit while building this site, with the actual cause and the fix.
> The point is to not re-diagnose the same thing twice.
>
> **Add an entry whenever you lose more than a few minutes to something.** Format:
> what you saw → why → the fix → how to spot it next time. Write the symptom the
> way you would search for it, not the way you understood it afterwards.

---

## A university-fee aggregator invented a tuition fee that does not exist
**2026-09-08**

- **Symptom:** while researching non-EU tuition, a search summary sourced from
  aggregator sites (mygermanuniversity and similar) reported that **THWS
  Würzburg-Schweinfurt charges non-EU students €1,500 per semester for the
  first seven semesters**. THWS's *own* international page says the opposite:
  no tuition at all except on continuing-education (Weiterbildung) Masters.
  The same aggregator gave Uni Augsburg "Master €0–1,333, LL.M. €0–19,750" and
  TH Augsburg "Bachelor €0–2,300" — ranges wide enough to be useless and
  unattributable to any statute.
- **Cause:** these sites scrape and merge programme-level fee fields across
  hundreds of universities, including private and continuing-education
  programmes, then present the spread as if it were the institution's tuition
  policy. Nothing is wrong with any single number; the *aggregation* is what
  makes it false.
- **Fix:** every figure now in the `study_costs` facts comes from the
  institution's or the ministry's own page. Where an official page did not
  state a policy (TH Augsburg), the fact says so explicitly instead of
  inferring "no fee" from silence.
- **Next time:** tuition is the same class of claim as a dorm rent (see the
  Studierendenwerk entry below) — **take it from the body that levies it**, never
  from a comparison site. Two specific traps here:
  1. **Bavaria has no Land-wide answer.** Under the BayHIG each Hochschule sets
     its own fee in its own Satzung, so "does Bavaria charge?" is not a
     question with an answer. TUM charges up to €6,000/semester while LMU, in
     the same city, charges nothing.
  2. **An official page can be out of date in the other direction.** A
     uni-wuerzburg.de page still said "there are currently no tuition fees for
     non-EU students in Bavaria" — true of that university, false of the Land.
     Scope every claim to the institution whose page you read.

## A provider dashboard said "Verified" for a DNS record that did not exist
**2026-09-08**

- **Symptom:** Resend's domain page showed all three records for
  `germanyguide.net` with green **Verified** badges, including
  `send` MX → `feedback-smtp.eu-west-1.amazonses.com`. `dig` found no MX at
  `send.germanyguide.net` at all — against both Cloudflare authoritative
  nameservers and 1.1.1.1 / 8.8.8.8. The Cloudflare zone confirmed it: the name
  had only the SPF TXT.
- **Cause:** the badge reflects the **last successful check**, not the current
  state. The domain was verified two months earlier; the record was removed or
  never persisted afterwards, and nothing re-checked. Sending kept working
  because Resend verifies on DKIM, so the gap was invisible — the cost was
  silent: bounce and complaint feedback had nowhere to route, which erodes
  sending reputation as dead addresses accumulate.
- **Fix:** added the MX in Cloudflare (`send`, priority 10) plus a monitor-only
  `_dmarc` TXT `v=DMARC1; p=none;`, then re-queried DNS to confirm.
- **Next time:** **trust DNS over a dashboard badge.** Verify mail records with
  `dig` against the authoritative nameservers before believing any provider UI,
  and re-check the records you did *not* touch afterwards — here that meant
  proving the root MX was still iCloud's, since an MX mistake on the root would
  have silently killed the `kontakt@`/`team@` mailboxes.
- **Related hazard, not hit but one click away:** Resend's "Enable Receiving"
  asks for an MX on the **root** pointing at `inbound-smtp.…amazonaws.com`.
  Turning it on would override the iCloud MX and break those mailboxes. It reads
  "not started" and must stay that way.

## Page titles were truncated on 60 of the 126 city-step pages
**2026-09-07**

- **Symptom:** nothing looked wrong on the page, but in search results the city
  name — the one word these pages rank for — was cut off:
  "Get your residence permit (Aufenthaltstitel) in Düssel…".
- **Cause:** `generateMetadata` built the title as `${step.title} in ${cityName}`
  and the root layout appends `· Germany Guide` (16 chars). `steps.title` is
  editorial copy written for someone already on the page, so
  `residence-permit` alone is 44 characters; every one of its 40 city pages
  rendered a 71-75 character title. The DB was fine; the composition was not.
- **Fix:** `src/lib/seo.ts`. A short search-first label per step slug
  ("Residence Permit", "Anmeldung"), and the method hook is appended only when
  the whole title still fits 60 **including the suffix**. Descriptions get the
  same budget treatment.
- **The trap worth remembering:** a title budget must be checked against the
  *rendered* string. `title.template` in the root layout means the page's own
  title is never what the user sees, so measuring `step.title` tells you
  nothing. Measure what `curl | grep '<title>'` returns.
- **Next time:** after any metadata change, sweep every URL rather than
  spot-checking one. The audit that caught this was a loop over all 126 pages
  comparing `len(title)` and `len(description)` — it found 60 bad titles that
  four hand-checked pages had not.

## A generated snippet re-published a claim the site had already corrected
**2026-09-07**

- **Symptom:** the first version of the new city-step meta description read
  "Anmeldung in Aachen starts online." for 13 cities.
- **Cause:** the description was built from `city_steps.method`, and those 13
  rows still carry the stale `method = 'online'` that `todo.md` has open. The
  page itself was fine — `method_note` was rewritten on 2026-09-06 to lead with
  the in-person route — but the *generated* snippet went back to the raw field
  and put the known-wrong claim into the search result, where it is more
  visible than the chip.
- **Fix:** `ONLINE_CLAIM_UNSAFE` in `src/lib/seo.ts`. For `anmeldung`, the
  "online" method is never rendered in a title, snippet or FAQ answer; the
  description falls back to the lead clause of `method_note` instead.
- **Next time:** when you derive display text from a column, check whether that
  column has a known-bad subset before shipping the derivation. A field that is
  "wrong but visibly caveated on the page" becomes plainly wrong the moment
  something re-renders it without the caveat. Grep `todo.md` for the column
  name before building on it.

## "Register online" was wrong for our whole audience in 14 cities
**2026-09-06**

- **Symptom:** Erlangen's Anmeldung card said `method = online` and the content
  led with "register online with a BayernID or BundID account (eID)". The owner
  checked in person and found registration is walk-in, with first-time
  registrants going to the counter.
- **Cause:** the federal **elektronische Wohnsitzanmeldung** accepts only a German
  *Personalausweis* with the online function, or an **eID-Karte, which is issued
  to EU/EEA citizens only**. There is no route via an *elektronischer
  Aufenthaltstitel*, and family registration additionally requires already being
  in the Melderegister and moving *within* Germany. So a third-country national
  arriving for the first time - this site's core reader - **cannot register
  online anywhere in Germany**. Source:
  https://wohnsitzanmeldung.gov.de/faq-servicekonto-und-ausweis
- **Scale:** 14 of 40 cities were marked `method = online` for `anmeldung`
  (aachen, bonn, darmstadt, dresden, erlangen, frankfurt, freiburg, heidelberg,
  kassel, magdeburg, mannheim, munster, potsdam, regensburg). Every one of their
  `method_note` values did mention an in-person alternative, but all led with
  "Online", and none said who qualifies.
- **Fix:** `method_note` rewritten for all 14 to lead with the in-person route and
  name the eID limitation; Erlangen's `method` changed to `walk_in`. Queued
  through the review gate as `run_id = 'ewa-eid-2026-09-06'`.
- **Next time:** `method` is a claim about **what this site's reader will
  actually do**, not about what the city technically offers. When a city offers an
  online route, check the *requirements* section before setting `method = online`
  - "the city has an online service" and "our reader can use it" are different
  facts. A link sweep cannot catch this; only reading the procedure can.

## Every jsonb proposal falsely reported "the live value has changed"
**2026-09-06**

- **Symptom:** the first real `/link-check` run queued nine `links` fixes and the
  review screen refused all nine, showing "The live value has changed since this
  was proposed - applying is blocked" with Approve greyed out. Nothing had
  changed; the rows were untouched.
- **Cause:** the drift guard compared the live column with the proposal's
  `current_value` snapshot as **text**. Postgres renders jsonb with a space after
  the colon - `[{"url": "x"}]` - while `JSON.stringify` renders `[{"url":"x"}]`.
  A proposal naturally records its snapshot through Postgres (`links::text`), so
  the two never matched and no `links` or `tips` proposal could ever be applied.
- **Fix:** `valuesMatch()` in `src/lib/admin/proposals.ts`. When the live value
  is an object, both sides are re-serialised through JSON before comparing, so
  the check is about content rather than whitespace. Key order is safe to rely
  on: both sides come from the same jsonb column, so Postgres has already
  imposed its ordering on each.
- **Next time:** any time a snapshot crosses the Postgres/JS boundary, compare
  *parsed* values, never their text. And note what caught this - not the type
  checker, not the build, but actually running the sweep and looking at the
  result. A guard that always says "blocked" looks exactly like a guard that
  works.

## `eslint` dies with "ETIMEDOUT: connection timed out, read", and `tsc` crawls
**2026-09-06**

- **Symptom:** `npx eslint .` exits 2 with
  `Error: ETIMEDOUT: connection timed out, read` thrown from `readFileSync`
  inside `node_modules` (it named `globalthis/index.js`, but the file varies).
  In the same run `npx tsc --noEmit` took **9 minutes** while using only ~3
  seconds of CPU — almost entirely blocked on I/O.
- **Cause:** the project lives under `~/Documents`, which iCloud Drive syncs.
  iCloud **evicts** rarely-touched files to the cloud and leaves a dataless
  placeholder behind. `node_modules` is a perfect eviction target: tens of
  thousands of files nobody opens between installs. Reading one then blocks on
  a network fetch, and slow fetches surface as `ETIMEDOUT` — from `readFileSync`,
  which is why it looks like a broken package rather than a storage problem.
  Same root cause as the `<name> 2.ts` duplicates below.
- **Fix:** materialise the tree, then re-run:
  ```bash
  brctl download node_modules
  ```
  It returns immediately and fetches in the background, so the first retry may
  still be slow — the second one is fast.
- **Permanent fix — already applied 2026-09-06.** The owner set the project
  folder to **Keep Downloaded** (right-click the folder in Finder → *Keep
  Downloaded*), so iCloud may no longer evict its contents. If these symptoms
  ever come back, check that setting first: it can be silently reset by moving
  or re-syncing the folder.
- **Next time:** the tell is an I/O error (`ETIMEDOUT`, `ENOENT` on a package
  that is definitely installed) from inside `node_modules`, or a `tsc`/`eslint`
  run whose wall time dwarfs its CPU time. Reach for `brctl download` before
  `rm -rf node_modules && npm install` — the reinstall works, but it takes far
  longer and treats the symptom.
- **Unrelated trap while debugging this:** a wait loop written as
  `while pgrep -f "tsc --noEmit"; do sleep 3; done` never exits — `pgrep -f`
  matches the shell running that very loop. Wait on the PID (`kill -0 $pid`) or
  bracket the pattern (`pgrep -f "[t]sc"`).

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
- **It happened, 2026-09-08.** `src/lib/seo 2.ts` appeared beside the `seo.ts`
  created that morning and was **committed** by a `git add -A`, because nothing
  in the gate objects: it is an identical copy, nothing imports it, so `tsc`,
  `eslint` and `build` all stayed green. Caught only by running the repo-wide
  `find` above while clearing `.next` duplicates. **Run that `find` before any
  `git add -A` in this repo**, especially after creating a new file — "Keep
  Downloaded" stops eviction but does not stop the sync from forking a file
  that is written while syncing.

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
