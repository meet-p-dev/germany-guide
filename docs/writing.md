# Writing — how anything on this site gets written

> Rules for working here are in [`rules.md`](rules.md). **That file governs what
> is true; this file governs how it reads.** Both apply to every word a visitor
> can see.
>
> Scope: every reader-facing string — `city_steps`, `city_facts`, `steps`,
> `problems`, `letters`, `glossary_terms`, `updates`, plus UI copy, empty
> states, error messages, meta descriptions and emails. It does **not** apply to
> the files in `docs/`, which are notes to ourselves.
>
> Last updated: **2026-09-08**

---

## 0. Why this file exists

The content on germanyguide.net is well researched and, as far as we know,
factually correct. It still reads as machine-written, and readers notice. That
is a trust problem: a visitor who thinks "this was generated" also thinks "this
was not checked", and every `last_verified` date we earned counts for nothing.

The tell is not the facts. It is the **rhythm**. Measured against the live
database on 2026-09-08:

| Signal | Live content | Should be |
|---|---|---|
| Em dashes (`—`) | **203 of 240** `city_facts`, **114 of 126** `city_steps`, **30 of 30** `steps`, **36 of 36** `problems.solution_md` | zero in prose |
| Em dash density | ~1 per 250 characters (about one every two sentences) | none |
| Bold spans | **20 per `city_steps` row** (~160 words) — one every 8 words | at most 2 per 150 words |
| `**The flow:**` as an opener | **86 of 126** city pages, word for word | never |
| Bold-label-and-colon paragraph openers (`**Contact:**`, `**The catch:**`) | 196 rows | rare, and never as scaffolding |
| Numbered items starting with a bold imperative | 125 rows | occasional |
| "X, not Y" closing constructions | 73 rows | occasional |
| Em dashes in `.tsx` UI copy | **261** across 63 files | zero in prose |

Every one of those is a real pattern in the tables today. Fix the rhythm and the
same facts read as though a person checked them, because a person did.

## 1. The model we write to

**GOV.UK house style, adapted.** It is the best-tested writing standard in the
world for exactly our genre: government procedure, explained to people who did
not choose to be reading about it, with money and legal status at stake. Its
rules are not stylistic preferences; they come from usability testing.

The rules we take from it, unchanged:

- **Plain English is mandatory.** Short common words over formal ones: *buy* not
  *purchase*, *help* not *assist*, *about* not *approximately*, *use* not
  *utilise*.
- **Front-load everything.** The most important point first — in the page, the
  section, the paragraph and the sentence. Conclusion, then detail, then
  background.
- **Active voice.** "You book the appointment", not "an appointment must be
  booked."
- **Sentences under 25 words**, averaging 15 to 20.
- **Paragraphs of no more than 3 sentences** here (GOV.UK allows 5; our pages are
  scanned on phones between other tasks).
- **Address the reader as "you."**
- **`must` for a legal requirement, `need` for an administrative one, `can` for
  something optional.** Never blur these — on this site the difference between
  *must* and *should* is the difference between a fine and a preference.
- **Bold is for interface elements and actions, not for emphasis.** Emphasis
  comes from sentence order, headings and lists.

Two places we deliberately diverge, because our reader is not GOV.UK's:

1. **German terms stay.** *Anmeldung*, *Ausländerbehörde*, *Wohnungsgeberbestätigung*
   are the words on the form, the door and the letter. Keeping them is the whole
   point of the site (see `rules.md` §3). Gloss on first use, then use freely.
2. **Most of our readers are not native English speakers.** So: no idioms, no
   metaphors, no wordplay, and avoid negative contractions (*cannot*, *do not*)
   in instructions and warnings, where a missed "n't" inverts the meaning.

**Sources:** [GOV.UK A to Z style guide](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/) ·
[GOV.UK: use clear language](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/)

## 2. Dashes — the single biggest fix

**Do not use the em dash (`—`) in site content. Ever.**

It is the loudest AI tell we have, and it is doing work that four ordinary marks
do better. When you reach for one, choose from this table instead:

| What the dash was doing | Use instead | Example |
|---|---|---|
| Joining two related statements | **Full stop.** Two sentences. | ~~Munich is appointment-only — the walk-in era is over.~~ → Munich is appointment-only. Walk-ins are no longer accepted. |
| Introducing a list or explanation | **Colon** | Bring three things: your passport, the form, and the landlord's confirmation. |
| An aside or extra detail | **Brackets** | Registration is free (and due within 14 days). |
| A small qualifier | **Comma** | Book early, ideally before you fly. |
| Emphasis or a dramatic turn | **Nothing.** Cut it, or make it its own short sentence. | If you arrive without an appointment, you will be sent away. |

