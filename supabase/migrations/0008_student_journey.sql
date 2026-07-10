-- Student chronological journey: a real per-persona time-ordering of tasks,
-- distinct from the browsing `category` used by explore mode. Additive only —
-- tasks.category_id / tasks.sort_order / task_categories are untouched.
--
-- journey_phases: display grouping of chronological phases.
-- student_journey_steps: per-persona placement of a task in a phase, with a
--   strictly-increasing global rank (phase_order) that the dashboard cursor can
--   walk as a single linear order, plus runs_parallel_with to show genuinely
--   concurrent tasks as concurrent instead of a forced 1-2-3 chain.
-- Both tables hold only non-sensitive ordering metadata → public read.

create table if not exists public.journey_phases (
  slug text primary key,
  name_en text not null,
  sort_order int not null
);

create table if not exists public.student_journey_steps (
  id uuid primary key default gen_random_uuid(),
  persona text not null default 'student',
  task_id uuid not null references public.tasks(id) on delete cascade,
  phase text not null references public.journey_phases(slug),
  phase_order int not null,                          -- strictly-increasing global rank per (persona, locale)
  runs_parallel_with uuid[] not null default '{}',   -- task_ids that genuinely overlap in time
  note_md text,                                      -- honest per-step note (e.g. nationality/embassy)
  locale text not null default 'en',
  unique (persona, task_id, locale)
);

create index if not exists student_journey_steps_persona_order_idx
  on public.student_journey_steps (persona, locale, phase_order);

alter table public.journey_phases enable row level security;
alter table public.student_journey_steps enable row level security;

drop policy if exists "public read" on public.journey_phases;
create policy "public read" on public.journey_phases
  for select using (true);

drop policy if exists "public read" on public.student_journey_steps;
create policy "public read" on public.student_journey_steps
  for select using (true);
