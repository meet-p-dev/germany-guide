@AGENTS.md
@docs/PROJECT-STATE.md

# Germany Guide — project rules

**The goal (never drift from it):** Germany Guide walks international students
and workers through the entire journey — from the first thought of Germany to
fully settled — with steps that adapt to their exact city, because German
bureaucracy works differently in every city.

**Scope guard — this site is NOT:** a city-comparison tool, a forum, a visa
consultancy, a housing/job marketplace, or a culture blog.

## Hard rules

- **No emojis anywhere on the website.** Expression comes from the lucide icon
  set, typography, photography and motion.
- **Unmistakably German at first glance:** keep the flag palette
  (cream/black/crimson/gold), the tricolor top stripe, real German city
  photography, and German terms (Anmeldung, Ausländerbehörde…) as first-class
  vocabulary.
- Design tokens and theme live in `src/app/globals.css` (light + dark); fonts
  are DM Sans (body) + Cabinet Grotesk (display, self-hosted in `src/fonts`).
- Motion: Framer Motion only, animate `transform`/`opacity`, always respect
  `prefers-reduced-motion` (MotionConfig is set globally). Enter-only
  animations for step/wizard transitions — no exit-blocking `AnimatePresence
  mode="wait"` on interactive flows.
- Content lives in **Supabase**, not in code (except the small city/persona
  card config in `src/lib/site-config.ts`). Content tables are public-read;
  user tables are per-user RLS. After schema changes: regenerate
  `src/lib/supabase/types.ts` and run the security advisors.
- Every city-specific claim carries a `last_verified` date. City content states
  the *method* (walk_in / appointment / email / online / post).
- Disclaimers stay: general information, not legal advice; link official
  sources.

## Verification

`npx tsc --noEmit && npx eslint . && npm run build` must pass. For UX changes,
walk both visitor types: an Explorer (no city, "just exploring") and a
Committed visitor ("moving soon" + a city) through plan → journey → step pages,
in light and dark mode.
