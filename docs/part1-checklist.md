# Part 1 — the four smoothness rules (verifier checklist)

Run this against **every screen or component** an increment produces. Each line is
a concrete yes/no you answer by *looking at the screen* — not a principle to
interpret. Any **NO** (or a **YES** where the rule says it must be NO) = reject
the increment and send it back to the planner with the failing line.

> The one principle behind all four: the newcomer must never feel the whole
> mountain at once. Every screen answers only **"what is the very next thing I do?"**

---

## Rule 1 — One primary action per screen

- [ ] Is there **exactly one** primary-colored (Guide-Blue, filled) action visible? — yes / no
- [ ] Is **every other** action visually quieter (secondary/outline/text, not Guide-Blue-filled)? — yes / no
- [ ] Squint test: does **one** button clearly stand out as "the thing to do next"? — yes / no
- [ ] Are there **two or more** equally-loud buttons competing? — must be **NO**

## Rule 2 — Progressive disclosure

- [ ] Is **at most one** step shown in the "now / current" state? — yes / no
- [ ] Are future steps shown **dimmed or locked** (not presented as available now)? — yes / no
- [ ] Are completed steps **folded/collapsed** rather than left fully expanded? — yes / no
- [ ] Is deeper detail **one tap away** rather than on the surface? — yes / no
- [ ] Is a later step fully visible/active while the user is on an earlier one? — must be **NO**

## Rule 3 — Plain language, jargon explained inline

- [ ] Does **every** German bureaucratic term appear with a plain-English gloss beside it, e.g. "Anmeldung (register your address)"? — yes / no
- [ ] Is there **any bare German term** on the screen with no inline gloss? — must be **NO**
- [ ] Is the gloss shown **inline** (right beside the term), not hidden behind a hover/tooltip only? — yes / no

> **Note (auto-gloss, Increment 1.5):** Bare German terms **inherited from DB
> content** (e.g. inside `tasks.summary`) are resolved by the presentation-layer
> auto-gloss helper (`lib/auto-gloss.tsx`), which reads `glossary_terms` and
> wraps recognized terms in `<JargonGloss>` at render time — **not** by editing
> content strings. So a bare German term in a raw DB string is acceptable *iff*
> it renders through the auto-gloss helper. Don't "fix" this by rewriting
> content; extend the helper's coverage (or add the missing term to
> `glossary_terms`) instead. The helper skips terms already parenthetically
> glossed or already hand-glossed in the same row (no double-gloss).

## Rule 4 — Constant reassurance

- [ ] Is a **progress indicator** visible showing where the user is (e.g. "Stage 2 of 6 · 20% settled")? — yes / no
- [ ] Does the progress make the journey feel **finite** (a fixed, countable number of stages)? — yes / no
- [ ] Where appropriate, is there **light social proof** (e.g. "12 people did this in Berlin this week")? — yes / no / N-A on token or demo-only screens

---

## Accessibility gate (not Part 1, but non-negotiable for every increment)

- [ ] Does **every** text/background pair meet **WCAG AA** (4.5:1 normal text, 3:1 large text) in **light** mode? — yes / no
- [ ] Same, in **dark** mode? — yes / no
- [ ] Does **every** action/background pair (e.g. button label on button fill) meet AA in both modes? — yes / no
- [ ] Does every component render correctly in **both** light and dark? — yes / no
- [ ] Was contrast **measured** (not eyeballed)? — yes / no

_Increment 0 baseline: all gg-\* tokens were run through a WCAG contrast script;
all pairs pass in both modes. Re-run the script if any token value changes._
