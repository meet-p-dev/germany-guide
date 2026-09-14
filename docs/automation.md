# Automation — how the site keeps itself current

> Rules are in [`rules.md`](rules.md). This file describes the one mechanism
> that lets an agent update the site **without** breaking rule #1
> ("never fabricate a city fact"). Read it before running any of the
> `.claude/commands/` sweeps.
>
> Last updated: **2026-09-06**

---

## The one rule of automation here

**An agent never writes to a content table. It queues a proposal, and a human
applies it.**

This is not caution for its own sake. Every automated content change on this
site is a claim about a German authority's current procedure, fee or address —
exactly the class of fact that `solutions.md` records us getting wrong twice
(Munich's walk-in, Nuremberg's Lorenzer Straße). A search result is evidence,
not verification. The human at the review screen *is* the verification step, and
`last_verified` is their signature on it.

So: research freely, propose freely, publish never.

## The queue

`public.proposed_changes` — admin-only both ways (no public read). Reviewed at
**`/admin/review`**, which shows before/after, the source link, and Approve /
Reject. The nav badge counts what is pending.

| Column | Meaning |
|---|---|
| `target_table` | one of the nine content tables; anything else is rejected by a CHECK constraint |
| `target_id` | the row being changed (`update` only) |
| `op` | `update` (one field) or `insert` (a whole new row via `payload`) |
| `field` | the column, for `update` |
| `current_value` | **what the column held when you proposed.** The drift guard |
| `proposed_value` | the new value, as text |
| `payload` | the whole new row as JSON, for `insert` |
| `source_url` | **NOT NULL.** No source, no proposal |
| `source_name` | e.g. "Stadt Augsburg — Bürgeramt" |
| `rationale` | one or two sentences: what changed and how you know |
| `run_id` | groups one sweep, so a batch can be read together |
| `status` | `pending` → `applied` / `rejected` / `stale` |

### Three guards, and why each exists

1. **Table + field whitelist.** Agents read third-party web pages. If a page
   tries to steer the agent, the worst it can produce is a bad proposal about
   city content — never a write to `admins`, `profiles` or the newsletter
   tables.
2. **Optimistic concurrency.** On apply, the live column is compared to
   `current_value`. If they differ, the proposal is marked `stale` and refused.
   A three-week-old finding cannot silently overwrite a newer human edit.
3. **Provenance.** `source_url` is NOT NULL, so the reviewer always has
   somewhere to go and check.

## How to queue a proposal

**Always select `current_value` from the live row — never type it in.** A
hand-typed `current_value` that happens to be wrong turns the drift guard off,
which is the only thing standing between an agent and a bad overwrite.

An `update`:

```sql
insert into proposed_changes
  (target_table, target_id, op, field, current_value, proposed_value,
   source_url, source_name, rationale, run_id)
select
  'city_steps', cs.id, 'update', 'address',
  cs.address,                                    -- live value, not typed
  'Maximilianstraße 39, 86150 Augsburg',
  'https://www.augsburg.de/buergerservice/buergeramt',
  'Stadt Augsburg — Bürgeramt',
  'City page now lists An der Blauen Kappe 18; our row still says Rathausplatz.',
  'link-check-2026-09-06'
from city_steps cs
join cities c on c.id = cs.city_id
join steps  s on s.id = cs.step_id
where c.slug = 'augsburg' and s.slug = 'anmeldung';
```

An `insert` (a new row — `target_id`, `field` and `proposed_value` stay null):

```sql
insert into proposed_changes
  (target_table, op, payload, source_url, source_name, rationale, run_id)
select
  'city_steps', 'insert',
  jsonb_build_object(
    'city_id', c.id,
    'step_id', s.id,
    'method', 'online',
    'content_md', '...',
    'last_verified', '2026-09-06'
  ),
  'https://www.swa-netze.de/', 'Stadtwerke Augsburg',
  'Augsburg had no public-transport step; operator and student fare verified.',
  'city-research-augsburg'
from cities c, steps s
where c.slug = 'augsburg' and s.slug = 'public-transport';
```

Keying inserts by slug (rules §4) means a wrong slug inserts **nothing** rather
than corrupting data.

### Before you queue anything

- Confirm the live state with a real `count(*)` — `list_tables` row counts are
  stale planner estimates (rules §4).
- One proposal per field. Ten fields on one row is ten rows here, so the
  reviewer can take the address and refuse the opening hours.