**En dash (`–`):** allowed only inside a numeric range in a tight data context —
opening hours, a table cell, a price range in a fact card: `07:00–18:00`,
`Mon–Thu`, `€700–800`. **In a sentence, write "to":** "waiting lists run 1 to 7
semesters", "the visa is valid for 3 to 6 months".

**Hyphen (`-`):** normal compounds only — *walk-in*, *appointment-only*,
*first-time*, *EU-wide* — and inside German compounds where German uses one.

**Applies to UI copy too.** `Germany Guide — bureaucracy explained for
internationals` becomes `Germany Guide: bureaucracy explained for internationals`.
`Act now — this one has real deadlines` becomes `Act now. This one has real
deadlines.`

## 3. The emphasis budget

Bold currently appears about once every 8 words. When everything is bold,
nothing is.

**Budget: at most 2 bold spans per 150 words.** Spend them on one of exactly two
things:

1. **The one fact that costs money, time or legal status if missed.** A
   deadline, a "you will be turned away", a fee that surprises people.
2. **The first appearance of a German term on the page**, with its gloss.
   Afterwards it is plain text.

Never bold: prices, addresses, opening hours, office names, ordinary nouns, or
whole clauses. They are already the content of the sentence; the sentence is
what carries them.

**No italics for emphasis.** Italics are for a quoted German phrase where we are
showing the wording rather than using it.

**No emojis, anywhere** (`rules.md` §3). This is not negotiable and not a style
question.

## 4. Banned constructions

Each of these is in the live content today. Each is a tell.

**Scaffolding labels.** `**The flow:**` opens 86 of 126 city pages. Delete it.
If a sequence needs an introduction, write a sentence that says something
specific to *that city*: "Leipzig releases new appointment slots at 17:00 on
weekdays." If it needs no introduction, start the list.

Also banned as labels: `**The catch:**`, `**The good news:**`, `**The reality:**`,
`**Watch out:**`, `**Heads up:**`, `**Bottom line:**`, `**In short:**`,
`**A <City> bonus:**`.

**The aphoristic closer.** "New debt on top of a plan is what breaks the
goodwill." "That's the moment to look." These read as an author performing
insight. State the fact and stop.

**The "X, not Y" snap.** "Treat these as a range, not a quote." Say the positive
thing: "These figures come from asking-price indices, so your actual rent will
differ."

**"Not just X but Y" / "isn't just".** Never.

**Reassurance filler.** "Don't panic", "mistakes happen", "completely routine",
"perfectly normal", "you're not alone". If a process is common, say how common:
"Payment plans are standard and the Krankenkasse offers them on request."

**Editorial adverbs.** *refreshingly*, *genuinely*, *notably*, *remarkably*,
*surprisingly*, *thankfully*, *mercifully*, *helpfully*. We do not have feelings
about Leipzig's opening hours.

**Metaphor and idiom.** "The walk-in era is over", "the key that unlocks", "piled
up quietly", "a gate that ordinary jobs do not have". Wrong for a non-native
reader and a tell besides.

**Comparative editorialising.** "Unlike most big German cities", "one of the few
places that", "refreshingly relaxed". State what this city does. The reader is
moving to one city, not shopping between forty (`rules.md` §0).

**Triads.** Three-item lists chosen for rhythm rather than completeness
("appointment bookings, bank verification and delivery notifications"). List two
if there are two, or five if there are five.

**Word list.** Replace on sight:

| Avoid | Use |
|---|---|
| crucial, vital, essential, critical | important, or say what happens without it |
| comprehensive, robust, seamless, streamlined | cut it |
| navigate (the system, the process) | say the actual action |
| ensure | make sure, or name the check |
| leverage, utilise, facilitate, empower | use, help, let |
| delve, landscape, realm, sphere | cut it |
| journey (as a metaphor) | cut it — the word is reserved for `/journey`, the product |
| in order to | to |
| prior to | before |
| approximately | about |
| additional | more, extra |
| it is worth noting that | delete the phrase, keep the fact |
| that said, however, moreover, furthermore | usually deletable; if not, "but" |

## 5. Sentences and structure

**Start with what the reader does.** The first sentence of any step or fact
answers "what do I do, and can I do it today?" Background comes after, if at all.

