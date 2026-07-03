-- Commuter areas: nearby towns you could live in and commute from, per anchor
-- city. Powers the unique "Where to live if you work/study in [city]" panel —
-- cost-of-living arbitrage across a metro area.

create table commuter_areas (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities on delete cascade,
  name text not null,
  commute_note text not null,
  cost_note text not null,
  why_md text,
  sort_order int not null default 0,
  locale text not null default 'en',
  status content_status not null default 'published'
);

create index commuter_areas_city_idx on commuter_areas(city_id);

alter table commuter_areas enable row level security;

create policy "public read published" on commuter_areas
  for select using (status = 'published');
