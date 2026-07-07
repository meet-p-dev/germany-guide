# germanyguide.net — Build specification for the AI agent loop

This document is the shared source of truth for the planner → researcher → verifier → builder loop.
It exists so the planner has a backlog it can decompose one increment at a time, and the builder has
verifiable "done" conditions instead of vibes. Read Part 1 once and internalize it; it constrains
every increment in Part 4.

---

## Part 1 — The one principle every agent must hold

A first-time newcomer must never feel the whole mountain at once. Every screen answers a single
question: **"What is the very next thing I do?"** Everything else stays out of the way until it is
relevant.

Four rules enforce this. Any UI an agent builds must pass all four:

1. **One primary action per screen.** Exactly one visually dominant call to action. Everything else
   is secondary (quieter color, smaller, lower on the page). If a beginner must choose between
   several equally-loud buttons, the screen fails.
2. **Progressive disclosure.** Never show a later step while the user is on an earlier one. Future
   steps are visible but dimmed or locked; completed steps are collapsed. Detail lives one tap away,
   never on the surface.
3. **Plain language, jargon explained inline.** Every German bureaucratic term appears with a plain
   gloss right beside it, e.g. "Anmeldung (register your address)", every time, until the user has
   completed that step.
4. **Constant reassurance.** A visible progress indicator and light social proof ("12 people did
   this step in Berlin this week"). The interface's job is to keep saying: here is just the next bit.

If any increment's output violates one of these four, the verifier rejects it and sends it back to
the planner. These rules are non-negotiable and outrank aesthetic preference.

---

## Part 2 — The two modes

The entire product is two modes on top of one shared content database. The mode a visitor is in is
decided by one thing: have they created a personal plan (signed up) or not.

### Explore mode (anonymous)

- **Job:** orient a scared beginner who may not have decided to come yet. Show the whole shape of the
  journey, calmly, with no pressure and no account required.
- **Surfaces:** homepage, the six-stage journey view, per-persona path pages (student, skilled
  worker, refugee, joining family, EU citizen), city pages, task guides, comparison tools, daily-life
  guides.
- **Behaviour:** everything is browsable and educational. The whole map is visible. Exactly one soft
  invitation recurs: "Build my personal plan" (this is the sign-up hinge).
- **Feeling to produce:** "I now understand the shape of this. It is a lot, but it is finite and
  someone has mapped it."

### The hinge (the quiz)

- A short quiz (target: 5 questions) captures visa type, city, family situation, arrival timeline,
  and current stage.
- On completion it assembles a personal plan from the same task + city content the explore pages use.
- This is the single moment that converts generic content into a personal, trackable product.

### Guided mode (signed in / plan created)

- **Job:** remove the mountain. The same six stages still exist, but the site now shows **one next
  step**. Completed steps are folded away; future steps are dimmed/locked until their turn.
- **Surface:** the dashboard is now the home of the site. Its centre is a single dominant "your next
  step" card with: plain-language title, why it matters, deadline, live wait time, documents needed,
  and one primary "show me how, step by step" action.
- **Behaviour / the transformation rules — what changes at sign-up:**
  - Navigation reorients around *their* timeline, not the full site.
  - The generic six-stage map collapses into: done (folded) · now (one lit card) · next (dimmed).
  - City-specific rules and live data are injected into the step the user is actually on.
  - Deadlines become tracked and can trigger reminders.
  - Progress is always visible (stage X of 6, % settled).
- **Feeling to produce:** "I do not have to think about the whole thing. Just this one step, and it
  is clearly explained."

---

## Part 3 — Information architecture (the linear spine)

The site has a single main spine and optional depth hanging off it. Agents must preserve this shape;
do not turn the spine into a web of equally-weighted links.

```
Spine (the path a beginner walks):
  Landing  →  Pick your situation  →  See the journey  →  [Build my plan]  →  Dashboard  →  Next step  →  (repeat)

Depth (one tap off the spine, never on the surface):
  - Task guide detail (federal default + city override)   ← hangs off each step
  - City page detail (rules, wait times, rent, nearby cheaper cities)
  - Comparison tools (blocked account, insurance, banking)
  - Daily-life guides (furniture, groceries, transport, culture shock)
  - Problems + solutions library
  - Community Q&A (later)
```

Content model reminder (already largely built on the live site): a task is authored **once** as the
federal default; each city stores **only its differences**; a city with no override shows the default
labeled "standard process, not yet locally verified" with a "report a difference" prompt. No page is
ever authored per combination — combinations are assembled at request time from tasks + city rows +
persona rules.

---

## Part 4 — The build backlog (planner decomposes one increment at a time)

Each increment below is sized to be planned, built, and verified in one loop pass. Each has a goal,
a scope, an explicit out-of-scope, and a **Done when** list of verifiable conditions. The planner
should pull the top unfinished increment, decompose it into tasks for the researcher/builder, and
only advance when every "Done when" line is checked by the verifier.

Do not build increments out of order — each assumes the previous one exists.

### Increment 0 — Foundation and design tokens
- **Goal:** a consistent visual system so every later screen inherits "smooth" for free.
- **Scope:** define color tokens, type scale (one display face, one body face), spacing scale,
  the shared components: primary button, secondary button, step card, progress bar, "jargon gloss"
  inline component, dimmed/locked list item.
- **Out of scope:** any real page or content.
- **Done when:** a single tokens/components file exists; a demo page renders every shared component
  in light and dark; a primary and secondary button are visually distinguishable at a glance;
  the four Part-1 rules are written into the repo as a checklist the verifier can run against.

### Increment 1 — Explore mode: the journey view (static, no account)
- **Goal:** a beginner can land and understand the whole six-stage path calmly.
- **Scope:** the six-stage vertical stepper; each stage expandable to a plain-language summary; one
  recurring soft "Build my personal plan" CTA.
- **Out of scope:** personalization, quiz, city specifics, login.
- **Done when:** all six stages render; only one CTA style is primary on the page; no jargon appears
  without an inline gloss; expanding a stage does not navigate away (progressive disclosure holds);
  passes all four Part-1 rules.

### Increment 2 — Explore mode: persona path pages
- **Goal:** a visitor sees themselves. "How to move to Germany as a student" lands on the student
  path, not a generic page.
- **Scope:** one page per persona (student, skilled worker, refugee, joining family, EU citizen),
  each rendering the six stages with persona-specific detail pulled from the content model.
- **Out of scope:** account, saved state.
- **Done when:** each persona page is its own indexable URL; switching persona changes stage detail,
  not layout; the refugee page links out honestly to official/free services and carries the correct
  supportive tone; passes all four Part-1 rules.

### Increment 3 — The quiz (the hinge)
- **Goal:** capture the five inputs and produce a plan object.
- **Scope:** 5 questions, one per screen, each with one primary "continue"; a progress indicator;
  a final screen that assembles and shows the personal plan (read-only for now).
- **Out of scope:** accounts, reminders, persistence beyond the session.
- **Done when:** each question screen has exactly one primary action; answers already known (e.g.
  persona, if the user arrived from a persona page) are pre-filled and not re-asked; the final plan
  reflects every answer; abandoning mid-quiz loses nothing the user must re-enter unnecessarily;
  passes all four Part-1 rules.

### Increment 4 — Guided mode: the dashboard and the single next step
- **Goal:** the core product. Turn the assembled plan into a one-step-at-a-time guided experience.
- **Scope:** the dashboard with done (folded) · now (one dominant card) · next (dimmed/locked);
  the next-step card with title + gloss, why-it-matters, deadline, live wait time, documents, and one
  "show me how" primary action; "mark as done" advances to the next step.
- **Out of scope:** reminders, crowd data writes, community.
- **Done when:** exactly one step is ever presented as "now"; completing it folds it into done and
  lights the next; future steps are visibly locked; the whole mountain is never shown at once;
  city-specific rule text appears inside the current step; passes all four Part-1 rules.

### Increment 5 — Accounts and persistence
- **Goal:** a plan survives across sessions and devices.
- **Scope:** minimal account creation, save the plan and progress, resume on return.
- **Out of scope:** social features.
- **Done when:** a returning user lands directly on their current step; progress persists; a clear
  data-deletion path exists (GDPR); sign-up is offered only after value is shown, never before the
  quiz.

### Increment 6 — Deadline reminders
- **Goal:** the site reaches out before a deadline is missed.
- **Scope:** compute real deadlines from the plan (e.g. 14-day Anmeldung window from move-in date);
  send email reminders ahead of each.
- **Done when:** a reminder fires ahead of a real deadline in a test; a user can turn reminders off;
  no reminder references a step the user has already completed.

### Increment 7 — The crowd-verification loop
- **Goal:** start the flywheel that keeps city data fresh.
- **Scope:** after "mark as done", a two-tap prompt — "did this match what we told you? yes / no",
  and if no, what differed (booking method, documents, fee). Feed reports into a moderation queue;
  surface "confirmed by N newcomers · updated X ago" on city pages.
- **Done when:** completing a step offers the prompt; a "no" report captures the specific difference;
  city pages show provenance; one person's report never silently overwrites verified data (needs
  agreement threshold).

