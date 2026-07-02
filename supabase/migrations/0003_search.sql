-- Full-text search over published content via a security-invoker function.
-- Uses 'simple' config: content is English prose full of German terms, so
-- stemming in either language alone would hurt more than help.

create or replace function search_content(q text)
returns table (
  kind text,
  slug text,
  title text,
  snippet text,
  rank real
)
language sql
stable
security invoker
set search_path = public
as $$
  with query as (select plainto_tsquery('simple', q) as tsq)
  select * from (
    select
      'guide'::text as kind,
      t.slug,
      t.title_en || ' (' || t.title_de || ')' as title,
      left(g.intro_md, 200) as snippet,
      ts_rank(
        to_tsvector('simple', t.title_en || ' ' || t.title_de || ' ' || g.intro_md),
        (select tsq from query)
      ) as rank
    from guides g join tasks t on t.id = g.task_id
    where g.status = 'published'
      and to_tsvector('simple', t.title_en || ' ' || t.title_de || ' ' || g.intro_md)
          @@ (select tsq from query)
    union all
    select
      'problem', p.slug, p.title_en, left(p.description_md, 200),
      ts_rank(
        to_tsvector('simple', p.title_en || ' ' || p.description_md),
        (select tsq from query)
      )
    from problems p
    where p.status = 'published'
      and to_tsvector('simple', p.title_en || ' ' || p.description_md)
          @@ (select tsq from query)
    union all
    select
      'letter', l.slug, l.title_en || ' (' || l.title_de || ')',
      left(l.what_it_means_md, 200),
      ts_rank(
        to_tsvector('simple', l.title_en || ' ' || l.title_de || ' ' || coalesce(l.sender, '') || ' ' || l.what_it_means_md),
        (select tsq from query)
      )
    from letters l
    where l.status = 'published'
      and to_tsvector('simple', l.title_en || ' ' || l.title_de || ' ' || coalesce(l.sender, '') || ' ' || l.what_it_means_md)
          @@ (select tsq from query)
    union all
    select
      'glossary', gt.slug, gt.term_de || ' — ' || gt.term_en,
      left(gt.definition_md, 200),
      ts_rank(
        to_tsvector('simple', gt.term_de || ' ' || gt.term_en || ' ' || gt.definition_md),
        (select tsq from query)
      )
    from glossary_terms gt
    where gt.status = 'published'
      and to_tsvector('simple', gt.term_de || ' ' || gt.term_en || ' ' || gt.definition_md)
          @@ (select tsq from query)
  ) results
  order by rank desc
  limit 40;
$$;