- Bad: "Munich has moved its Bürgerbüros to appointment-only — the walk-in era is over."
- Good: "You need an appointment. Munich's Bürgerbüros do not take walk-ins for registration."

**Vary sentence length on purpose.** A run of five sentences all 18 words long is
its own kind of tell. Follow a long sentence with a short one.

**One idea per paragraph, three sentences at most.**

**Numbered lists are for ordered actions only.** If the order does not matter,
use bullets. Do not open every item with a bold imperative — that is a rhythm,
and rhythms are what get noticed. Write the item as a sentence:

- Bad: `1. **Call the Krankenkasse first** (or write): confirm the exact amount and period.`
- Good: `1. Call or write to your Krankenkasse and ask for the exact amount and the period it covers.`

**Numbers, money and dates** (GOV.UK): numerals for 2 and above; "one" written
out in running text. `€75`, `€1,125`, no decimals unless there are cents.
`15 May 2026`, no comma. Ranges in prose use "to".

**Never claim to know the reader's state.** Not "before you panic", not "the
chaos", not "we know this is stressful". Describe the situation; the reader
supplies the feeling.

## 6. Worked rewrites, from the live database

**`city_steps` — Munich, anmeldung**

> Before: Munich has moved its Bürgerbüros to **appointment-only** — the walk-in
> era is over. The city states plainly that *"you fundamentally need an
> appointment"* (grundsätzlich einen Termin) for a registration visit. Turning up
> with your suitcase and no Termin means being sent away.

> After: You need an appointment before you go. Munich's Bürgerbüros do not take
> walk-ins for registration; the city's own wording is *grundsätzlich einen
> Termin*. If you arrive without one, you will be sent away.

**`city_steps` — Leipzig, anmeldung**

> Before: Leipzig is refreshingly relaxed about registration: it runs **15
> Bürgerbüros** across the city with **no district binding**, and you can either
> **walk in during opening hours** or book ahead.

> After: You can walk in or book ahead. Leipzig has 15 Bürgerbüros and you may
> use any of them, whatever your address.

**`city_facts` — Munich, housing**

> Before: Studierendenwerk München Oberbayern runs **9,000+ subsidised rooms**
> averaging about **€400/month** — the cheapest way to live in Munich. Apply
> online early (from 15 May for winter semester, 15 Nov for summer); waiting
> lists run **1–7 semesters**, so this is a "apply the day you can" task.

> After: Studierendenwerk München Oberbayern runs more than 9,000 subsidised
> rooms at about €400 a month. Waiting lists run from 1 to 7 semesters, so apply
> the day the portal opens: 15 May for the winter semester, 15 November for the
> summer.

**`problems.solution_md` — health insurance debt**

> Before: **Treat it as urgent — insurance debt reaches your residence status:**
> 1. **Call the Krankenkasse first** (or write): confirm the exact amount and
> period. Mistakes happen — e.g. contributions charged as "voluntary member"
> during a gap you thought was covered by a job.

> After: Unpaid health insurance can affect your residence permit, so deal with
> this now.
> 1. Call or write to your Krankenkasse and ask for the exact amount and the
> period it covers. Check it against your own records: contributions are
> sometimes charged at the voluntary-member rate for a gap an employer had
> already covered.

Note what stayed: every figure, every office name, every German term, the
urgency. Only the performance was removed.

## 7. Per-field rules

| Field | Shape |
|---|---|
| `steps.summary` | One sentence, under 20 words, what the reader does. No dash, no bold. |
| `steps.quick_action` | One filled line. Connectors stay ASCII (` - `, ` . `, ` , `) so unfillable tokens drop cleanly — see `rules.md` §2. |
| `city_steps.method_note` | Leads with the route **this site's reader can actually use** (`solutions.md`, the eWA/eID entry). One or two sentences. |
| `city_steps.content_md` | Opens with the action, not a label. No `**The flow:**`. 150–300 words. |
| `city_facts.content_md` | 2 to 4 sentences. Figure, source-anchored, then what to do about it. |
| `problems.problem_md` | The reader's situation in their words, present tense, no drama. |
| `problems.solution_md` | Numbered actions, plain sentences, first item doable today. |
| `glossary_terms.definition_md` | One or two sentences. What it is, then why it matters to the reader. |
| `letters.what_to_do_md` | Actions in order, with the deadline first if there is one. |
| `updates.body_md` | What changed, when it takes effect, who it affects. Link the source. |
| `seo_title` / `seo_description` | ≤60 and ≤160 characters **as rendered**, suffix included (`solutions.md`). Colons, never dashes. |
| UI strings, errors, empty states | Same rules. Say what happened and what to do next. |