### Increment 8 — Satellite-city cost advisor
- **Goal:** when a target city is expensive, suggest well-connected cheaper neighbours.
- **Scope:** a nearby-cities relation on the city table with rent + commute time; render a comparison
  on expensive city pages and in the plan where relevant.
- **Done when:** an expensive city (e.g. Munich) shows at least two cheaper connected alternatives
  with real rent and commute figures and the Deutschlandticket note; cheap cities show no advisor.

### Increment 9+ — Later
- Comparison tools with disclosed affiliate links; expanded daily-life guides (furniture, groceries,
  transport, culture shock); scoped community Q&A once traffic supports it; multilingual support,
  prioritizing the refugee and family-reunion journeys first.

---

## Part 5 — How to run the loop (roles, hand-offs, token discipline)

### What the planner holds (interactive with you)
- The backlog above, in order. The planner's only job each cycle: pick the top unfinished increment,
  restate its Goal and Done-when, decompose it into 2–5 concrete builder tasks, and confirm scope
  with you before work starts. The planner does not write code.
- The planner keeps a short running log: what increment is active, what is done, what was rejected
  and why. This log is what lets a fresh loop resume without re-reading everything.

### Researcher (autonomous)
- Given one builder task, gather only what that task needs: the exact German rule, the current fee,
  the document list, the specific city difference. Return findings as short bullet facts with a
  source and a date, nothing more. Do not return prose essays — the builder needs facts, not reading.

