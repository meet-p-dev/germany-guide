-- Partner offers: affiliate providers + own-app cross-promo, shown as a
-- "Recommended services" box on the relevant task guide pages.

create table partner_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  kind text not null check (kind in ('affiliate', 'own_app')),
  task_slugs text[] not null default '{}',
  name text not null,
  blurb_md text,
  cta_label text not null default 'Learn more',
  url text not null,
  sort_order int not null default 0,
  status content_status not null default 'draft',
  unique (slug, locale)
);

create index partner_offers_task_slugs_idx on partner_offers using gin (task_slugs);

alter table partner_offers enable row level security;

-- Same model as the other content tables: only published rows are public.
create policy "public read published" on partner_offers
  for select using (status = 'published');