## 8. Before you publish

Read the passage aloud. If it sounds like a presentation, rewrite it. Then run
the detectors — they take seconds and catch what reading misses.

```sql
-- Em dashes anywhere in reader-facing prose. Expect 0 on anything you touched.
select 'city_steps' t, count(*) from city_steps where content_md like '%—%' or method_note like '%—%'
union all select 'city_facts', count(*) from city_facts where content_md like '%—%'
union all select 'steps', count(*) from steps where content_md like '%—%' or summary like '%—%'
union all select 'problems', count(*) from problems where solution_md like '%—%' or problem_md like '%—%'
union all select 'glossary_terms', count(*) from glossary_terms where definition_md like '%—%'
union all select 'letters', count(*) from letters where what_to_do_md like '%—%' or what_it_is_md like '%—%'
union all select 'updates', count(*) from updates where body_md like '%—%';
```

```sql
-- Scaffolding labels and banned constructions.
select slug, count(*) from (
  select c.slug from city_steps cs join cities c on c.id = cs.city_id
  where cs.content_md ~* '\*\*(The flow|The catch|The good news|Bottom line|In short|Watch out|Heads up)'
     or cs.content_md ~* '(refreshingly|genuinely|notably|remarkably|surprisingly|thankfully|unusually) '
     or cs.content_md ~* 'not just .{1,50} but|isn''t just|unlike most|unlike many'
) x group by slug order by 2 desc;
```

```sql
-- Emphasis budget: bold spans per 150 words. Flag anything over ~2.
select c.slug, s.slug step,
       ((length(cs.content_md) - length(replace(cs.content_md,'**','')))/4.0)
         / (greatest(array_length(regexp_split_to_array(cs.content_md,'\s+'),1),1)/150.0) as bold_per_150w
from city_steps cs join cities c on c.id = cs.city_id join steps s on s.id = cs.step_id
order by 3 desc limit 20;
```

Shell equivalent for UI copy:

```bash
grep -rn "—" src --include="*.tsx" --include="*.ts" | grep -v "^\s*//"
```

Then the checklist:

- [ ] No `—` in anything a visitor reads.
- [ ] `–` only inside a numeric range in a data field; "to" in sentences.
- [ ] At most 2 bold spans per 150 words, each earning its place.
- [ ] No scaffolding label opens the passage.
- [ ] First sentence says what the reader does.
- [ ] No sentence over 25 words; no paragraph over 3 sentences.
- [ ] `must` / `need` / `can` used precisely.
- [ ] No idiom, metaphor, editorial adverb or aphoristic closer.
- [ ] No emoji.
- [ ] The facts are unchanged, still sourced, and `last_verified` still honest.

## 9. What this file does not change

Style is downstream of truth. Nothing here loosens `rules.md`:

- **Never invent a fact, figure, address, office name, fee or deadline.** Rewriting
  a sentence is not licence to smooth over a number you did not verify. If the
  plain version needs a fact you do not have, leave the fact out.
- **`last_verified` still means you checked the source**, not that you edited the
  prose.
- **Agents still propose, humans still publish** ([`automation.md`](automation.md)).
  A style rewrite goes through `proposed_changes` like anything else; `source_url`
  is the source of the *fact*, unchanged.
- **German terms, the flag palette, the no-emoji rule and the scope guard** are
  all unaffected.

## 10. Fixing what is already there

The whole corpus predates this file. Do not attempt a single sweeping rewrite —
595 prose rows is a rewrite of the site, and a bulk regex over em dashes would
produce comma splices at scale.

Order of work, highest visible return first:

1. **UI copy in `src`** — 261 em dashes across 63 files, including the site
   `<title>`. Hand-edited, one pass, no database involved.
2. **The 30 `steps.content_md` rows** — every one has an em dash, they average
   7.8 each, and these pages carry the Germany-wide guides.
3. **`city_steps` for the cities with real traffic**, starting with the 86 rows
   that open `**The flow:**`.
4. **`city_facts`**, 240 rows, mostly a dash-and-bold fix rather than a rewrite.
5. **`problems`, `letters`, `glossary_terms`** as they are next touched.

Anything written or edited from today onward follows this file from the start,
whoever or whatever is writing it.
