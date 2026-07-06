-- Support resources for refugees / asylum seekers, powering the /journey/refugee
-- explore-mode page. Vulnerable-audience content: every row is independently
-- link-verified before insert (verified_at). Public reads are gated to active rows.
--
-- Schema note: this table deliberately uses a simple `active boolean` flag rather
-- than the site-wide `content_status` enum. It mirrors the same "public reads only
-- good rows" RLS pattern (other tables gate on status = 'published'); here anon
-- reads are gated on active = true.

create table if not exists support_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  category text not null,          -- controlled set, enforced by CHECK below
  description text not null,
  region text null,                -- NULL = national; else an existing published city slug
  source text not null,
  verified_at date not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Category must be one of the 8 controlled slugs.
alter table support_resources
  drop constraint if exists support_resources_category_chk;
alter table support_resources
  add constraint support_resources_category_chk
  check (category in (
    'asylum_procedure','counseling','legal_advice','integration_language',
    'social_welfare','health','family_safety','emergency_orientation'
  ));

-- Region must be NULL (national) or an existing city slug.
alter table support_resources
  drop constraint if exists support_resources_region_fk;
alter table support_resources
  add constraint support_resources_region_fk
  foreign key (region) references cities(slug);

alter table support_resources enable row level security;

drop policy if exists "public read active" on support_resources;
create policy "public read active" on support_resources
  for select using (active = true);
