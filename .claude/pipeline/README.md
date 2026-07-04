# Content pipeline — 4-agent loop

Four subagents (in `.claude/agents/`) that run **sequentially**, handing work to
each other through the files in this folder. You drive it: invoke one agent, review
its output file, then invoke the next.

## The loop

```
④ planner   → reviews what's live, writes a numbered menu → next-options.md
                ↓  (you reply with the number you want)
① researcher → gathers ALL data + sources for that item → research.md
                ↓
② verifier   → re-checks every fact, corrects/flags/removes → verified.md
                ↓
③ builder    → applies to DB, mirrors seed.sql, deploys → deploy-report.md
                ↓
④ planner    → confirms it landed, writes the next menu → next-options.md
                ↺  repeat
```

## How to run a cycle
1. **`@planner`** — "review the last deploy and give me the next options."
   Read `next-options.md`, reply with the number(s) you want.
2. **`@researcher`** — "do option N." Read `research.md`.
3. **`@verifier`** — "verify it." Read `verified.md`.
4. **`@builder`** — "build and deploy it." Read `deploy-report.md` (your undo log).
5. Back to **`@planner`**.

You can stop, edit any hand-off file by hand, or re-run a step at any point.

## Roles at a glance
| Agent | Step | Can it change things? |
|-------|------|-----------------------|
| `planner`    | ④ review + propose | **Read-only** (writes only `next-options.md`) |
| `researcher` | ① gather data      | **Read-only** re: DB/site (writes `research.md`) |
| `verifier`   | ② fact-check       | **Read-only** (writes `verified.md`) |
| `builder`    | ③ build + deploy   | **Yes** — only the Builder writes DB / code / deploys |

All four share the project's honesty rules (real ranges + verify-notes, never fake
precision; no fabricated city differences for federally-uniform tasks). The Builder
always logs an undo path in `deploy-report.md`.

_Hand-off files are regenerated each cycle; treat them as scratch, not history._
