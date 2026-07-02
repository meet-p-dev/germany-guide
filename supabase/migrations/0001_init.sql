-- Core schema: content model with generic guides + per-city variants.

create type content_status as enum ('draft', 'reviewed', 'published', 'archived');

create table states (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_de text not null,
  code text not null unique
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references states on delete restrict,
  slug text not null unique,
  name_en text not null,
  name_de text not null,
  population int,
  is_published boolean not null default false,
  hero_note text,
  official_portal_url text
);

create table task_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  sort_order int not null default 0
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references task_categories on delete restrict,
  slug text not null,
  title_en text not null,
  title_de text not null,
  summary text,
  audience text[] not null default '{}',
  sort_order int not null default 0,
  locale text not null default 'en',
  unique (slug, locale)
);

create table guides (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks on delete cascade,
  intro_md text not null,
  documents_md text,
  after_md text,
  legal_basis text,
  status content_status not null default 'draft',
  sources jsonb not null default '[]',
  last_verified_at date,
  generated_by text,
  reviewed_by text,
  locale text not null default 'en',
  unique (task_id, locale)
);

create table checklist_steps (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides on delete cascade,
  step_no int not null,
  title_en text not null,
  body_md text,
  doc_names text[] not null default '{}',
  is_optional boolean not null default false,
  unique (guide_id, step_no)
);

create table city_task_variants (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities on delete cascade,
  task_id uuid not null references tasks on delete cascade,
  appointment_required boolean,
  walk_in_possible boolean,
  online_possible boolean,
  booking_url text,
  office_name text,
  office_address text,
  office_hours text,
  typical_wait_time text,
  fees_eur numeric,
  fees_note text,
  city_notes_md text,
  status content_status not null default 'draft',
  sources jsonb not null default '[]',
  last_verified_at date,
  generated_by text,
  reviewed_by text,
  locale text not null default 'en',
  unique (city_id, task_id, locale)
);

create table city_step_overrides (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references city_task_variants on delete cascade,
  base_step_id uuid references checklist_steps on delete cascade,
  action text not null check (action in ('replace', 'hide', 'insert')),
  insert_after_step_no int,
  title_en text,
  body_md text,
  constraint insert_needs_position check (action <> 'insert' or insert_after_step_no is not null),
  constraint non_insert_needs_base check (action = 'insert' or base_step_id is not null)
);

create table problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title_en text not null,
  description_md text not null,
  category_id uuid references task_categories on delete set null,
  related_task_ids uuid[] not null default '{}',
  severity text,
  status content_status not null default 'draft',
  sources jsonb not null default '[]',
  last_verified_at date,
  generated_by text,
  reviewed_by text,
  locale text not null default 'en',
  unique (slug, locale)
);

create table solutions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems on delete cascade,
  city_id uuid references cities on delete cascade,
  title_en text not null,
  body_md text not null,
  effectiveness text not null default 'official'
    check (effectiveness in ('official', 'workaround', 'last-resort')),
  sort_order int not null default 0,
  -- copied from parent problem at publish time so RLS stays a plain column check
  status content_status not null default 'draft'
);

create table letters (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title_de text not null,
  title_en text not null,
  sender text,
  what_it_means_md text not null,
  what_to_do_md text not null,
  deadline_note text,
  looks_like_md text,
  related_task_id uuid references tasks on delete set null,
  urgency text not null default 'info'
    check (urgency in ('info', 'action-needed', 'urgent')),
  status content_status not null default 'draft',
  sources jsonb not null default '[]',
  last_verified_at date,
  generated_by text,
  reviewed_by text,
  locale text not null default 'en',
  unique (slug, locale)
);

create table glossary_terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  term_de text not null,
  term_en text not null,
  definition_md text not null,
  related_task_ids uuid[] not null default '{}',
  status content_status not null default 'draft',
  locale text not null default 'en',
  unique (slug, locale)
);

create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  home_city_id uuid references cities on delete set null,
  audience text,
  created_at timestamptz not null default now()
);

create table user_task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  city_id uuid not null references cities on delete cascade,
  task_id uuid not null references tasks on delete cascade,
  completed_step_ids uuid[] not null default '{}',
  completed_override_ids uuid[] not null default '{}',
  notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, city_id, task_id)
);

create index cities_state_idx on cities (state_id);
create index tasks_category_idx on tasks (category_id);
create index checklist_steps_guide_idx on checklist_steps (guide_id);
create index variants_city_idx on city_task_variants (city_id);
create index variants_task_idx on city_task_variants (task_id);
create index overrides_variant_idx on city_step_overrides (variant_id);
create index solutions_problem_idx on solutions (problem_id);
create index solutions_city_idx on solutions (city_id);
create index progress_user_idx on user_task_progress (user_id);
