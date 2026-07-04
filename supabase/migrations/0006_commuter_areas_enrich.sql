-- Enrich commuter_areas with verified, nullable, additive columns.
-- All nullable/additive: existing rows and the "Where to live" panel (which
-- reads commute_note/cost_note) keep working unchanged.
alter table commuter_areas
  add column if not exists commute_line text,
  add column if not exists commute_minutes text,       -- honest ranges like "25-40 min", NOT int
  add column if not exists rent_note text,              -- only where a sourced range survived verification
  add column if not exists has_own_office boolean,
  add column if not exists office_note text,
  add column if not exists last_verified_at date,
  add column if not exists sources jsonb not null default '[]'::jsonb;