- Never `''` inside `$md$…$md$` — it renders literally as `Berlin''s`.
- Numbered lists need one item per line or GFM collapses them into one.

## What the sweeps are

Each is a slash command in `.claude/commands/`:

| Command | Cadence | What it does |
|---|---|---|
| `/link-check` | monthly | Fetches every `links` / `source` URL; queues fixes for dead or moved ones |
| `/verify-figures` | quarterly, hard every January | Re-checks the money figures in `status.md` against the official source |
| `/city-research <slug>` | on demand | Researches a city's missing `city_steps` and queues them as inserts |
| `/updates-scout` | weekly | Watches official sources and drafts an `/updates` item |
| `/session-close` | end of every session | Updates `status.md` / `todo.md` / `solutions.md` |

## Search engine scripts

Two plain Node scripts in `scripts/`, no dependencies. Neither writes to the
database or the site.

| Command | Cadence | What it does |
|---|---|---|
| `npm run seo:index-status` | monthly | Asks Google, through the URL Inspection API, whether each sitemap URL is indexed and which canonical Google chose. Writes `reports/index-status-<date>.csv` (gitignored) and prints a summary |
| `npm run seo:indexnow` | after pages are added or changed | Sends every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver). Google does not use IndexNow |

Both accept `--dry-run`. `seo:index-status` also takes `--limit N`,
`--only /path-prefix` and `--url <address>` (repeatable). Those partial runs
write `index-status-<date>-partial.csv` and leave the history alone. A full
run appends one row to `reports/index-history.csv` and prints which pages
moved forward or back since the previous full run. The key is read from
`~/.config/germany-guide/gsc-service-account.json` unless `GSC_KEY_FILE` says
otherwise. The quota is 2,000 inspections a day per property, so one full run
(about 270 URLs) is well inside it.

**Scheduled:** a Claude desktop scheduled task, `germany-guide-index-check`
(`~/.claude/scheduled-tasks/germany-guide-index-check/SKILL.md`), runs the full
check at 09:00 every day (daily since 2026-09-14, so each morning's report
carries that day's 10 URLs to request by hand; one run uses about 270 of the
2,000 daily inspections), re-runs IndexNow only when the sitemap gained
URLs, and writes the owner a short report ending with the day's 10 URLs to
request by hand. It is read-only on the site: no code, content, docs or
commits. It runs only while the desktop app is open.

### One-time setup for `seo:index-status` (owner)

The script authenticates as a Google Cloud **service account**, so there is no
password in it and nothing to log in to each month. Creating the account and
its key is a credential step, so the owner does it:

1. In [Google Cloud Console](https://console.cloud.google.com/), pick the
   project that already holds the Google sign-in client (or create one).
2. **APIs & Services → Library → "Google Search Console API" → Enable.**
3. **IAM & Admin → Service Accounts → Create service account.** Name it
   `gsc-index-status`. No roles are needed on the project.
4. Open it → **Keys → Add key → JSON.** Save the file outside the repo, at
   `~/.config/germany-guide/gsc-service-account.json`. Never commit it.
5. In Search Console → **Settings → Users and permissions → Add user**, paste
   the service account's email (ends in `iam.gserviceaccount.com`) with
   **Restricted** permission, on `sc-domain:germanyguide.net`.
6. Run
   `GSC_KEY_FILE=~/.config/germany-guide/gsc-service-account.json npm run seo:index-status`.

A `403` on every row means step 5 is missing or was done on another property.

### IndexNow key

`public/ea45c23029c17ad38685d2d01a83bc64.txt` is the IndexNow key file. The key
is **not** a secret: IndexNow proves ownership by fetching that file from the
site. Do not rename or delete it, or submissions start failing with `403`.

### Bing Webmaster Tools (owner)

IndexNow already feeds Bing, but Bing Webmaster Tools shows what Bing has
indexed. Creating the account is the owner's step: sign in at
[bing.com/webmasters](https://www.bing.com/webmasters) and choose **Import from
Google Search Console**. That verifies the site and imports the sitemap in one
go, with no DNS record needed.

## What stays human

Not "for now" — by design:

- **Approving anything.** The review screen is the whole point.
- **Sending mail to real subscribers.** `/admin/newsletter` → Send now.
- **Anything touching credentials** — API keys, the service-role key, account
  creation. Agents do not handle these.