### Builder (autonomous)
- Build strictly to the active increment's scope and the four Part-1 rules. Do not add features from
  later increments even if they seem easy — that is how scope and tokens blow up. If a needed fact is
  missing, request it from the researcher rather than inventing it.

### Verifier (autonomous)
- Check the builder's output against the increment's Done-when list AND the four Part-1 rules, one by
  one. Output a pass/fail per line. Any fail goes back to the planner with the specific failing line.
  The verifier does not fix; it judges.

### Token discipline (say this to every agent)
- Work at the granularity of one increment. Never load the whole codebase or whole spec when one
  section suffices — reference the specific increment and the Part-1 rules only.
- Researcher returns facts, not essays. Builder builds scope, not extras. Verifier judges against the
  checklist, not open-endedly.
- The planner's running log replaces re-reading history: resume from the log, not from scratch.
- "Definition of done" is always the increment's Done-when list. Nothing is "done" on vibes.

### The prompt pattern to give your planner
> You are the planner in a build loop for germanyguide.net. Source of truth: BUILD_SPEC. Part 1 (the
> four rules) constrains everything. Pick the top unfinished increment from Part 4. Restate its Goal
> and Done-when. Decompose it into 2–5 builder tasks, each with the facts the researcher must fetch.
> Confirm scope with me before building. Do not exceed the increment's scope. Keep the running log
> updated. When the verifier passes every Done-when line, mark the increment done and stop for my
> review before the next one.

---

## Appendix — quick reference

- **The one principle:** never the whole mountain; always the one next step.
- **The four rules:** one primary action · progressive disclosure · plain language + inline gloss ·
  constant reassurance.
- **Two modes:** explore (whole map, calm, anonymous) → [quiz hinge] → guided (one lit step).
- **Content model:** author once (federal) + store differences (city) + assemble at request time.
- **Loop:** planner (interactive, decomposes) → researcher (facts) → builder (scope only) →
  verifier (checklist) → back to planner.
