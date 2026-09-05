@AGENTS.md
@docs/rules.md
@docs/status.md
@docs/todo.md

# Germany Guide — project rules

Everything is split into three files, all imported above:

- **[`docs/rules.md`](docs/rules.md)** — how to work here, strictly. The goal and
  scope guard, no-fabrication and sourcing rules, where content lives and which
  fields actually render, design/code constraints, DB gotchas, the verification
  gate, and how to deploy. **Read it before writing anything.**
- **[`docs/status.md`](docs/status.md)** — what exists, with counts, a dated
  changelog, the verified 2026 figures, and the per-city traps.
- **[`docs/todo.md`](docs/todo.md)** — what is left, in priority order, including
  what is deliberately *not* being done.

Two rules are important enough to repeat here:

1. **Never fabricate a city fact, figure, address or fee.** Research the official
   source; every claim carries `last_verified`.
2. **No emojis anywhere on the site.** Expression comes from lucide icons,
   typography, photography and motion.

Keep `status.md` and `todo.md` current at the end of every session.
