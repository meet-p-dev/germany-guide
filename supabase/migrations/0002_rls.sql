-- RLS: public read of published content; per-user progress; writes only via service role.

alter table states enable row level security;
alter table cities enable row level security;
alter table task_categories enable row level security;
alter table tasks enable row level security;
alter table guides enable row level security;
alter table checklist_steps enable row level security;
alter table city_task_variants enable row level security;
alter table city_step_overrides enable row level security;
alter table problems enable row level security;
alter table solutions enable row level security;
alter table letters enable row level security;
alter table glossary_terms enable row level security;
alter table profiles enable row level security;
alter table user_task_progress enable row level security;

-- Reference tables: fully public (contain nothing sensitive).
create policy "public read" on states for select using (true);
create policy "public read" on task_categories for select using (true);
create policy "public read" on tasks for select using (true);

create policy "public read published" on cities
  for select using (is_published);

-- Content tables: only published rows are visible to anon/authenticated.
create policy "public read published" on guides
  for select using (status = 'published');
create policy "public read published" on city_task_variants
  for select using (status = 'published');
create policy "public read published" on problems
  for select using (status = 'published');
create policy "public read published" on solutions
  for select using (status = 'published');
create policy "public read published" on letters
  for select using (status = 'published');
create policy "public read published" on glossary_terms
  for select using (status = 'published');

-- Child rows follow their parent's status.
create policy "public read via published guide" on checklist_steps
  for select using (
    exists (
      select 1 from guides g
      where g.id = checklist_steps.guide_id and g.status = 'published'
    )
  );
create policy "public read via published variant" on city_step_overrides
  for select using (
    exists (
      select 1 from city_task_variants v
      where v.id = city_step_overrides.variant_id and v.status = 'published'
    )
  );

-- Per-user rows.
create policy "own profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on user_task_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
