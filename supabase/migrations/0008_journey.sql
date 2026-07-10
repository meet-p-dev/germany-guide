-- Increment H: Emergent-style phased journey (city guide + /process page).
--
-- journey_phases: chronological phase grouping with a display subtitle.
-- journey_steps:  persona-aware ordered steps. A step is either task-backed
--   (task_id → verified guide + city_task_variant content) or a standalone
--   "life" step (accommodation, SIM, learn German …) carrying its own copy.
--   Skeleton life steps are status='draft' until the content pipeline fills
--   them. Ordering metadata only → public read.
--
-- Note: a separate unmerged worktree branch also introduced a `0008` migration
-- (student_journey_steps + journey_phases without subtitle). Only one journey
-- migration should ultimately live on main — this is the one this branch uses.

create table if not exists public.journey_phases (
  slug text primary key,
  name_en text not null,
  subtitle_en text,
  sort_order int not null
);
-- journey_phases may pre-exist from the older branch without this column.
alter table public.journey_phases add column if not exists subtitle_en text;

create table if not exists public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  persona text not null default 'student',
  phase text not null references public.journey_phases(slug),
  phase_order int not null,
  task_id uuid references public.tasks(id) on delete set null,
  slug text not null,
  title_en text,
  title_de text,
  summary text,
  icon text,
  city_specific boolean not null default false,
  applies_to text[] not null default '{}',
  details_md text,
  documents text[] not null default '{}',
  tips text[] not null default '{}',
  note_md text,
  runs_parallel_with uuid[] not null default '{}',
  status public.content_status not null default 'draft',
  locale text not null default 'en',
  unique (persona, slug, locale)
);

create index if not exists journey_steps_persona_order_idx
  on public.journey_steps (persona, locale, phase_order);

alter table public.journey_phases enable row level security;
alter table public.journey_steps enable row level security;

drop policy if exists "public read" on public.journey_phases;
create policy "public read" on public.journey_phases for select using (true);

drop policy if exists "public read" on public.journey_steps;
create policy "public read" on public.journey_steps for select using (true);
