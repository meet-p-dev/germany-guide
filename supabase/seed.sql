-- Core reference data + one hand-written vertical slice (Anmeldung, Berlin vs Munich).
-- Idempotent: safe to run repeatedly.

-- ---------------------------------------------------------------- states
insert into states (slug, name_en, name_de, code) values
  ('baden-wuerttemberg', 'Baden-Württemberg', 'Baden-Württemberg', 'BW'),
  ('bavaria', 'Bavaria', 'Bayern', 'BY'),
  ('berlin', 'Berlin', 'Berlin', 'BE'),
  ('brandenburg', 'Brandenburg', 'Brandenburg', 'BB'),
  ('bremen', 'Bremen', 'Bremen', 'HB'),
  ('hamburg', 'Hamburg', 'Hamburg', 'HH'),
  ('hesse', 'Hesse', 'Hessen', 'HE'),
  ('mecklenburg-vorpommern', 'Mecklenburg-Vorpommern', 'Mecklenburg-Vorpommern', 'MV'),
  ('lower-saxony', 'Lower Saxony', 'Niedersachsen', 'NI'),
  ('north-rhine-westphalia', 'North Rhine-Westphalia', 'Nordrhein-Westfalen', 'NW'),
  ('rhineland-palatinate', 'Rhineland-Palatinate', 'Rheinland-Pfalz', 'RP'),
  ('saarland', 'Saarland', 'Saarland', 'SL'),
  ('saxony', 'Saxony', 'Sachsen', 'SN'),
  ('saxony-anhalt', 'Saxony-Anhalt', 'Sachsen-Anhalt', 'ST'),
  ('schleswig-holstein', 'Schleswig-Holstein', 'Schleswig-Holstein', 'SH'),
  ('thuringia', 'Thuringia', 'Thüringen', 'TH')
on conflict (slug) do update set name_en = excluded.name_en, name_de = excluded.name_de, code = excluded.code;

-- ---------------------------------------------------------------- cities
insert into cities (state_id, slug, name_en, name_de, population, is_published, official_portal_url, hero_note) values
  ((select id from states where slug = 'berlin'), 'berlin', 'Berlin', 'Berlin', 3878000, true, 'https://service.berlin.de', 'Appointments are scarce — new slots appear every morning. You can visit any Bürgeramt regardless of your district.'),
  ((select id from states where slug = 'hamburg'), 'hamburg', 'Hamburg', 'Hamburg', 1910000, true, 'https://www.hamburg.de', null),
  ((select id from states where slug = 'bavaria'), 'munich', 'Munich', 'München', 1512000, true, 'https://stadt.muenchen.de', 'Most services run through the KVR (Kreisverwaltungsreferat) on Ruppertstraße.'),
  ((select id from states where slug = 'north-rhine-westphalia'), 'cologne', 'Cologne', 'Köln', 1084000, true, 'https://www.stadt-koeln.de', null),
  ((select id from states where slug = 'hesse'), 'frankfurt', 'Frankfurt am Main', 'Frankfurt am Main', 773000, true, 'https://frankfurt.de', null),
  ((select id from states where slug = 'baden-wuerttemberg'), 'stuttgart', 'Stuttgart', 'Stuttgart', 633000, true, 'https://www.stuttgart.de', null),
  ((select id from states where slug = 'north-rhine-westphalia'), 'duesseldorf', 'Düsseldorf', 'Düsseldorf', 629000, true, 'https://www.duesseldorf.de', null),
  ((select id from states where slug = 'saxony'), 'leipzig', 'Leipzig', 'Leipzig', 616000, true, 'https://www.leipzig.de', null),
  ((select id from states where slug = 'north-rhine-westphalia'), 'dortmund', 'Dortmund', 'Dortmund', 593000, true, 'https://www.dortmund.de', null),
  ((select id from states where slug = 'north-rhine-westphalia'), 'essen', 'Essen', 'Essen', 584000, true, 'https://www.essen.de', null),
  ((select id from states where slug = 'bremen'), 'bremen', 'Bremen', 'Bremen', 569000, true, 'https://www.bremen.de', null),
  ((select id from states where slug = 'saxony'), 'dresden', 'Dresden', 'Dresden', 563000, true, 'https://www.dresden.de', null),
  ((select id from states where slug = 'lower-saxony'), 'hannover', 'Hanover', 'Hannover', 545000, true, 'https://www.hannover.de', null),
  ((select id from states where slug = 'bavaria'), 'nuremberg', 'Nuremberg', 'Nürnberg', 523000, true, 'https://www.nuernberg.de', null),
  ((select id from states where slug = 'north-rhine-westphalia'), 'aachen', 'Aachen', 'Aachen', 252000, true, 'https://www.aachen.de', null)
on conflict (slug) do update set
  state_id = excluded.state_id, name_en = excluded.name_en, name_de = excluded.name_de,
  population = excluded.population, is_published = excluded.is_published,
  official_portal_url = excluded.official_portal_url, hero_note = excluded.hero_note;

-- ---------------------------------------------------------------- categories
insert into task_categories (slug, name_en, sort_order) values
  ('registration', 'Registration', 1),
  ('residence', 'Visa & residence', 2),
  ('money', 'Money & taxes', 3),
  ('health', 'Health insurance', 4),
  ('work', 'Work & qualifications', 5),
  ('daily-life', 'Daily life', 6)
on conflict (slug) do update set name_en = excluded.name_en, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------- tasks
insert into tasks (category_id, slug, title_en, title_de, summary, audience, sort_order) values
  ((select id from task_categories where slug = 'registration'), 'anmeldung', 'City registration', 'Anmeldung', 'Register your address within two weeks of moving in. Almost everything else — tax ID, bank account, residence permit — depends on it.', '{student,worker,refugee,eu,non-eu}', 1),
  ((select id from task_categories where slug = 'residence'), 'residence-permit', 'Residence permit', 'Aufenthaltstitel', 'Apply for or extend your residence permit at the local immigration office (Ausländerbehörde).', '{student,worker,non-eu}', 1),
  ((select id from task_categories where slug = 'residence'), 'visa-conversion', 'Converting an entry visa', 'Visum umwandeln', 'Convert your national entry visa into a full residence permit before it expires.', '{student,worker,non-eu}', 2),
  ((select id from task_categories where slug = 'residence'), 'fiktionsbescheinigung', 'Bridging certificate', 'Fiktionsbescheinigung', 'A temporary certificate that keeps your stay legal while your permit application is being processed.', '{student,worker,non-eu}', 3),
  ((select id from task_categories where slug = 'money'), 'bank-account', 'Opening a bank account', 'Girokonto eröffnen', 'Open a current account (Girokonto) — needed for rent, salary and insurance payments.', '{student,worker,refugee,eu,non-eu}', 1),
  ((select id from task_categories where slug = 'money'), 'blocked-account', 'Blocked account', 'Sperrkonto', 'The blocked account many students and jobseekers need as proof of financial means, and how to access the money.', '{student,non-eu}', 2),
  ((select id from task_categories where slug = 'money'), 'tax-id', 'Tax ID & tax class', 'Steuer-ID & Steuerklasse', 'Your tax identification number arrives automatically after Anmeldung; your tax class decides your monthly net salary.', '{student,worker,eu,non-eu}', 3),
  ((select id from task_categories where slug = 'health'), 'health-insurance', 'Health insurance', 'Krankenversicherung', 'Health insurance is mandatory. Understand public (gesetzlich) vs private (privat) before you sign anything.', '{student,worker,refugee,eu,non-eu}', 1),
  ((select id from task_categories where slug = 'daily-life'), 'rundfunkbeitrag', 'Broadcasting fee', 'Rundfunkbeitrag', 'Every household pays the broadcasting fee (formerly "GEZ") — one payment per flat, not per person.', '{student,worker,refugee,eu,non-eu}', 1),
  ((select id from task_categories where slug = 'daily-life'), 'schufa', 'SCHUFA credit record', 'SCHUFA', 'Germany''s credit score. Landlords ask for it; you can get a free copy once a year.', '{student,worker,eu,non-eu}', 2),
  ((select id from task_categories where slug = 'work'), 'qualification-recognition', 'Recognition of foreign qualifications', 'Anerkennung', 'Get your foreign degree or vocational training officially recognized for the German job market.', '{worker,refugee,non-eu}', 1),
  ((select id from task_categories where slug = 'work'), 'work-permit-change', 'Changing employer', 'Arbeitgeberwechsel', 'What non-EU workers must do before switching jobs — many permits are tied to a specific employer.', '{worker,non-eu}', 2),
  ((select id from task_categories where slug = 'daily-life'), 'driving-license', 'Converting a driving license', 'Führerscheinumschreibung', 'Exchange your foreign driving license for a German one — rules depend on the issuing country.', '{worker,student,eu,non-eu}', 3)
on conflict (slug, locale) do update set
  category_id = excluded.category_id, title_en = excluded.title_en, title_de = excluded.title_de,
  summary = excluded.summary, audience = excluded.audience, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------- glossary (published)
insert into glossary_terms (slug, term_de, term_en, definition_md, status) values
  ('anmeldung', 'Anmeldung', 'Address registration', 'Registering your home address with the city. Legally required within **two weeks** of moving in (§17 BMG). The confirmation (Anmeldebestätigung) is needed for almost every other procedure.', 'published'),
  ('abmeldung', 'Abmeldung', 'Deregistration', 'Deregistering your address when you leave Germany. Only needed when moving abroad — moving within Germany just requires a new Anmeldung.', 'published'),
  ('wohnungsgeberbestaetigung', 'Wohnungsgeberbestätigung', 'Landlord confirmation', 'A form your landlord must sign confirming you moved in. Required for Anmeldung — a rental contract alone is **not** enough. Landlords are legally obliged to provide it (§19 BMG).', 'published'),
  ('buergeramt', 'Bürgeramt', 'Citizens'' office', 'The local office handling registration, ID matters and certificates. Also called Bürgerbüro, Einwohnermeldeamt or KVR depending on the city.', 'published'),
  ('auslaenderbehoerde', 'Ausländerbehörde', 'Immigration office', 'The local authority responsible for residence permits, visa conversions and work permissions. Every city or district has its own, with its own procedures.', 'published'),
  ('aufenthaltstitel', 'Aufenthaltstitel', 'Residence permit', 'The umbrella term for German residence permits: visa, temporary permit (Aufenthaltserlaubnis), Blue Card, permanent settlement permit (Niederlassungserlaubnis) and more.', 'published'),
  ('fiktionsbescheinigung', 'Fiktionsbescheinigung', 'Bridging certificate', 'A certificate confirming your stay is legal while your residence-permit application is pending. Check which paragraph is ticked — it decides whether you may keep working and travelling.', 'published'),
  ('termin', 'Termin', 'Appointment', 'Many German offices only see you with a booked appointment (Terminvereinbarung). Booking portals release new slots at fixed times, often early morning.', 'published'),
  ('steuer-id', 'Steuer-ID', 'Tax ID', 'Your permanent 11-digit tax identification number (steuerliche Identifikationsnummer). Sent by post automatically a few weeks after your first Anmeldung. Your employer needs it.', 'published'),
  ('steuerklasse', 'Steuerklasse', 'Tax class', 'One of six wage-tax categories deciding your monthly deductions. Assigned automatically (class I for singles); married couples can choose combinations. Errors are fixed via the Finanzamt.', 'published'),
  ('finanzamt', 'Finanzamt', 'Tax office', 'The local tax authority: issues tax numbers, processes tax returns and tax-class changes.', 'published'),
  ('krankenkasse', 'Krankenkasse', 'Health insurance fund', 'A public health insurer (e.g. TK, AOK, Barmer). Membership certificates from a Krankenkasse are required by employers and universities.', 'published'),
  ('sperrkonto', 'Sperrkonto', 'Blocked account', 'A special account proving you can support yourself — required for many student and jobseeker visas. Only a fixed amount per month can be withdrawn.', 'published'),
  ('schufa', 'SCHUFA', 'Credit record', 'Germany''s main credit agency. A "SCHUFA-Auskunft" is routinely requested by landlords. One free data copy per year is your legal right.', 'published'),
  ('rundfunkbeitrag', 'Rundfunkbeitrag', 'Broadcasting fee', 'The mandatory public-broadcasting fee (about €18.36/month), paid **once per household** — widely known by its old name "GEZ". Letters come from "ARD ZDF Deutschlandradio Beitragsservice" — they are genuine, not a scam.', 'published'),
  ('mahnung', 'Mahnung', 'Payment reminder', 'A formal payment reminder. Ignoring a Mahnung leads to escalating fees and eventually enforcement — never throw one away unread.', 'published'),
  ('bescheid', 'Bescheid', 'Official decision', 'An official written decision (e.g. Steuerbescheid, Festsetzungsbescheid). Usually includes a deadline (Frist) and instructions for objection (Widerspruch).', 'published'),
  ('beglaubigte-uebersetzung', 'Beglaubigte Übersetzung', 'Certified translation', 'A translation by a sworn translator, required for foreign documents (birth certificates, diplomas). Regular translations are usually not accepted.', 'published'),
  ('apostille', 'Apostille', 'Apostille', 'An international certification making your home-country documents legally valid in Germany. Obtained in the country that issued the document.', 'published'),
  ('anmeldebestaetigung', 'Anmeldebestätigung', 'Registration confirmation', 'The stamped confirmation you receive after Anmeldung. Banks, employers and the immigration office will ask for it — keep it safe and make copies.', 'published'),
  ('niederlassungserlaubnis', 'Niederlassungserlaubnis', 'Permanent settlement permit', 'The permanent residence permit, usually available after several years of temporary residence, secure income and language proficiency.', 'published'),
  ('blaue-karte', 'Blaue Karte EU', 'EU Blue Card', 'A residence permit for university-educated professionals with a job offer above a salary threshold. Offers a faster route to permanent residence.', 'published')
on conflict (slug, locale) do update set
  term_de = excluded.term_de, term_en = excluded.term_en,
  definition_md = excluded.definition_md, status = excluded.status;

-- ---------------------------------------------------------------- Anmeldung guide (published)
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'anmeldung'),
  E'If you move into a home in Germany, you must register your address (**Anmeldung**) at the local citizens'' office (Bürgeramt) within **two weeks** of moving in. This applies to everyone — students, workers, EU and non-EU citizens alike.\n\nThe Anmeldung matters far beyond the registration itself: your tax ID, bank account, health insurance, residence permit and even a mobile-phone contract usually depend on it. Doing it early saves you trouble everywhere else.\n\nRegistration itself is **free of charge**. Late registration can in theory be fined, but offices are usually pragmatic if the delay was caused by appointment scarcity — keep proof that you tried to book in time.',
  E'- **Passport or national ID** (for every person registering)\n- **Wohnungsgeberbestätigung** — the signed landlord confirmation. A rental contract alone is *not* sufficient\n- **Completed registration form** (Anmeldeformular) — available on your city''s website, often in English\n- If applicable: **marriage/birth certificates** (with certified translation) for family members registering with you\n- If applicable: **visa or residence permit**',
  E'You receive the **Anmeldebestätigung** (registration confirmation) on the spot — keep it safe and make copies.\n\nWithin **2–4 weeks**, your **tax ID (Steuer-ID)** arrives automatically by post at the registered address. Your employer needs it.\n\nIf you move again, you register the new address the same way. You only deregister (**Abmeldung**) when leaving Germany entirely.',
  '§17, §19 Bundesmeldegesetz (BMG)',
  'published',
  '[{"url": "https://www.bmi.bund.de/DE/themen/moderne-verwaltung/verwaltungsrecht/meldewesen/meldewesen-node.html", "title": "BMI — Meldewesen", "accessed_at": "2026-07-02"}, {"url": "https://service.berlin.de/dienstleistung/120686/", "title": "Service Berlin — Anmeldung einer Wohnung", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02',
  'hand-written',
  'patelmeet.2905@gmail.com'
)
on conflict (task_id, locale) do update set
  intro_md = excluded.intro_md, documents_md = excluded.documents_md, after_md = excluded.after_md,
  legal_basis = excluded.legal_basis, status = excluded.status, sources = excluded.sources,
  last_verified_at = excluded.last_verified_at;

-- Anmeldung checklist steps
insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g
join tasks t on t.id = g.task_id and t.slug = 'anmeldung',
lateral (values
  (1, 'Get the landlord confirmation (Wohnungsgeberbestätigung)', 'Ask your landlord — or main tenant, if you sublet — to fill in and sign the Wohnungsgeberbestätigung. They are legally required to provide it (§19 BMG). Most city websites offer a downloadable template.', '{Wohnungsgeberbestätigung}'::text[], false),
  (2, 'Fill in the registration form', 'Download the Anmeldeformular from your city''s website and fill it in at home. Some cities provide English versions or online wizards that pre-fill the PDF.', '{Anmeldeformular}'::text[], false),
  (3, 'Book an appointment or plan your visit', 'Whether you need an appointment depends on your city — check the city facts box above. Where appointments are required, new slots are typically released in the morning; check daily.', '{}'::text[], false),
  (4, 'Go to the citizens'' office with your documents', 'Bring your passport (all family members''), the signed Wohnungsgeberbestätigung and the completed form. The appointment itself usually takes 10–15 minutes.', '{Passport,Wohnungsgeberbestätigung,Anmeldeformular}'::text[], false),
  (5, 'Store the Anmeldebestätigung safely', 'You get the registration confirmation immediately, free of charge. Photograph or scan it — banks, employers and the immigration office will ask for it repeatedly.', '{}'::text[], false),
  (6, 'Wait for your tax ID by post', 'Your Steuer-ID arrives automatically within 2–4 weeks at the registered address. If you need it sooner, you can request it at the local Finanzamt in person.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set
  title_en = excluded.title_en, body_md = excluded.body_md,
  doc_names = excluded.doc_names, is_optional = excluded.is_optional;

-- Berlin variant: appointment required
insert into city_task_variants (city_id, task_id, appointment_required, walk_in_possible, online_possible, booking_url, office_name, office_address, office_hours, typical_wait_time, fees_eur, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from cities where slug = 'berlin'),
  (select id from tasks where slug = 'anmeldung'),
  true, false, true,
  'https://service.berlin.de/dienstleistung/120686/',
  'Bürgeramt (any district)',
  'Multiple locations across Berlin',
  'Varies by office; check service.berlin.de',
  '2–6 weeks for an appointment',
  0,
  E'In Berlin you can book at **any Bürgeramt in any district** — pick whichever has the earliest slot.\n\nNew appointments are released **every morning**; refreshing the booking page between 7 and 9 am gives the best chances. Cancellations also free up same-week slots during the day.\n\nBerlin also offers **online registration** for straightforward moves (single household, no special cases) via service.berlin.de — check whether you qualify before hunting for an appointment.',
  'published',
  '[{"url": "https://service.berlin.de/dienstleistung/120686/", "title": "Service Berlin — Anmeldung einer Wohnung", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02',
  'hand-written',
  'patelmeet.2905@gmail.com'
)
on conflict (city_id, task_id, locale) do update set
  appointment_required = excluded.appointment_required, walk_in_possible = excluded.walk_in_possible,
  online_possible = excluded.online_possible, booking_url = excluded.booking_url,
  office_name = excluded.office_name, office_address = excluded.office_address,
  office_hours = excluded.office_hours, typical_wait_time = excluded.typical_wait_time,
  fees_eur = excluded.fees_eur, city_notes_md = excluded.city_notes_md,
  status = excluded.status, sources = excluded.sources, last_verified_at = excluded.last_verified_at;

-- Munich variant: appointment recommended, limited walk-in
insert into city_task_variants (city_id, task_id, appointment_required, walk_in_possible, online_possible, booking_url, office_name, office_address, office_hours, typical_wait_time, fees_eur, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from cities where slug = 'munich'),
  (select id from tasks where slug = 'anmeldung'),
  false, true, false,
  'https://stadt.muenchen.de/buergerservice/terminvereinbarung.html',
  'Bürgerbüro (KVR)',
  'Ruppertstraße 19, 80337 München (main office; several branch offices exist)',
  'Mon–Fri mornings; extended hours on Thursdays — check stadt.muenchen.de',
  'Same day to 2 weeks',
  0,
  E'Munich''s Bürgerbüros accept **walk-ins with a queue ticket**, but daily ticket numbers are limited — arrive early in the morning, especially at the main KVR office.\n\nBooking an appointment online is still the more predictable option and usually possible within days at one of the branch offices (Leonrodstraße, Forstenrieder Allee, Orleansplatz, Riesenfeldstraße).',
  'published',
  '[{"url": "https://stadt.muenchen.de/buergerservice/terminvereinbarung.html", "title": "Stadt München — Terminvereinbarung Bürgerbüro", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02',
  'hand-written',
  'patelmeet.2905@gmail.com'
)
on conflict (city_id, task_id, locale) do update set
  appointment_required = excluded.appointment_required, walk_in_possible = excluded.walk_in_possible,
  online_possible = excluded.online_possible, booking_url = excluded.booking_url,
  office_name = excluded.office_name, office_address = excluded.office_address,
  office_hours = excluded.office_hours, typical_wait_time = excluded.typical_wait_time,
  fees_eur = excluded.fees_eur, city_notes_md = excluded.city_notes_md,
  status = excluded.status, sources = excluded.sources, last_verified_at = excluded.last_verified_at;

-- Step overrides: Berlin replaces the generic step 3; Munich inserts a queue-ticket step.
delete from city_step_overrides where variant_id in (
  select v.id from city_task_variants v
  join tasks t on t.id = v.task_id and t.slug = 'anmeldung'
);

insert into city_step_overrides (variant_id, base_step_id, action, title_en, body_md)
select v.id, s.id, 'replace',
  'Book an appointment online (required)',
  'Berlin requires an appointment for in-person registration. Book at any Bürgeramt city-wide via service.berlin.de — new slots appear every morning. Alternatively, check whether your move qualifies for the fully online registration.'
from city_task_variants v
join cities c on c.id = v.city_id and c.slug = 'berlin'
join tasks t on t.id = v.task_id and t.slug = 'anmeldung'
join guides g on g.task_id = t.id
join checklist_steps s on s.guide_id = g.id and s.step_no = 3;

insert into city_step_overrides (variant_id, base_step_id, action, insert_after_step_no, title_en, body_md)
select v.id, null, 'insert', 3,
  'Or: take a queue ticket for walk-in',
  'If you prefer not to wait for an appointment, go to a Bürgerbüro early in the morning and take a queue ticket (Wartemarke). Daily tickets are limited at the main KVR office — branch offices often have shorter queues.'
from city_task_variants v
join cities c on c.id = v.city_id and c.slug = 'munich'
join tasks t on t.id = v.task_id and t.slug = 'anmeldung';

-- ---------------------------------------------------------------- sample problems (published)
insert into problems (slug, title_en, description_md, category_id, related_task_ids, severity, status, last_verified_at) values
  (
    'no-anmeldung-appointments',
    'No registration appointments available for weeks',
    E'You must register within two weeks of moving in — but the booking portal shows no free appointments for a month or more. This is the single most common frustration for newcomers in big cities, and it blocks everything downstream: tax ID, bank account, residence permit.',
    (select id from task_categories where slug = 'registration'),
    array[(select id from tasks where slug = 'anmeldung')],
    'high', 'published', '2026-07-02'
  ),
  (
    'missing-wohnungsgeberbestaetigung',
    'Landlord won''t provide the Wohnungsgeberbestätigung',
    E'Without the signed landlord confirmation you cannot register — a rental contract is not accepted. The problem is worst in sublets and shared flats (WGs), where the main tenant may not respond or may not want the sublet to be visible.',
    (select id from task_categories where slug = 'registration'),
    array[(select id from tasks where slug = 'anmeldung')],
    'high', 'published', '2026-07-02'
  ),
  (
    'bank-account-chicken-and-egg',
    'Bank wants Anmeldung, landlord wants a bank account',
    E'Many landlords want to see a German bank account (and SCHUFA) before renting to you, while traditional banks want your Anmeldebestätigung before opening an account. Newcomers get stuck in the loop.',
    (select id from task_categories where slug = 'money'),
    array[(select id from tasks where slug = 'bank-account'), (select id from tasks where slug = 'anmeldung')],
    'medium', 'published', '2026-07-02'
  )
on conflict (slug, locale) do update set
  title_en = excluded.title_en, description_md = excluded.description_md,
  category_id = excluded.category_id, related_task_ids = excluded.related_task_ids,
  severity = excluded.severity, status = excluded.status, last_verified_at = excluded.last_verified_at;

-- solutions (delete + reinsert: no natural unique key)
delete from solutions where problem_id in (select id from problems where slug in ('no-anmeldung-appointments', 'missing-wohnungsgeberbestaetigung', 'bank-account-chicken-and-egg'));

insert into solutions (problem_id, city_id, title_en, body_md, effectiveness, sort_order, status) values
  ((select id from problems where slug = 'no-anmeldung-appointments'), null,
   'Check the portal at slot-release time every morning',
   'Most cities release new appointments in the early morning (often 7–9 am). Check daily right after release and also around midday, when same-week cancellations reappear.',
   'official', 1, 'published'),
  ((select id from problems where slug = 'no-anmeldung-appointments'), null,
   'Register late with proof you tried',
   'The two-week deadline is rarely enforced with a fine when the delay is the office''s fault. Keep dated screenshots of the empty booking calendar as proof that you tried in time.',
   'workaround', 2, 'published'),
  ((select id from problems where slug = 'no-anmeldung-appointments'), (select id from cities where slug = 'berlin'),
   'Berlin: book at any district''s Bürgeramt',
   'Berlin lets you register at **any Bürgeramt city-wide** — search all offices, not just your district. Outlying offices (e.g. in Marzahn or Spandau) often have much earlier slots. For simple moves, check the fully online registration first.',
   'official', 0, 'published'),
  ((select id from problems where slug = 'missing-wohnungsgeberbestaetigung'), null,
   'Point to the landlord''s legal duty (§19 BMG)',
   'Landlords are legally obliged to issue the confirmation within two weeks of move-in; refusing can cost them a fine of up to €1,000. A polite written request citing **§19 Bundesmeldegesetz** usually resolves it quickly.',
   'official', 1, 'published'),
  ((select id from problems where slug = 'missing-wohnungsgeberbestaetigung'), null,
   'In a sublet, the main tenant can sign',
   'For sublets, the person letting you live there (the main tenant) is the "Wohnungsgeber" and can sign the form — the owner''s signature is not required as long as the sublet itself is permitted.',
   'official', 2, 'published'),
  ((select id from problems where slug = 'bank-account-chicken-and-egg'), null,
   'Open an account that doesn''t need Anmeldung',
   'Several banks (typically mobile/online banks such as N26, Revolut or bunq) open accounts with just a passport and a foreign or hotel address. Use it to receive salary and pay rent, then switch or add a traditional bank later if you want one.',
   'official', 1, 'published'),
  ((select id from problems where slug = 'bank-account-chicken-and-egg'), null,
   'Ask the bank for an appointment without Steuer-ID',
   'Traditional banks can usually open the account with your passport and rental contract, and accept the tax ID later ("Steuer-ID reiche ich nach"). Ask explicitly — counter staff sometimes ask for more than the bank actually requires.',
   'workaround', 2, 'published');

-- ---------------------------------------------------------------- sample letters (published)
insert into letters (slug, title_de, title_en, sender, what_it_means_md, what_to_do_md, deadline_note, looks_like_md, related_task_id, urgency, status, last_verified_at) values
  (
    'beitragsservice-anmeldung',
    'Rundfunkbeitrag — Anmeldung',
    'Broadcasting fee — registration letter',
    'ARD ZDF Deutschlandradio Beitragsservice',
    E'Shortly after your Anmeldung you will get a letter asking you to register your household for the broadcasting fee (**Rundfunkbeitrag**, ~€18.36/month). This is **genuine and mandatory** — it is not a scam, even though the letter is unsolicited.\n\nThe fee is **per household**, not per person. If a flatmate already pays for your address, you don''t pay again.',
    E'1. If nobody in your household pays yet: fill in the enclosed form or register at rundfunkbeitrag.de.\n2. If a flatmate already pays: reply with their **Beitragsnummer** (account number) to link your name to the existing payment.\n3. Do **not** simply ignore the letter — non-response leads to estimated fee notices and eventually enforcement.',
    'Reply within the period stated in the letter (usually 4 weeks) to avoid estimated back-payments.',
    'White letter, blue logo "ARD ZDF Deutschlandradio", sender "Beitragsservice, 50656 Köln". Contains a pre-filled response form with a Beitragsnummer.',
    (select id from tasks where slug = 'rundfunkbeitrag'),
    'action-needed', 'published', '2026-07-02'
  ),
  (
    'steuer-id-mitteilung',
    'Mitteilung der steuerlichen Identifikationsnummer',
    'Notification of your tax ID',
    'Bundeszentralamt für Steuern',
    E'This letter contains your permanent 11-digit **tax ID (Steuer-ID)**. It arrives automatically 2–4 weeks after your first Anmeldung. You keep this number for life — it never changes, even when you move.',
    E'1. Give the number to your **employer** (otherwise you are taxed at the maximum rate — refundable, but painful).\n2. Give it to your **bank** and **health insurer** when asked.\n3. Store the letter permanently; requesting the number again takes weeks.',
    null,
    'Official letter from "Bundeszentralamt für Steuern", Bonn. The 11-digit number is printed in a highlighted box labeled "Identifikationsnummer".',
    (select id from tasks where slug = 'tax-id'),
    'info', 'published', '2026-07-02'
  )
on conflict (slug, locale) do update set
  title_de = excluded.title_de, title_en = excluded.title_en, sender = excluded.sender,
  what_it_means_md = excluded.what_it_means_md, what_to_do_md = excluded.what_to_do_md,
  deadline_note = excluded.deadline_note, looks_like_md = excluded.looks_like_md,
  related_task_id = excluded.related_task_id, urgency = excluded.urgency,
  status = excluded.status, last_verified_at = excluded.last_verified_at;

-- ================================================================
-- Round 2 (2026-07-02): hand-written guides for the 12 remaining
-- tasks, and Anmeldung city variants for the 13 remaining cities.
-- Same idempotent on-conflict pattern as above.
-- ================================================================

-- residence-permit
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'residence-permit'),
  $$If you are staying in Germany longer than the visa-free period (or your national visa is expiring) for reasons like work, study or family reunion, you need a **residence permit (Aufenthaltstitel)**. This is the umbrella term covering the standard **Aufenthaltserlaubnis** (temporary permit tied to a purpose), the **EU Blue Card** for university-educated professionals, and eventually the **Niederlassungserlaubnis** (permanent settlement permit).

EU/EEA/Swiss citizens generally do not need a residence permit — freedom of movement applies. Everyone else applies at the local **Ausländerbehörde** (immigration office) responsible for their registered address.

Processing typically takes several weeks to a few months depending on the office and purpose. Fees range roughly €50–140 depending on the permit type and duration.$$,
  $$- Valid **passport**
- Biometric passport photo
- Completed application form (from the Ausländerbehörde website)
- Proof of health insurance
- Proof of **financial means** (employment contract, blocked account, scholarship letter, etc. depending on purpose)
- Proof of accommodation — your **Anmeldebestätigung**
- Purpose-specific documents: admission letter (students), employment contract (workers), marriage/birth certificate (family reunion)
- Application fee (paid at the appointment, card or cash depending on office)$$,
  $$If approved, you receive an **eAT (elektronischer Aufenthaltstitel)** — a credit-card-sized biometric card, either issued on the spot or mailed a few weeks later. Keep track of its expiry date; renewal applications should be started **8–12 weeks before expiry**.

After several years of temporary residence (varies by permit type, typically 21–60 months) with secure income, sufficient German and integration requirements, you may become eligible for the **Niederlassungserlaubnis** (permanent settlement permit).$$,
  '§4, §7 Aufenthaltsgesetz (AufenthG)',
  'published',
  '[{"url": "https://www.bamf.de", "title": "Bundesamt für Migration und Flüchtlinge (BAMF)", "accessed_at": "2026-07-02"}, {"url": "https://www.make-it-in-germany.com", "title": "Make it in Germany — official skilled worker portal", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'residence-permit',
lateral (values
  (1, 'Identify which permit type applies to you', 'Work, study, family reunion, self-employment and job-seeking each have different requirements. Check the Ausländerbehörde or make-it-in-germany.com for your specific category.', '{}'::text[], false),
  (2, 'Gather your documents', 'Collect your passport, biometric photo, proof of health insurance, proof of financial means and purpose-specific paperwork.', '{Passport,"Biometric photo"}'::text[], false),
  (3, 'Book an appointment', 'Contact your local Ausländerbehörde — booking systems and wait times vary significantly by city.', '{}'::text[], false),
  (4, 'Attend the appointment and submit your application', 'Bring all originals plus copies. Biometric data (fingerprints, signature) is usually collected at this appointment.', '{}'::text[], false),
  (5, 'Pay the application fee', 'Fees vary by permit type; ask in advance whether card payment is accepted.', '{}'::text[], false),
  (6, 'Collect your eAT card', 'Either handed over on the spot or mailed to your registered address a few weeks later.', '{}'::text[], false)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- visa-conversion
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'visa-conversion'),
  $$If you entered Germany with a national **entry visa (nationales Visum, Kategorie D)** for work, study or family reasons, that visa is itself a temporary residence title — but it usually expires within a few months to a year. Before it runs out, you must apply at your local **Ausländerbehörde** to convert it into a full residence permit for your registered address.

This step is often confused with the visa application itself, but it happens **inside Germany**, after you've moved and completed your Anmeldung — not at a consulate abroad.

Start the process well before your visa expires; appointment availability is the main bottleneck in most cities.$$,
  $$- Passport with the entry visa
- Anmeldebestätigung for your current address
- Proof of health insurance
- Proof of financial means for your purpose (employment contract, blocked account, scholarship)
- Biometric passport photo
- Completed application form$$,
  $$Once approved, your visa sticker is replaced by an **eAT card** valid for your permit's specific duration and purpose. From here on, renewals follow the same process as any other residence permit.$$,
  null,
  'published',
  '[{"url": "https://www.make-it-in-germany.com", "title": "Make it in Germany — official skilled worker portal", "accessed_at": "2026-07-02"}, {"url": "https://www.auswaertiges-amt.de", "title": "Federal Foreign Office — visa information", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'visa-conversion',
lateral (values
  (1, 'Complete your Anmeldung first', 'You need a registered address before applying — see the Anmeldung guide.', '{}'::text[], false),
  (2, 'Check your visa''s expiry date', 'Start the conversion process at least 6-8 weeks before it runs out.', '{}'::text[], false),
  (3, 'Book an appointment at your local Ausländerbehörde', 'This is different from the office that issued your entry visa (a German consulate abroad).', '{}'::text[], false),
  (4, 'Prepare updated documents', 'Some paperwork from your original visa application (e.g. proof of income) may need to be refreshed if it has aged.', '{}'::text[], false),
  (5, 'Attend the appointment and submit the application', 'Fingerprints and a signature are typically collected here if not already on file.', '{}'::text[], false),
  (6, 'Collect your eAT card', 'Either on the spot or mailed a few weeks later.', '{}'::text[], false)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- fiktionsbescheinigung
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'fiktionsbescheinigung'),
  $$If you apply for a residence permit (or its extension) before your current permit or visa expires, but the Ausländerbehörde can't process it immediately, you receive a **Fiktionsbescheinigung** — a bridging certificate confirming your stay remains legal while the application is pending.

It is not a residence permit itself, but a temporary placeholder. What it allows you to do — work, travel, stay — depends entirely on **which paragraph is ticked** on the document (commonly §81 Abs. 3 or Abs. 4 Aufenthaltsgesetz), so always read it carefully or ask the caseworker to explain it.

It is usually issued for free at the same appointment where you submit your permit application or extension request.$$,
  $$- Nothing extra — it is issued automatically as part of your residence-permit application appointment if the office can't decide immediately
- Keep the original safe; you may need to show it to employers, landlords or when re-entering Germany$$,
  $$Continue waiting for your residence-permit decision. If your Fiktionsbescheinigung is about to expire and you haven't heard back, contact the Ausländerbehörde proactively — most offices will extend it rather than let your legal stay lapse through no fault of your own.$$,
  '§81 Aufenthaltsgesetz (AufenthG)',
  'published',
  '[{"url": "https://www.bamf.de", "title": "Bundesamt für Migration und Flüchtlinge (BAMF)", "accessed_at": "2026-07-02"}, {"url": "https://www.bmi.bund.de", "title": "Federal Ministry of the Interior", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'fiktionsbescheinigung',
lateral (values
  (1, 'Receive it automatically at your permit appointment', 'If the office can''t decide on your application the same day, ask explicitly for a Fiktionsbescheinigung before you leave.', '{}'::text[], false),
  (2, 'Check which paragraph is ticked', 'This determines your rights to work and travel while waiting — ask the caseworker if it''s unclear.', '{}'::text[], false),
  (3, 'Show it wherever your usual residence card would be required', 'Employers and landlords generally accept it as proof of legal stay.', '{}'::text[], false),
  (4, 'Watch its expiry date', 'If your application is still pending as it nears expiry, contact the office in advance to get it renewed.', '{}'::text[], false),
  (5, 'Be cautious about international travel', 'Re-entry rules depend on the ticked paragraph and, for non-Schengen travel, may require a separate visa — check before booking flights.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- bank-account
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'bank-account'),
  $$A German current account (**Girokonto**) is needed to receive your salary, pay rent, and set up direct debits for insurance and utilities. EU citizens can generally open one immediately with just a passport; non-EU newcomers sometimes need a registered address first, depending on the bank.

Traditional branch banks (Sparkasse, Volksbank, Deutsche Bank, Commerzbank) usually require an in-person appointment and may ask for your Anmeldebestätigung. **Online/mobile banks** (e.g. N26, Revolut, bunq) can often open an account within minutes using just your passport, sometimes even before you have a German address.

Opening an account is normally free, though some banks charge a monthly account fee.$$,
  $$- Valid passport or EU ID card
- Proof of address — Anmeldebestätigung (required by most traditional banks; some online banks accept a foreign or temporary address)
- Your Steuer-ID, if you already have it (can usually be added later)
- Proof of income or student status, for some account types$$,
  $$You'll receive a debit card (Girocard/Maestro or Visa/Mastercard debit) either immediately or by post within a week or two, along with online banking access. Give your new IBAN to your employer, landlord and health insurer as needed.$$,
  null,
  'published',
  '[{"url": "https://www.verbraucherzentrale.de", "title": "Verbraucherzentrale — consumer protection guidance", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'bank-account',
lateral (values
  (1, 'Decide between a traditional bank and an online bank', 'Online banks are faster and often don''t require Anmeldung; traditional banks may offer better in-person service and cash handling.', '{}'::text[], false),
  (2, 'Gather your documents', 'Passport plus Anmeldebestätigung for traditional banks; often just a passport for online banks.', '{Passport}'::text[], false),
  (3, 'Apply online or book a branch appointment', 'Online banks typically use a video-identification call; branch banks require an in-person visit.', '{}'::text[], false),
  (4, 'Verify your identity', 'Either via video call (Video-Ident) or in person with your passport.', '{}'::text[], false),
  (5, 'Activate your account and card', 'Debit card and PIN usually arrive separately by post for security.', '{}'::text[], false),
  (6, 'Add your Steuer-ID once you receive it', 'Some banks ask for it upfront for tax-reporting purposes; others let you add it later.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- blocked-account
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'blocked-account'),
  $$A **blocked account (Sperrkonto)** is a special savings account used to prove you have enough money to support yourself in Germany — required for many student visas and the job-seeker visa. You transfer a set threshold amount (updated periodically) before applying for your visa, and can only withdraw a fixed monthly amount once you arrive.

Several providers offer blocked accounts to newcomers before they even arrive in Germany, including dedicated services like Expatrio and Fintiba, as well as some traditional banks.

The account is "unblocked" for monthly withdrawals once you've completed your Anmeldung and, for some providers, shown your residence permit.$$,
  $$- Passport
- Admission/enrolment letter (for students) or visa appointment confirmation
- Proof of the transferred blocked-account threshold amount
- Anmeldebestätigung, once available, to activate monthly withdrawals$$,
  $$Once unblocked, you can withdraw the set monthly amount to your regular bank account. If you find you don't need the money (e.g. you get a job or scholarship), some providers allow early release with proof.$$,
  null,
  'published',
  '[{"url": "https://www.daad.de", "title": "DAAD — German Academic Exchange Service", "accessed_at": "2026-07-02"}, {"url": "https://www.auswaertiges-amt.de", "title": "Federal Foreign Office", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'blocked-account',
lateral (values
  (1, 'Choose a blocked-account provider', 'Compare providers before your visa application — some are cheaper or faster to set up than others.', '{}'::text[], false),
  (2, 'Transfer the required threshold amount', 'This changes periodically — confirm the current amount with your provider or the German consulate before transferring.', '{}'::text[], false),
  (3, 'Use the blocked-account confirmation for your visa application', 'The provider issues a confirmation letter to include with your visa or residence-permit paperwork.', '{}'::text[], false),
  (4, 'Complete your Anmeldung after arrival', 'Most providers require this before activating monthly withdrawals.', '{}'::text[], false),
  (5, 'Activate monthly withdrawals', 'Submit your Anmeldebestätigung (and sometimes residence permit) to your provider to start monthly transfers.', '{}'::text[], false)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- tax-id
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'tax-id'),
  $$Your **tax ID (Steuer-ID / steuerliche Identifikationsnummer)** is an 11-digit number that stays with you for life — it doesn't change even if you move or change jobs. It's issued automatically 2-4 weeks after your first Anmeldung and mailed to your registered address.

Your **tax class (Steuerklasse)** is separate — one of six categories determining how much wage tax is withheld from your salary each month. Singles default to Class I; married couples can choose combinations (e.g. III/V or IV/IV) depending on which optimizes their combined take-home pay.

Both are issued and managed by the local **Finanzamt** (tax office).$$,
  $$- Nothing needed to receive your Steuer-ID — it's generated automatically from your Anmeldung
- To change tax class: marriage certificate (if applicable), passport, and the tax-class-change form from your Finanzamt$$,
  $$Give your Steuer-ID to your employer as soon as you receive it — without it, you may be taxed at the maximum rate (refundable later via your annual tax return, but painful in the meantime). If your tax class doesn't reflect your situation (e.g. you married after arriving), overpaid tax is refunded when you file your yearly **Steuererklärung**.$$,
  '§139b Abgabenordnung (AO)',
  'published',
  '[{"url": "https://www.bzst.de", "title": "Bundeszentralamt für Steuern", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'tax-id',
lateral (values
  (1, 'Wait for your Steuer-ID letter', 'Arrives automatically 2-4 weeks after your first Anmeldung.', '{}'::text[], false),
  (2, 'Give the number to your employer', 'Needed for correct payroll tax withholding — provide it as early as possible.', '{}'::text[], false),
  (3, 'Request it in person if it''s urgent and hasn''t arrived', 'Visit your local Finanzamt with your passport and Anmeldebestätigung.', '{}'::text[], true),
  (4, 'Check your assigned tax class on your first payslip', 'Class I is the default for singles; married couples can request a change.', '{}'::text[], false),
  (5, 'File a tax-class change if needed', 'Available at your Finanzamt, e.g. after marriage.', '{}'::text[], true),
  (6, 'File an annual tax return if you overpaid', 'Especially relevant if you were taxed at the maximum rate before your Steuer-ID arrived.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- health-insurance
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'health-insurance'),
  $$Health insurance is **mandatory** for everyone living in Germany, from day one. You choose between **public insurance (gesetzliche Krankenversicherung / GKV)** — income-based contributions, standardized benefits, open to almost everyone — and **private insurance (private Krankenversicherung / PKV)** — risk-based pricing, available mainly to high earners, the self-employed, and civil servants.

Most employees, students and job seekers are best served by public insurance. Private insurance is cheaper when young and healthy but gets significantly more expensive with age, and switching back to public later is often difficult or impossible — think carefully before choosing private, especially as a student.

Major public insurers include TK, AOK, Barmer and DAK — benefits are nearly identical by law; differences are mainly in service and optional extras.$$,
  $$- Passport
- Anmeldebestätigung
- Enrollment letter (students) or employment contract (workers)
- Proof of income, for self-employed applicants$$,
  $$You receive a **Krankenversicherungskarte** (insurance card) by post, and a membership certificate (Mitgliedsbescheinigung) that your employer or university will ask for. Keep the certificate — you'll need to show it repeatedly.$$,
  'SGB V (Sozialgesetzbuch V) — gesetzliche Krankenversicherung',
  'published',
  '[{"url": "https://www.gkv-spitzenverband.de", "title": "GKV-Spitzenverband — umbrella association of public health insurers", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'health-insurance',
lateral (values
  (1, 'Decide between public and private insurance', 'For most students and employees, public insurance is the safer default — get independent advice before choosing private.', '{}'::text[], false),
  (2, 'Choose a public insurer (Krankenkasse) if applicable', 'Benefits are legally standardized; compare service and extras rather than coverage.', '{}'::text[], false),
  (3, 'Register with your chosen Krankenkasse', 'Online or in person, using your passport and Anmeldebestätigung.', '{}'::text[], false),
  (4, 'Give your membership certificate to your employer/university', 'Required before your first paycheck or semester enrollment can be finalized.', '{}'::text[], false),
  (5, 'Collect your insurance card', 'Arrives by post; carry it to all doctor and hospital visits.', '{}'::text[], false)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- rundfunkbeitrag
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'rundfunkbeitrag'),
  $$The **Rundfunkbeitrag** (broadcasting fee, still often called by its old name **GEZ**) funds Germany's public broadcasters. It's mandatory for every household, currently around **€18.36 per month**, and charged **once per address regardless of how many people live there or how many devices they own**.

Shortly after your Anmeldung, you'll likely receive a letter from the **Beitragsservice** (the collection body for ARD, ZDF and Deutschlandradio) asking you to register. This letter is genuine, not a scam, even though it's unsolicited.

If a flatmate at your address already pays, you don't need to register separately — just link your name to their existing account.$$,
  $$- Nothing needed to register — an online form or the reply slip in the letter is enough
- If a flatmate already pays: their **Beitragsnummer** (account number)$$,
  $$Payment is usually collected quarterly by direct debit. If your circumstances change (you move, a household splits up), update your registration at rundfunkbeitrag.de to avoid duplicate charges or gaps.$$,
  'Rundfunkbeitragsstaatsvertrag (RBStV)',
  'published',
  '[{"url": "https://www.rundfunkbeitrag.de", "title": "Beitragsservice — official Rundfunkbeitrag portal", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'rundfunkbeitrag',
lateral (values
  (1, 'Check whether someone at your address already pays', 'Ask flatmates for their Beitragsnummer before registering separately — the fee is per household, not per person.', '{}'::text[], false),
  (2, 'Register if nobody else is paying', 'Use the form in the letter or register directly at rundfunkbeitrag.de.', '{}'::text[], false),
  (3, 'Link to an existing payment if a flatmate already pays', 'Provide their Beitragsnummer instead of creating a new registration.', '{}'::text[], false),
  (4, 'Set up SEPA direct debit', 'The simplest way to avoid missed payments and reminder letters.', '{}'::text[], true),
  (5, 'Apply for an exemption if eligible', 'Low-income students on BAföG, recipients of certain social benefits, and some disabled people can apply for a reduction or exemption.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- schufa
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'schufa'),
  $$**SCHUFA** is Germany's largest credit bureau. It holds a record of your financial reliability — past accounts, loans, and payment history — condensed into a **SCHUFA score**. Landlords routinely ask for a **SCHUFA-Auskunft** (SCHUFA report) as part of a rental application, alongside proof of income.

As a newcomer, you won't have a SCHUFA history yet, which can itself work against you when apartment-hunting — an empty record can look as concerning to some landlords as a bad one.

You are legally entitled to a **free copy of your own data** once a year under GDPR (Datenkopie / Art. 15 DSGVO) — separate from the paid "Bonitätsauskunft" version landlords typically want, which usually costs a small fee.$$,
  $$- Passport or ID for identity verification
- Proof of address, for the paid landlord-facing report$$,
  $$Keep your SCHUFA report or score handy when apartment-hunting — many landlords ask for it upfront. If your score looks empty or low as a newcomer, be ready to offer alternatives.$$,
  'Art. 15 DSGVO (GDPR) — right of access',
  'published',
  '[{"url": "https://www.schufa.de", "title": "SCHUFA Holding AG", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'schufa',
lateral (values
  (1, 'Request your free data copy once a year', 'Available via schufa.de under the Datenkopie / Art. 15 GDPR option — separate from the paid landlord report.', '{}'::text[], false),
  (2, 'Order the paid Bonitätsauskunft if a landlord specifically requests it', 'This is the standard document format most landlords expect.', '{}'::text[], false),
  (3, 'Review the report for errors', 'Incorrect entries can be disputed directly with SCHUFA.', '{}'::text[], false),
  (4, 'Prepare alternatives if your file is too new to show a good score', 'Employer reference letters, proof of income, or a larger deposit within legal limits can substitute.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- qualification-recognition
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'qualification-recognition'),
  $$If you trained or studied outside Germany, you can apply to have your foreign degree or vocational qualification officially **recognized (Anerkennung)** as equivalent to a German one. This matters most for **regulated professions** (doctors, nurses, teachers, engineers in some fields) where practicing legally requires recognition — for most other professions it's optional but can improve your job prospects and salary.

The responsible authority depends on your profession and the federal state; the central **anerkennung-in-deutschland.de** portal helps identify the right one.

Processing typically takes a few months. If your qualification only partially matches, you may receive a **Defizitbescheid** (deficit notice) listing what additional training or exams are needed.$$,
  $$- Your qualification certificate/diploma, with a **certified translation (beglaubigte Übersetzung)**
- Transcripts or module descriptions
- Proof of professional experience, if relevant
- Passport
- Application form for the responsible recognition authority$$,
  $$If fully recognized, you receive an official equivalence certificate you can show to employers. If partially recognized, follow the steps in your Defizitbescheid (further exams, adaptation training) to close the gap — some regions offer grants (Anerkennungszuschuss) to help cover the cost.$$,
  'Berufsqualifikationsfeststellungsgesetz (BQFG)',
  'published',
  '[{"url": "https://www.anerkennung-in-deutschland.de", "title": "Anerkennung in Deutschland — official recognition portal", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'qualification-recognition',
lateral (values
  (1, 'Find the responsible authority for your profession', 'Use anerkennung-in-deutschland.de to identify the right body — it depends on your profession and the German state.', '{}'::text[], false),
  (2, 'Get your documents certified-translated', 'A sworn translator (beglaubigte Übersetzung) is required for foreign-language certificates.', '{}'::text[], false),
  (3, 'Submit your application', 'Include your diploma, transcripts, and any professional experience proof.', '{}'::text[], false),
  (4, 'Wait for the decision', 'Processing usually takes a few months; regulated professions can take longer.', '{}'::text[], false),
  (5, 'Follow up on a Defizitbescheid, if issued', 'Complete the listed additional training or exams to close any gap.', '{}'::text[], true),
  (6, 'Apply for a recognition grant if eligible', 'The Anerkennungszuschuss can help cover fees and translation costs for those on a low income.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- work-permit-change
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'work-permit-change'),
  $$Non-EU workers on a residence permit tied to a specific employer or job (common for skilled-worker and Blue Card permits) generally need approval before **changing employer** during the permit's early period. Depending on your permit type, this can mean formally notifying the Ausländerbehörde, or in some cases needing fresh approval from the Agentur für Arbeit (employment agency).

EU Blue Card holders typically face fewer restrictions after the first two years. Always check your specific permit conditions (printed on the card or the accompanying decision letter) before accepting a new job.

Switching without the required approval can put your residence status at risk, so when in doubt, contact your Ausländerbehörde before resigning from your current role.$$,
  $$- Your current residence permit / eAT card
- New employment contract or job offer letter
- Passport
- Any notification form required by your Ausländerbehörde$$,
  $$Once notified or approved, continue as normal — your new employer will need your Steuer-ID and health insurance details as usual. Keep written confirmation of the approval or notification for your records.$$,
  null,
  'published',
  '[{"url": "https://www.make-it-in-germany.com", "title": "Make it in Germany — official skilled worker portal", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'work-permit-change',
lateral (values
  (1, 'Check your current permit''s conditions', 'Look at the wording on your eAT card or decision letter — some permits are tied to a specific employer or occupation.', '{}'::text[], false),
  (2, 'Contact your Ausländerbehörde before resigning', 'Confirm whether you need approval or just notification for the switch.', '{}'::text[], false),
  (3, 'Notify or apply as required', 'Submit your new employment contract along with any required form.', '{}'::text[], false),
  (4, 'Wait for confirmation if approval is required', 'Do not start the new job before receiving it, if your permit requires prior approval.', '{}'::text[], true),
  (5, 'Update your employer with your existing Steuer-ID and insurance details', 'No new registration needed for these — just inform your new employer.', '{}'::text[], false)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- driving-license
insert into guides (task_id, intro_md, documents_md, after_md, legal_basis, status, sources, last_verified_at, generated_by, reviewed_by)
values (
  (select id from tasks where slug = 'driving-license'),
  $$Whether you can keep driving on your foreign license — and whether you can exchange it for a German one — depends heavily on **which country issued it**. EU/EEA licenses are valid indefinitely in Germany without exchange. Licenses from a growing list of countries with mutual recognition agreements (including the US, in most cases, though rules vary by issuing US state) can be exchanged without a test within **6 months** of establishing residency. Licenses from other countries may require a theory and/or practical driving test.

After the 6-month window (for eligible countries) or without an agreement, your foreign license may no longer be valid to drive in Germany at all — so don't leave the exchange until the last minute.

Exchange happens at your local **Führerscheinstelle** (driving license office), often part of the same building as other city administrative offices.$$,
  $$- Your foreign driving license (original)
- A certified translation, if not already in German/English/French
- Passport
- Anmeldebestätigung
- Biometric passport photo
- Eyesight test certificate (Sehtest) from an optician
- First-aid course certificate (Erste-Hilfe-Kurs), if required for your license class$$,
  $$If your country has a full mutual-recognition agreement, you receive your German license within a few weeks with no test. If a test is required, you'll need to book it through a driving school (Fahrschule), which can take additional weeks to months depending on availability.$$,
  null,
  'published',
  '[{"url": "https://www.kba.de", "title": "Kraftfahrt-Bundesamt (KBA)", "accessed_at": "2026-07-02"}]'::jsonb,
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
) on conflict (task_id, locale) do update set intro_md=excluded.intro_md, documents_md=excluded.documents_md, after_md=excluded.after_md, legal_basis=excluded.legal_basis, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

insert into checklist_steps (guide_id, step_no, title_en, body_md, doc_names, is_optional)
select g.id, s.step_no, s.title_en, s.body_md, s.doc_names, s.is_optional
from guides g join tasks t on t.id = g.task_id and t.slug = 'driving-license',
lateral (values
  (1, 'Check whether your issuing country has an exchange agreement', 'Look up your country''s status — full exchange, partial (theory/practical test required), or no agreement — before your 6-month window runs out.', '{}'::text[], false),
  (2, 'Book a Sehtest (eyesight test)', 'Available at most opticians; a standard requirement for the exchange.', '{}'::text[], false),
  (3, 'Complete a first-aid course, if required', 'Needed for car licenses in most cases — many driving schools and Red Cross chapters offer short courses.', '{}'::text[], false),
  (4, 'Get a certified translation of your license, if needed', 'Not required for licenses already in German, English or French, depending on the office.', '{}'::text[], true),
  (5, 'Submit your application at the Führerscheinstelle', 'Bring all documents plus your original foreign license, which is typically retained.', '{}'::text[], false),
  (6, 'Take a test if required', 'Book through a Fahrschule (driving school) well in advance — availability varies by city.', '{}'::text[], true)
) as s(step_no, title_en, body_md, doc_names, is_optional)
on conflict (guide_id, step_no) do update set title_en=excluded.title_en, body_md=excluded.body_md, doc_names=excluded.doc_names, is_optional=excluded.is_optional;

-- Anmeldung city variants for the 13 remaining cities.
insert into city_task_variants (city_id, task_id, appointment_required, walk_in_possible, online_possible, booking_url, office_name, office_address, office_hours, typical_wait_time, fees_eur, fees_note, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by)
select c.id, (select id from tasks where slug = 'anmeldung'), true, null, null, null,
  'Bürgeramt (citizens'' office)', null, null, null, 0, null, v.notes, 'published',
  jsonb_build_array(jsonb_build_object('url', c.official_portal_url, 'title', c.name_en || ' — official city portal', 'accessed_at', '2026-07-02')),
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
from cities c, lateral (values (
  case c.slug
    when 'hamburg' then 'Hamburg runs Anmeldung through its citizen service centers (Kundenzentren). Book as early as possible via the city''s official portal — like most large German cities, slots can be scarce, and some services may also be available to start online.'
    when 'cologne' then 'Cologne (Köln) has several Bürgerämter across the city — check availability at more than one location if your closest office is fully booked.'
    when 'frankfurt' then 'As a major international hub, Frankfurt''s Bürgerämter see high demand — book as soon as you have a fixed address, ideally the same day you move in.'
    when 'stuttgart' then 'Stuttgart''s Bürgerbüros handle registration — booking early is recommended, especially during peak moving seasons (summer, semester starts).'
    when 'duesseldorf' then 'Düsseldorf''s Bürgerbüros are spread across several districts — checking a less central office can sometimes mean an earlier appointment.'
    when 'leipzig' then 'Leipzig has grown quickly in recent years, so registration appointments can book out — check the city portal regularly for openings.'
    when 'dortmund' then 'Dortmund''s citizen offices (Bürgerdienste) handle Anmeldung — book via the official city portal as soon as you have your Wohnungsgeberbestätigung ready.'
    when 'essen' then 'Essen''s Bürgeramt handles registration for the city — book through the official portal and bring your Wohnungsgeberbestätigung along with your passport.'
    when 'bremen' then 'Bremen''s citizen offices (Bürgerservice) handle Anmeldung — check the city portal for the office nearest your new address.'
    when 'dresden' then 'Dresden''s Bürgerbüros process registration — booking ahead is recommended, particularly around the start of the university semester.'
    when 'hannover' then 'Hannover''s Bürgerämter handle registration across several district offices — check more than one location if your first choice is booked out.'
    when 'nuremberg' then 'Nuremberg''s Bürgeramt handles registration for the city — book via the official portal as early as possible after moving in.'
    when 'aachen' then 'Aachen, close to the Dutch and Belgian borders and home to a large student population, sees steady demand for registration appointments — book as soon as you have your documents ready.'
  end
)) as v(notes)
where c.slug in ('hamburg', 'cologne', 'frankfurt', 'stuttgart', 'duesseldorf', 'leipzig', 'dortmund', 'essen', 'bremen', 'dresden', 'hannover', 'nuremberg', 'aachen')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, walk_in_possible=excluded.walk_in_possible,
  online_possible=excluded.online_possible, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  office_hours=excluded.office_hours, typical_wait_time=excluded.typical_wait_time,
  fees_eur=excluded.fees_eur, fees_note=excluded.fees_note, city_notes_md=excluded.city_notes_md,
  status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

-- ================================================================
-- Round 3 (2026-07-02): problems/solutions directory build-out
-- (17 new), letter helper (6 new), and residence-permit city
-- variants (15). Fact-check pass this round found nothing stale.
-- Same idempotent on-conflict pattern throughout.
-- ================================================================

-- ---- Part A: problems + solutions (17 new) ----
insert into problems (slug, title_en, description_md, category_id, related_task_ids, severity, status, last_verified_at, generated_by) values
  ('auslaenderbehoerde-not-responding',
   'The Ausländerbehörde won''t answer your emails',
   E'You''ve emailed the immigration office (Ausländerbehörde) about your residence permit — maybe several times — and heard nothing back for weeks or months. Meanwhile your visa is ticking down. This silence is one of the most stressful experiences newcomers face, because the office that controls your legal status simply isn''t responding.\n\nThe key thing to understand: as long as you **applied before your permit expired**, your stay usually remains legal while you wait, and you can request a Fiktionsbescheinigung as proof.',
   (select id from task_categories where slug = 'residence'),
   array[(select id from tasks where slug = 'residence-permit'), (select id from tasks where slug = 'fiktionsbescheinigung')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('german-only-forms',
   'Every form and letter is in German only',
   E'German offices overwhelmingly communicate in German — application forms, official letters, even signs at the counter. As a newcomer who doesn''t yet speak the language, this is a constant barrier that makes routine tasks feel impossible and risks you missing something important.',
   (select id from task_categories where slug = 'registration'),
   array[(select id from tasks where slug = 'anmeldung')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('german-only-counter-staff',
   'The official at the counter only speaks German',
   E'You finally got your appointment, but the clerk speaks little or no English and you speak little or no German. The appointment feels like it''s slipping away over a language gap, with an official decision hanging on whether you can communicate.',
   (select id from task_categories where slug = 'registration'),
   array[(select id from tasks where slug = 'anmeldung'), (select id from tasks where slug = 'residence-permit')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('blocked-account-release-delay',
   'The money in your blocked account won''t release',
   E'You have money sitting in your blocked account (Sperrkonto) but can''t access the monthly amount you''re entitled to. This is a serious cash-flow problem when rent and living costs are due and your own funds are locked away.',
   (select id from task_categories where slug = 'money'),
   array[(select id from tasks where slug = 'blocked-account')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('public-vs-private-insurance-trap',
   'Choosing private health insurance you can''t undo',
   E'A private health insurance (PKV) offer looks cheaper than public (GKV) — attractive when you''re young, healthy and counting every euro. But private insurance gets much more expensive with age, and switching back to public is often difficult or outright impossible. Students in particular can get locked out of the public system for the rest of their studies by opting out early.',
   (select id from task_categories where slug = 'health'),
   array[(select id from tasks where slug = 'health-insurance')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('uninsured-backdated-debt',
   'You owe backdated health-insurance contributions',
   E'Health insurance is mandatory in Germany from your first day of residence. If you had a gap — you arrived, got busy, and only signed up later — the public insurer can charge you contributions for the uninsured months. Newcomers are often shocked by a bill for a period when they weren''t even insured.',
   (select id from task_categories where slug = 'health'),
   array[(select id from tasks where slug = 'health-insurance')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('rundfunkbeitrag-confusion',
   'Confusing or scary-looking broadcasting-fee letters',
   E'You keep getting letters from the "Beitragsservice" demanding the broadcasting fee (**Rundfunkbeitrag**), sometimes for a flat where a roommate already pays, or in threatening-looking envelopes that seem like a scam. Many newcomers either panic or ignore them — both are mistakes.',
   (select id from task_categories where slug = 'daily-life'),
   array[(select id from tasks where slug = 'rundfunkbeitrag')],
   'low', 'published', '2026-07-02', 'hand-written'),
  ('wrong-tax-class',
   'You''re on the wrong tax class and losing money each month',
   E'Your monthly net salary looks lower than expected because you''ve been assigned the wrong **tax class (Steuerklasse)** — common after marriage, or when a second job pushes you into Class VI. You''re effectively over-paying tax every month.',
   (select id from task_categories where slug = 'money'),
   array[(select id from tasks where slug = 'tax-id')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('tax-id-never-arrived',
   'Your tax ID never arrived and your employer is taxing you at the max rate',
   E'Your **Steuer-ID** should arrive by post a few weeks after Anmeldung, but it hasn''t — and without it, your employer withholds tax at the highest possible rate. Your first paychecks are painfully small as a result.',
   (select id from task_categories where slug = 'money'),
   array[(select id from tasks where slug = 'tax-id')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('no-schufa-record',
   'Landlords reject you because you have no SCHUFA history',
   E'You''re applying for apartments but keep getting rejected because you have no **SCHUFA** credit record yet. As a newcomer this feels like a catch-22: you can''t build a credit history without living here, and you can''t get a flat without one.',
   (select id from task_categories where slug = 'daily-life'),
   array[(select id from tasks where slug = 'schufa')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('expired-fiktionsbescheinigung',
   'Your Fiktionsbescheinigung expired while you''re still waiting',
   E'Your bridging certificate (**Fiktionsbescheinigung**) has run out but the Ausländerbehörde still hasn''t decided on your residence permit. You''re left unsure whether you''re still legally in the country or allowed to work and travel.',
   (select id from task_categories where slug = 'residence'),
   array[(select id from tasks where slug = 'fiktionsbescheinigung'), (select id from tasks where slug = 'residence-permit')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('slow-qualification-recognition',
   'Your qualification recognition is taking forever',
   E'You applied to have your foreign degree or training **recognized (Anerkennung)**, but months pass with no decision — blocking you from working in a regulated profession or from a better-paid role that requires it.',
   (select id from task_categories where slug = 'work'),
   array[(select id from tasks where slug = 'qualification-recognition')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('appointment-after-visa-expiry',
   'The only appointment is after your visa expires',
   E'You need to extend or convert your residence permit, but the earliest Ausländerbehörde appointment the booking system offers is **after** your current visa runs out. It feels like the office is forcing you into illegality through no fault of your own.',
   (select id from task_categories where slug = 'residence'),
   array[(select id from tasks where slug = 'residence-permit'), (select id from tasks where slug = 'visa-conversion')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('missing-home-country-documents',
   'A required document from your home country is missing or not accepted',
   E'An office asks for a birth certificate, marriage certificate or diploma from your home country — but you don''t have it, or the version you have isn''t accepted because it lacks an apostille or a certified German translation.',
   (select id from task_categories where slug = 'residence'),
   array[(select id from tasks where slug = 'residence-permit'), (select id from tasks where slug = 'qualification-recognition')],
   'medium', 'published', '2026-07-02', 'hand-written'),
  ('missed-official-deadline',
   'You missed a deadline in an official letter',
   E'An official letter had a deadline (Frist) — for an objection, a payment or a document — and you missed it, maybe because the letter arrived late, went to an old address, or you couldn''t read it in time. In Germany, deadlines carry real consequences.',
   (select id from task_categories where slug = 'daily-life'),
   array[]::uuid[],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('scheinanmeldung-risk',
   'Registering at an address where you don''t really live',
   E'You can''t find a flat, so someone offers to let you register (Anmeldung) at their address even though you won''t live there — or a "landlord" offers a paid registration. This is a **Scheinanmeldung** (sham registration), and it is illegal for everyone involved.',
   (select id from task_categories where slug = 'registration'),
   array[(select id from tasks where slug = 'anmeldung')],
   'high', 'published', '2026-07-02', 'hand-written'),
  ('queue-ticket-confusion',
   'Confused by queues and ticket systems even with an appointment',
   E'You arrive at the office and there are multiple queues, a ticket machine with German-only categories, and no clear sign of where someone with an appointment should go. It''s easy to wait in the wrong line and miss your slot.',
   (select id from task_categories where slug = 'registration'),
   array[(select id from tasks where slug = 'anmeldung')],
   'low', 'published', '2026-07-02', 'hand-written')
on conflict (slug, locale) do update set
  title_en=excluded.title_en, description_md=excluded.description_md, category_id=excluded.category_id,
  related_task_ids=excluded.related_task_ids, severity=excluded.severity, status=excluded.status,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by;

delete from solutions where problem_id in (select id from problems where slug in (
  'auslaenderbehoerde-not-responding','german-only-forms','german-only-counter-staff',
  'blocked-account-release-delay','public-vs-private-insurance-trap','uninsured-backdated-debt',
  'rundfunkbeitrag-confusion','wrong-tax-class','tax-id-never-arrived','no-schufa-record',
  'expired-fiktionsbescheinigung','slow-qualification-recognition','appointment-after-visa-expiry',
  'missing-home-country-documents','missed-official-deadline','scheinanmeldung-risk','queue-ticket-confusion'));

insert into solutions (problem_id, city_id, title_en, body_md, effectiveness, sort_order, status) values
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Request a Fiktionsbescheinigung to secure your stay', 'If you applied before your permit expired, your stay is legally bridged. Ask the office in writing for a **Fiktionsbescheinigung** confirming this — it lets you keep living, and usually working, in Germany while you wait.', 'official', 1, 'published'),
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Use the official contact form and go in person', 'Many offices ignore direct emails but track their online contact forms. Failing that, show up at the emergency/walk-in counter (Notfallsprechstunde) with printed proof of your pending application.', 'workaround', 2, 'published'),
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Consider an inaction lawsuit (Untätigkeitsklage) as a last resort', 'After roughly **three months** of silence on a complete application, you can file an Untätigkeitsklage at the administrative court to force a decision. This is a formal legal step — consult a lawyer (Fachanwalt für Migrationsrecht) or a migration advice service (Migrationsberatung) before doing it.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Use the letter helper and translation tools', 'Photograph the letter and use a translation app for a first pass, then check our letter helper for common official documents. For anything with a deadline or legal weight, get a human to confirm your understanding.', 'official', 1, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Ask the office for English-language material', 'Larger cities increasingly offer English versions of common forms and online wizards that pre-fill the German PDF — ask, or check the city portal before assuming there''s only German.', 'workaround', 2, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Get help from a Welcome Center or Migrationsberatung', 'Most cities have a Welcome Center or free migration advice service that will help you read and fill in official paperwork, often in your own language.', 'official', 3, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Bring a German-speaking companion', 'You''re generally allowed to bring a friend to interpret. A German-speaking helper at the counter removes the language barrier entirely.', 'official', 1, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Prepare a phrase sheet and key terms in advance', 'Write out the German words for what you need (e.g. "Ich möchte mich anmelden") and your key details. Even a printed cheat sheet keeps the appointment moving.', 'workaround', 2, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Ask to communicate in writing', 'If speaking fails, ask to write things down ("Können wir das aufschreiben?"). Numbers, dates and addresses are much easier to get right on paper.', 'workaround', 3, 'published'),
  ((select id from problems where slug='blocked-account-release-delay'), null, 'Complete the activation steps your provider requires', 'Most blocked-account providers only release monthly withdrawals once you''ve uploaded your Anmeldebestätigung (and sometimes your residence permit). Check your provider''s dashboard for a pending step.', 'official', 1, 'published'),
  ((select id from problems where slug='blocked-account-release-delay'), null, 'Escalate through the provider''s support channel', 'If activation is complete but the money still isn''t moving, contact support directly and reference your account number — delays are often a stuck verification on their side.', 'workaround', 2, 'published'),
  ((select id from problems where slug='public-vs-private-insurance-trap'), null, 'Default to public insurance unless you''re certain', 'For most students and employees, public insurance (GKV) is the safer choice precisely because you can''t easily reverse a move to private. Only choose private after understanding the long-term cost.', 'official', 1, 'published'),
  ((select id from problems where slug='public-vs-private-insurance-trap'), null, 'Get independent advice before signing a private contract', 'Insurance salespeople earn commission on private policies. Talk to a neutral consumer advice center (Verbraucherzentrale) or your university''s student services before committing.', 'official', 2, 'published'),
  ((select id from problems where slug='uninsured-backdated-debt'), null, 'Register as soon as possible to stop the clock', 'The debt grows for every uninsured month, so sign up now rather than waiting — the sooner you''re insured, the smaller the backdated amount.', 'official', 1, 'published'),
  ((select id from problems where slug='uninsured-backdated-debt'), null, 'Ask the Krankenkasse for a payment plan', 'Public insurers can spread backdated contributions over installments (Ratenzahlung). Explain your situation — they generally prefer a payment plan to an unpaid debt.', 'workaround', 2, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Confirm the letters are genuine — they are', 'Letters from "ARD ZDF Deutschlandradio Beitragsservice" are official, not a scam. The fee (~€18.36/month) is mandatory and charged once per household.', 'official', 1, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Link to a flatmate''s account if someone already pays', 'The fee is per home, not per person. If a roommate already pays, reply with their **Beitragsnummer** to register your name under the existing account instead of paying twice.', 'official', 2, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Apply for an exemption if you''re eligible', 'Students receiving BAföG, and recipients of certain social benefits, can apply for exemption or reduction at rundfunkbeitrag.de — but you must apply, it isn''t automatic.', 'workaround', 3, 'published'),
  ((select id from problems where slug='wrong-tax-class'), null, 'File a tax-class change at the Finanzamt', 'Submit the tax-class-change form (Antrag auf Steuerklassenwechsel) at your local Finanzamt. Married couples can pick the combination that best fits their incomes.', 'official', 1, 'published'),
  ((select id from problems where slug='wrong-tax-class'), null, 'Recover overpaid tax through your annual return', 'Even before the class is corrected, any tax you overpaid comes back when you file your yearly tax return (Steuererklärung) — the class mainly affects monthly cash flow, not your total yearly tax.', 'official', 2, 'published'),
  ((select id from problems where slug='tax-id-never-arrived'), null, 'Request your Steuer-ID in person at the Finanzamt', 'Go to your local Finanzamt with your passport and Anmeldebestätigung — they can look up or reissue your tax ID, often much faster than waiting for the post.', 'official', 1, 'published'),
  ((select id from problems where slug='tax-id-never-arrived'), null, 'Know that the max-rate tax is refundable', 'The extra tax withheld without a Steuer-ID isn''t lost — it comes back once you provide the number, and any remainder via your annual return. Give the number to your employer as soon as you have it.', 'workaround', 2, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Offer alternatives landlords accept', 'A recent proof of income, an employer confirmation letter, a guarantor, or (within legal limits) a larger deposit can reassure a landlord in place of a SCHUFA history.', 'official', 1, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Get your free SCHUFA data copy to show it''s clean', 'Even an empty record, presented proactively with your free yearly Datenkopie (Art. 15 GDPR), shows a landlord you have nothing negative on file.', 'workaround', 2, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Look for newcomer-friendly and temporary housing first', 'Serviced apartments, sublets and student housing often skip the SCHUFA requirement — use one to establish an address and history, then apply for a standard rental later.', 'workaround', 3, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Get it extended immediately', 'Contact the Ausländerbehörde right away to renew the certificate. As long as your original application was filed on time, the office is generally expected to bridge your stay, not let it lapse.', 'official', 1, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Do not travel outside Germany until it''s renewed', 'An expired Fiktionsbescheinigung can make re-entry difficult or impossible. Hold off on international trips until you have a valid document in hand.', 'official', 2, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Seek legal advice if the office is unresponsive', 'If you can''t get an extension and your status is genuinely at risk, a migration lawyer or Migrationsberatung can intervene — don''t let it drift.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Work in non-regulated roles while you wait', 'Recognition is only legally required for regulated professions. For many jobs you can start working immediately and use recognition to move up later.', 'official', 1, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Chase the authority and complete any Defizitbescheid', 'Follow up with the responsible body for a status update; if they issued a deficit notice (Defizitbescheid), completing the listed courses or exams is what unblocks a decision.', 'workaround', 2, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Apply for a recognition grant to cover costs', 'The Anerkennungszuschuss can cover translation and assessment fees for those on a low income, so cost isn''t the thing holding up your application.', 'workaround', 3, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Submit your application in writing before the visa expires', 'What protects your legal stay is a **timely application**, not the appointment date. Send your extension/conversion request by post or the official form before your visa expires, and keep dated proof you did so.', 'official', 1, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Ask for a Fiktionsbescheinigung to bridge the gap', 'Once a timely application is on file, request a Fiktionsbescheinigung — it legally bridges the period between your visa expiring and your appointment.', 'official', 2, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Use the emergency counter if the visa is days away', 'If expiry is imminent and you can''t get through, go to the office''s walk-in/emergency counter with your printed application and explain the timing.', 'workaround', 3, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Get an apostille from the issuing country', 'An **apostille** certifies your document for use in Germany. It''s obtained from the relevant authority in the country that issued the document — often arrangeable remotely or via a relative with power of attorney.', 'official', 1, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Use a sworn translator for a certified translation', 'German offices require a **beglaubigte Übersetzung** (certified translation) by a sworn translator, not a casual one. Courts and the city portal list approved translators.', 'official', 2, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Ask your consulate for help replacing documents', 'Your home country''s embassy or consulate in Germany can often reissue civil documents or point you to the right procedure.', 'workaround', 3, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Act immediately — contact the office the same day', 'Deadlines can sometimes still be salvaged if you respond at once. Call or write explaining why you missed it and asking what''s still possible.', 'official', 1, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Apply for reinstatement (Wiedereinsetzung) if it wasn''t your fault', 'If you missed a deadline for a reason genuinely beyond your control (e.g. the letter arrived late), German law allows a **Wiedereinsetzung in den vorigen Stand** — a request to be put back in position as if you hadn''t missed it. This is a formal legal remedy with strict timing, so get advice from a lawyer or advice center before relying on it.', 'last-resort', 2, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Keep your registered address current to prevent recurrence', 'Many missed deadlines trace back to letters going to an old address. Always update your Anmeldung when you move so official post reaches you.', 'official', 3, 'published'),
  ((select id from problems where slug='scheinanmeldung-risk'), null, 'Don''t do it — the penalties are serious', 'A Scheinanmeldung is an offence for both the person registering and the address provider, punishable by fines up to €50,000, and it can jeopardise your residence status. It is never worth the risk.', 'official', 1, 'published'),
  ((select id from problems where slug='scheinanmeldung-risk'), null, 'Register a genuine temporary address instead', 'If you''re between flats, register where you actually sleep — a sublet, a room in a shared flat, or (where the operator allows registration) longer-term accommodation. The landlord/main tenant signs a real Wohnungsgeberbestätigung.', 'official', 2, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Check your appointment confirmation for the counter/room', 'Appointment confirmations usually state a waiting area, room or counter number. Follow that rather than joining a general queue.', 'official', 1, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Show your confirmation to staff on arrival', 'If in doubt, show your printed or on-screen appointment confirmation to any staff member or at reception — they''ll direct you to the right place, and having an appointment usually skips the walk-in queue.', 'workaround', 2, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Arrive 10–15 minutes early', 'Getting there a little early gives you time to find the right ticket category or queue without the stress of your slot ticking away.', 'workaround', 3, 'published');

-- ---- Part B: letter helper (6 new) ----
insert into letters (slug, title_de, title_en, sender, what_it_means_md, what_to_do_md, deadline_note, looks_like_md, related_task_id, urgency, status, last_verified_at, generated_by) values
  ('rundfunkbeitrag-festsetzungsbescheid', 'Festsetzungsbescheid (Rundfunkbeitrag)', 'Broadcasting-fee assessment notice', 'ARD ZDF Deutschlandradio Beitragsservice',
   E'This is a formal notice that the Beitragsservice has **assessed unpaid broadcasting fees** against you — usually because an earlier registration or payment request went unanswered. Unlike the first friendly letter, a Festsetzungsbescheid is an official administrative act with legal force, and the amount can grow with late fees (Säumniszuschlag) if ignored.\n\nIt is genuine and enforceable — the Beitragsservice can ultimately have the debt collected through the courts.',
   E'1. Check whether the fee actually applies to you — if a flatmate already pays for your household, you may not owe it (respond with their **Beitragsnummer**).\n2. If you do owe it, pay the stated amount or set up a payment plan.\n3. If you believe it''s wrong, file a written objection (**Widerspruch**) within the deadline stated on the notice.\n4. Do not ignore it — non-payment leads to enforcement (Vollstreckung).',
   'The objection deadline (Widerspruchsfrist) is stated on the notice — usually one month from delivery.',
   'Formal letter headed "Festsetzungsbescheid", from "ARD ZDF Deutschlandradio Beitragsservice, 50656 Köln", showing an assessed amount and a Beitragsnummer.',
   (select id from tasks where slug = 'rundfunkbeitrag'), 'urgent', 'published', '2026-07-02', 'hand-written'),
  ('krankenkasse-beitragsbescheid', 'Mitgliedsbescheinigung / Beitragsbescheid', 'Health-insurance membership & contribution notice', 'Your Krankenkasse (e.g. TK, AOK, Barmer)',
   E'This letter from your public health insurer either confirms your **membership (Mitgliedsbescheinigung)** or states your **monthly contribution (Beitragsbescheid)**. The membership confirmation is the document your employer or university needs as proof you''re insured; the contribution notice tells you how much you pay and why.\n\nIt is routine, not a problem — but the membership certificate is important to keep.',
   E'1. If it''s a Mitgliedsbescheinigung, forward a copy to your employer or university — they usually require it.\n2. If it''s a Beitragsbescheid, check the contribution amount matches your income and status (students and low earners pay reduced rates).\n3. Keep the letter with your important documents.',
   null, 'Letter on your Krankenkasse''s letterhead (TK, AOK, Barmer, DAK, etc.), referencing your Versichertennummer (insurance number).',
   (select id from tasks where slug = 'health-insurance'), 'info', 'published', '2026-07-02', 'hand-written'),
  ('auslaenderbehoerde-document-request', 'Aufforderung zur Vorlage von Unterlagen', 'Ausländerbehörde document request', 'Ausländerbehörde (local immigration office)',
   E'The immigration office is **asking you to submit additional documents** for your residence-permit application, or inviting you to an appointment. This is a normal part of processing — but it usually comes with a deadline, and not responding can stall or endanger your application.',
   E'1. Read carefully which documents are requested (a translation app or our letter helper can help).\n2. Gather them — common requests are proof of income, health insurance, or a valid passport.\n3. Submit them by the stated method (post, email or in person) before the deadline.\n4. If you can''t get a document in time, contact the office in writing to explain and ask for an extension.',
   'A response deadline (Frist) is almost always stated — missing it can lead to your application being rejected.',
   'Official letter from your city''s Ausländerbehörde, referencing your case number (Aktenzeichen) and listing requested documents (Unterlagen).',
   (select id from tasks where slug = 'residence-permit'), 'action-needed', 'published', '2026-07-02', 'hand-written'),
  ('anmeldebestaetigung', 'Anmeldebestätigung / Meldebescheinigung', 'Registration confirmation', 'Bürgeramt (citizens'' office)',
   E'This is the **confirmation that you registered your address (Anmeldung)** — the single most-requested document for newcomers. Banks, employers, the immigration office and mobile providers all ask for it. It is not a bill or a demand; it''s proof, and you should guard it.',
   E'1. Check that your name and address are spelled correctly.\n2. Make several photocopies or scans — you''ll be asked for it repeatedly.\n3. Store the original safely; if you lose it, you can request a new **Meldebescheinigung** from the Bürgeramt (usually for a small fee).',
   null, 'A stamped sheet from the Bürgeramt/Bürgerbüro headed "Anmeldebestätigung" or "Meldebescheinigung", showing your name and registered address.',
   (select id from tasks where slug = 'anmeldung'), 'info', 'published', '2026-07-02', 'hand-written'),
  ('finanzamt-steuernummer', 'Mitteilung der Steuernummer', 'Tax number notice (for freelancers/self-employed)', 'Finanzamt (local tax office)',
   E'This letter assigns you a **Steuernummer** — different from your lifelong Steuer-ID. The Steuernummer is issued by your local Finanzamt when you register a freelance or self-employed activity, and you put it on the invoices you send to clients. If you''re only an employee, you generally don''t need one.',
   E'1. Note the Steuernummer and use it on your invoices (Rechnungen).\n2. Keep it separate in your mind from your Steuer-ID (the 11-digit lifelong number) — both exist and are used for different things.\n3. Store the letter; you''ll reference the number in your tax filings.',
   null, 'Letter from your local Finanzamt assigning a "Steuernummer" (format varies by state), often following your Fragebogen zur steuerlichen Erfassung (tax registration questionnaire).',
   (select id from tasks where slug = 'tax-id'), 'info', 'published', '2026-07-02', 'hand-written'),
  ('mahnung', 'Mahnung', 'Payment reminder', 'Any company or public authority',
   E'A **Mahnung** is a formal reminder that a payment is overdue. German dunning follows predictable stages: a friendly reminder (Zahlungserinnerung), then one or more Mahnungen with added fees (Mahngebühren), and eventually escalation to a debt collector (Inkasso) or a court dunning order (Mahnbescheid). Ignoring a Mahnung is what turns a small bill into a serious problem — never throw one away unread.',
   E'1. Identify what the claim is for and whether it''s actually valid.\n2. If it''s correct, pay the amount (including any fees) before the new deadline.\n3. If it''s wrong or you don''t recognise it, dispute it in writing (Widerspruch) and keep a copy — do not just ignore it.\n4. If you receive a court **Mahnbescheid** (yellow form), you must object within the stated period or it becomes legally enforceable.',
   'Each Mahnung sets a new payment deadline; a court Mahnbescheid has a strict objection window (usually two weeks).',
   'A letter headed "Mahnung", "Zahlungserinnerung" or (for the court version) "Mahnbescheid" on a distinctive yellow form, stating an overdue amount and a new deadline.',
   null, 'urgent', 'published', '2026-07-02', 'hand-written')
on conflict (slug, locale) do update set
  title_de=excluded.title_de, title_en=excluded.title_en, sender=excluded.sender,
  what_it_means_md=excluded.what_it_means_md, what_to_do_md=excluded.what_to_do_md,
  deadline_note=excluded.deadline_note, looks_like_md=excluded.looks_like_md,
  related_task_id=excluded.related_task_id, urgency=excluded.urgency,
  status=excluded.status, last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by;

-- ---- Part C: residence-permit city variants (15 cities) ----
insert into city_task_variants (city_id, task_id, appointment_required, walk_in_possible, online_possible, booking_url, office_name, office_address, office_hours, typical_wait_time, fees_eur, fees_note, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by)
select c.id, (select id from tasks where slug = 'residence-permit'),
  true, false, null, null,
  'Ausländerbehörde (immigration office)', null, null, null,
  null, 'Roughly €50–140 depending on permit type and duration',
  v.notes, 'published',
  jsonb_build_array(jsonb_build_object('url', c.official_portal_url, 'title', c.name_en || ' — official city portal', 'accessed_at', '2026-07-02')),
  '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'
from cities c, lateral (values (
  case c.slug
    when 'berlin' then 'Berlin''s immigration matters are handled by the **Landesamt für Einwanderung (LEA)**. Demand is very high — apply well before your current permit expires and use the online appointment system; if no slot is available in time, submit your application in writing to preserve your legal stay.'
    when 'hamburg' then 'Hamburg''s residence permits are handled by the Einwohner-Zentralamt / Ausländerabteilung. Book early and, if you can''t get an appointment before your permit expires, file your application in writing on time to keep your stay legal.'
    when 'munich' then 'In Munich the **KVR (Kreisverwaltungsreferat)** Ausländerbehörde handles residence permits, alongside its Bürgerbüro services on Ruppertstraße. Appointment demand is high — apply as early as possible.'
    when 'cologne' then 'Cologne''s Ausländeramt handles residence permits — appointment waits can be long, so start the extension or conversion process well ahead of your permit''s expiry.'
    when 'frankfurt' then 'As a major international city, Frankfurt''s Ausländerbehörde is under heavy demand. Apply early; where appointments run past your visa expiry, submit in writing beforehand to bridge your stay.'
    when 'stuttgart' then 'Stuttgart''s Ausländerbehörde handles residence permits for the city — book your appointment as early as possible and prepare your documents in advance to avoid a second visit.'
    when 'duesseldorf' then 'Düsseldorf''s Ausländerbehörde processes residence permits — start early, as appointment availability varies with demand.'
    when 'leipzig' then 'Leipzig''s Ausländerbehörde handles residence permits. With the city''s growing international population, book ahead and apply in good time before your permit expires.'
    when 'dortmund' then 'Dortmund''s Ausländerbehörde handles residence permits — book via the city''s official channels and prepare your documents before the appointment.'
    when 'essen' then 'Essen''s Ausländerbehörde processes residence permits for the city — apply early and bring complete documentation to your appointment.'
    when 'bremen' then 'Bremen''s Migrationsamt handles residence permits — book ahead and, if an appointment isn''t available before your permit expires, apply in writing on time.'
    when 'dresden' then 'Dresden''s Ausländerbehörde handles residence permits — appointment demand rises around semester starts, so book early.'
    when 'hannover' then 'In the Hannover region, residence permits are handled by the regional immigration authority — apply well ahead of expiry and prepare documents in advance.'
    when 'nuremberg' then 'Nuremberg''s Ausländerbehörde handles residence permits for the city — book early and bring complete documentation.'
    when 'aachen' then 'Aachen''s Ausländerbehörde handles residence permits. With a large international student population, appointment demand is steady — apply in good time before your permit expires.'
  end
)) as v(notes)
where c.slug in ('berlin','hamburg','munich','cologne','frankfurt','stuttgart','duesseldorf','leipzig','dortmund','essen','bremen','dresden','hannover','nuremberg','aachen')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, walk_in_possible=excluded.walk_in_possible,
  online_possible=excluded.online_possible, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  office_hours=excluded.office_hours, typical_wait_time=excluded.typical_wait_time,
  fees_eur=excluded.fees_eur, fees_note=excluded.fees_note, city_notes_md=excluded.city_notes_md,
  status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at;

-- ================================================================
-- Round 5 (2026-07-02): partner offers — affiliate providers +
-- own-app cross-promo, shown as "Recommended services" on task pages.
-- Affiliates published with real homepages (swap in tracking/affiliate
-- URLs later); own apps kept 'draft' (hidden) until real URLs exist.
-- ================================================================
insert into partner_offers (slug, kind, task_slugs, name, blurb_md, cta_label, url, sort_order, status) values
  ('expatrio', 'affiliate', '{blocked-account}', 'Expatrio', 'Blocked account + health insurance bundle for your student visa — fast online setup before you arrive.', 'Learn more', 'https://www.expatrio.com', 0, 'published'),
  ('fintiba', 'affiliate', '{blocked-account}', 'Fintiba', 'Popular blocked account (Sperrkonto) with quick digital verification, accepted by German consulates.', 'Learn more', 'https://www.fintiba.com', 1, 'published'),
  ('wise', 'affiliate', '{blocked-account,bank-account}', 'Wise', 'Send money across borders at the real exchange rate — handy for funding your account from home.', 'Learn more', 'https://wise.com', 2, 'published'),
  ('feather', 'affiliate', '{health-insurance}', 'Feather', 'English-speaking expat health insurance (public & private) with a simple online sign-up.', 'Learn more', 'https://feather-insurance.com', 0, 'published'),
  ('ottonova', 'affiliate', '{health-insurance}', 'ottonova', 'Fully digital private health insurance with an English app — good for higher earners and freelancers.', 'Learn more', 'https://www.ottonova.de', 1, 'published'),
  ('n26', 'affiliate', '{bank-account}', 'N26', 'App-based German bank account you can often open with just your passport, before Anmeldung.', 'Learn more', 'https://n26.com', 0, 'published'),
  ('moneytracker', 'own_app', '{bank-account,blocked-account,tax-id,health-insurance}', 'MoneyTracker', 'Track your spending and stay on budget while settling into a new country.', 'Get the app', '#', 10, 'draft'),
  ('heimat', 'own_app', '{anmeldung}', 'Heimat', 'Split rent and shared-flat expenses easily with your flatmates.', 'Get the app', '#', 10, 'draft')
on conflict (slug, locale) do update set
  kind=excluded.kind, task_slugs=excluded.task_slugs, name=excluded.name, blurb_md=excluded.blurb_md,
  cta_label=excluded.cta_label, url=excluded.url, sort_order=excluded.sort_order, status=excluded.status;

-- ================================================================
-- Round 6 (2026-07-02): fill previously-null city_task_variants
-- facts (booking URL, address, hours, wait time) with real,
-- web-verified data for all 30 rows (15 cities × anmeldung +
-- residence-permit). Fields with no confident source stay null —
-- several cities are genuinely decentralized across district
-- offices, so no single address is picked arbitrarily. This is an
-- UPDATE-only pass; the base rows already exist from Rounds 2–3.
-- ================================================================

-- ---- Anmeldung: Hamburg, Cologne, Frankfurt, Stuttgart ----
update city_task_variants v set
  booking_url = 'https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin',
  office_hours = 'Varies by location — main Hamburg Service centers typically Mon–Fri 07:00–19:00',
  city_notes_md = 'Hamburg runs Anmeldung through its citizen service centers (Hamburg Service, formerly Kundenzentren). Book online via the HamburgService portal, or call 115. As in most large German cities, slots can be scarce — book as early as possible via the city''s official portal.',
  sources = '[{"url": "https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin", "title": "HamburgService — online appointment booking", "accessed_at": "2026-07-02"}, {"url": "https://www.hamburg.de/service/suche/termin/", "title": "hamburg.de — service search", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'hamburg' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://terminator.koeln/',
  walk_in_possible = true,
  office_hours = 'Mon & Wed: walk-in possible (expect queues); Tue, Thu, Fri: appointment required',
  typical_wait_time = 'Often several weeks — book as early as possible and check terminator.koeln daily for newly released slots',
  city_notes_md = 'Cologne (Köln) has several Kundenzentren (Bürgerämter) across the city, bookable via terminator.koeln. Unusually, Monday and Wednesday allow walk-in visits (with wait), while Tuesday/Thursday/Friday require a booked appointment — check availability at more than one district office if your closest one is booked out.',
  sources = '[{"url": "https://www.stadt-koeln.de/artikel/06415/index.html", "title": "Stadt Köln — Terminvereinbarung online", "accessed_at": "2026-07-02"}, {"url": "https://terminator.koeln/", "title": "terminator.koeln — official Cologne appointment portal", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'cologne' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen',
  walk_in_possible = true,
  office_hours = 'Mon & Wed: walk-in possible; Tue, Thu, Fri: appointment required',
  typical_wait_time = 'New slots release each weekday at 06:00, two weeks ahead — check the portal in the morning, or set a Terminwunsch alert for automatic email notification',
  city_notes_md = 'As a major international city, Frankfurt''s Bürgerämter see high demand. Monday and Wednesday allow walk-in visits; Tuesday/Thursday/Friday require an appointment. New slots open two weeks in advance each weekday morning — the booking system also lets you leave a standing "Terminwunsch" that emails you when a matching slot appears.',
  sources = '[{"url": "https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen", "title": "Frankfurt.de — Online-Terminvereinbarungen", "accessed_at": "2026-07-02"}, {"url": "https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/buergeramt-statistik-und-wahlen/buergeraemter/terminservice", "title": "Frankfurt.de — Bürgerämter Terminservice", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'frankfurt' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42',
  city_notes_md = 'Stuttgart''s Bürgerbüros (11 locations: Mitte, Vaihingen, West, Ost, Süd, Zuffenhausen, Sillenbuch, Plieningen, Bad Cannstatt, Weilimdorf, plus one for newcomers/training) share a single citywide online booking system — book via service.stuttgart.de and pick whichever location has the earliest slot. Opening hours vary by district office.',
  sources = '[{"url": "https://www.stuttgart.de/en/service/buergerbueros", "title": "Stuttgart.de — Citizens'' Bureaus", "accessed_at": "2026-07-02"}, {"url": "https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42", "title": "Stuttgart — Terminservice", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'stuttgart' and t.slug = 'anmeldung';

-- ---- Anmeldung: Düsseldorf, Leipzig, Dortmund, Essen ----
update city_task_variants v set
  booking_url = 'https://termine.duesseldorf.de/',
  city_notes_md = 'Düsseldorf''s Bürgerbüros only see visitors by appointment, bookable via termine.duesseldorf.de or service.duesseldorf.de. All offices offer extended hours on Wednesday afternoons (until 18:00). Try a less central district office if your closest one is fully booked.',
  sources = '[{"url": "https://termine.duesseldorf.de/", "title": "Terminvereinbarung Stadt Düsseldorf", "accessed_at": "2026-07-02"}, {"url": "https://www.duesseldorf.de/einwohnerangelegenheiten", "title": "Landeshauptstadt Düsseldorf — Einwohnermeldeamt", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'duesseldorf' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/aemtertermine-online/',
  appointment_required = false,
  walk_in_possible = true,
  typical_wait_time = 'Walk-in is possible during opening hours (since Nov 2023) — check current wait times online. If you prefer an appointment, new slots release daily at 17:00, two weeks ahead.',
  city_notes_md = 'Leipzig has grown quickly in recent years — good news is that since 1 November 2023 you can walk into any of its 15 Bürgerbüros during opening hours without an appointment (check live wait times on the city site first). Appointments are also available if you''d rather book ahead.',
  sources = '[{"url": "https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/aemtertermine-online/", "title": "Stadt Leipzig — Ämtertermine online", "accessed_at": "2026-07-02"}, {"url": "https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/buergerbueros/", "title": "Stadt Leipzig — Bürgerbüros", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'leipzig' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://www.dortmund.de/rathaus/verwaltung/buergerdienste/terminvereinbarungen/',
  office_name = 'Dienstleistungszentrum Innenstadt (Bürgerdienste)',
  office_address = 'Südwall 2–4, 44137 Dortmund',
  office_hours = 'Mon 07:00–16:00, Tue 07:00–16:00, Wed 07:00–12:00, Thu 07:00–18:00, Fri 07:00–12:00 (district offices open slightly later, from 08:00)',
  typical_wait_time = 'Slots release daily at 07:00 for same-day, +7 days and +14 days — often bookable within 1–2 weeks',
  city_notes_md = 'Dortmund''s Bürgerdienste (citizen services) handle registration at the central Dienstleistungszentrum Innenstadt or a district office (Bezirksverwaltungsstelle). Appointments are required — book online or call (0231) 50-1 11 50.',
  sources = '[{"url": "https://www.dortmund.de/rathaus/verwaltung/buergerdienste/terminvereinbarungen/", "title": "Stadt Dortmund — Terminvereinbarungen", "accessed_at": "2026-07-02"}, {"url": "https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/buergerdienste/downloads/oeffnungszeiten_buergerdienste.pdf", "title": "Stadt Dortmund — Öffnungszeiten der Bürgerdienste", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'dortmund' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://www.essen.de/rathaus/onlinetermine_der_stadtessen.de.html',
  typical_wait_time = 'A base allotment of slots opens 6 weeks ahead, with extra capacity released 1 week ahead and same-day each morning before office hours',
  city_notes_md = 'Essen''s Bürgerämter (including Gildehof, Steele, Kupferdreh, Kettwig) only see visitors by appointment — book online via the city''s service portal or call +49 201 88 33 222. If nothing''s available weeks out, check again the same morning for released same-day slots.',
  sources = '[{"url": "https://www.essen.de/rathaus/onlinetermine_der_stadtessen.de.html", "title": "Stadt Essen — Online-Termine", "accessed_at": "2026-07-02"}, {"url": "https://www.essen.de/buergeraemter", "title": "Serviceportal Stadt Essen — Bürgeramt", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'essen' and t.slug = 'anmeldung';

-- ---- Anmeldung: Bremen, Dresden, Hannover, Nuremberg, Aachen ----
update city_task_variants v set
  booking_url = 'https://www.service.bremen.de/terminbuchung-1469',
  office_name = 'BürgerServiceCenter-Mitte',
  office_hours = 'Mon & Thu 07:30–17:00, Tue & Fri 07:30–12:00, Wed 07:30–13:00 (varies at other BürgerServiceCenter locations)',
  city_notes_md = 'Bremen''s BürgerServiceCenters (Mitte, Nord and others) only see visitors by appointment — book via service.bremen.de or call 115 / 0421-361 0.',
  sources = '[{"url": "https://www.service.bremen.de/terminbuchung-1469", "title": "Serviceportal Bremen — Terminbuchung", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'bremen' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://termine-buergerbuero.dresden.de/',
  walk_in_possible = true,
  office_hours = 'Tue & Thu 13:00–16:00: walk-in possible at most Bürgerbüros (expect a wait) — otherwise by appointment',
  typical_wait_time = 'Book ahead via the online portal, or walk in Tuesday/Thursday afternoon if urgent',
  city_notes_md = 'Dresden''s Bürgerbüros (Altstadt, Blasewitz, Cotta, Klotzsche, Leuben, Neustadt, Pieschen, Plauen, Prohlis and others) mostly require an appointment, but allow walk-ins Tuesday and Thursday 13:00–16:00 if you can''t book ahead — expect longer waits. Some matters can also be handled online or via video appointment.',
  sources = '[{"url": "https://www.dresden.de/de/rathaus/dienstleistungen/Terminvereinbarung_Buergerbueros.php", "title": "Landeshauptstadt Dresden — Terminvereinbarung in Bürgerbüros", "accessed_at": "2026-07-02"}, {"url": "https://termine-buergerbuero.dresden.de/", "title": "Dresden — Bürgerbüro appointment booking", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'dresden' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://serviceportal.hannover-stadt.de/buergerservice/online/angebot/buergeramt-termin-buchen-900000037-30810.html',
  walk_in_possible = true,
  typical_wait_time = 'New online slots release daily around 08:00. Walk-in possible Thursdays 08:00–13:00 & 14:00–18:00 at the Aegi, Bemerode, Herrenhausen, Linden and Podbi-Park offices only (not at Döhren, Ricklingen, Sahlkamp or Schützenplatz).',
  city_notes_md = 'Hannover''s Bürgerämter handle registration city-wide — you can visit any office regardless of which district you live in. A useful protection: for deadline-bound matters like Anmeldung, your booked appointment confirmation itself counts as proof you met the legal deadline, even if the appointment date is later.',
  sources = '[{"url": "https://www.hannover.de/Leben-in-der-Region-Hannover/B%C3%BCrger-Service/B%C3%BCrger-Service-in-der-Landeshauptstadt-Hannover/Termine-bei-Beh%C3%B6rden-buchen/Terminvereinbarung-in-den-B%C3%BCrger%C3%A4mtern", "title": "Hannover.de — Terminvereinbarung in den Bürgerämtern", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'hannover' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://nuernberg.termine-reservieren.de/',
  walk_in_possible = true,
  office_name = 'Bürgeramt Mitte',
  office_address = 'Äußere Laufer Gasse 25, Nürnberg',
  office_hours = 'Wed 08:00–12:00: walk-in for urgent cases only (Bürgeramt Mitte); otherwise by appointment',
  typical_wait_time = 'Slots for the next 14 days release daily at 06:30, with extra same-day slots released around 08:00',
  city_notes_md = 'Nuremberg''s Bürgerämter require an appointment, bookable online or by calling 0911 231-0. For urgent cases without a booked slot, Bürgeramt Mitte allows walk-ins Wednesday mornings only.',
  sources = '[{"url": "https://nuernberg.termine-reservieren.de/", "title": "Terminvereinbarung Stadt Nürnberg", "accessed_at": "2026-07-02"}, {"url": "https://www.nuernberg.de/internet/buergeramt_mitte/termine.html", "title": "Nürnberg.de — Bürgeramt Mitte Termine", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'nuremberg' and t.slug = 'anmeldung';

update city_task_variants v set
  booking_url = 'https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show',
  office_name = 'Bürger*innenbüro Aachen-Mitte',
  office_address = 'Hackländerstraße 1, 52058 Aachen (Bahnhofplatz) — a second location exists at Johannes-Paul-II.-Straße 1, 52062 Aachen (Katschhof)',
  typical_wait_time = 'Additional same-day slots release around 07:45; the appointment phone line (0241 432-1234) is staffed Mon–Fri 07:00–18:00',
  city_notes_md = 'Aachen, close to the Dutch and Belgian borders and home to a large student population, requires an appointment for registration at its Bürger*innenbüro locations — book online at aachen.de or by phone.',
  sources = '[{"url": "https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show", "title": "Serviceportal der Stadt Aachen — Terminbuchung", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'aachen' and t.slug = 'anmeldung';

-- ---- residence-permit: Hamburg, Cologne, Frankfurt, Stuttgart ----
update city_task_variants v set
  booking_url = 'https://www.hamburg.de/go/17584',
  office_name = 'Ausländerbehörde Hamburg',
  office_address = 'Hammer Str. 30–34, 22041 Hamburg',
  typical_wait_time = 'Appointment allocation can take several weeks to months — in urgent cases you can call and request an earlier slot',
  city_notes_md = 'Hamburg''s immigration matters are handled by the Ausländerbehörde at Hammer Straße. Visits without a booked appointment are generally not possible — book online well before your current permit expires; if no slot is available in time, submit your application in writing to preserve your legal stay.',
  sources = '[{"url": "https://www.hamburg.de/go/17584", "title": "hamburg.de — Ausländerbehörde appointment booking", "accessed_at": "2026-07-02"}, {"url": "https://www.hamburg.de/auslaenderbehoerde/", "title": "hamburg.de — Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'hamburg' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/74526/index.html',
  office_name = 'Bezirksausländeramt (district office — assigned by your postcode)',
  city_notes_md = 'Cologne''s Ausländeramt is split into district offices (Bezirksausländerämter); since April 2026 you book online by entering your postcode, which routes you to the right one — e.g. the Innenstadt office is at Ludwigstraße 8. Personal visits require both a booked appointment and an invitation letter from the office, so don''t show up without one.',
  sources = '[{"url": "https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/74526/index.html", "title": "Stadt Köln — Online-Terminvereinbarung Bezirksausländerämter", "accessed_at": "2026-07-02"}, {"url": "https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/index.html", "title": "Stadt Köln — Ausländeramt", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'cologne' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://frankfurt.de/auslaenderangelegenheiten',
  office_name = 'Ausländerbehörde Frankfurt',
  office_address = 'Kleyerstraße 86, 60326 Frankfurt am Main (second entrance: Rebstöcker Straße 4)',
  city_notes_md = 'Frankfurt''s Ausländerbehörde doesn''t use a simple public calendar for new applications — you submit your request online first, and a caseworker then assigns you an appointment (some departments send a separate online-booking link after you apply). Phone hotline: +49 69 212-42485, Mon–Thu 08:00–16:00, Fri 08:00–12:00. As a major international city, demand is high — apply as early as possible.',
  sources = '[{"url": "https://frankfurt.de/auslaenderangelegenheiten", "title": "Frankfurt.de — Ausländerangelegenheiten", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'frankfurt' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung',
  office_name = 'Ausländerbehörde Stuttgart',
  office_address = 'Eberhardstraße 39, 70173 Stuttgart',
  city_notes_md = 'Stuttgart''s Ausländerbehörde requires an appointment for all visits. For collecting your finished eAT card, booking depends on your application date — permits applied for since 17 Feb 2025 trigger an automatic email notification once the card arrives, which you then use to book a collection slot. If your permit or Fiktionsbescheinigung is expiring within 7 days, you can request an emergency appointment online rather than risk a gap in your legal stay.',
  sources = '[{"url": "https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung", "title": "Stuttgart.de — Ausländerbehörde appointment", "accessed_at": "2026-07-02"}, {"url": "https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/notfall-termin", "title": "Stuttgart.de — Emergency appointment", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'stuttgart' and t.slug = 'residence-permit';

-- ---- residence-permit: Düsseldorf, Leipzig, Dortmund, Essen ----
update city_task_variants v set
  booking_url = 'https://service.duesseldorf.de/online-dienst-auslaenderbehoerde',
  office_name = 'Kommunale Ausländerbehörde Düsseldorf',
  office_address = 'Erkrather Straße 377, 40231 Düsseldorf',
  typical_wait_time = 'An appointment is typically mailed to you automatically about 6–8 weeks before your current permit expires',
  city_notes_md = 'Düsseldorf''s Ausländerbehörde now requires all applications to go through its online services (email applications are no longer accepted). Issuing or extending a residence permit requires an in-person appointment, which the office notifies you of in writing roughly 6–8 weeks before your current permit runs out — if that timing feels late, don''t wait passively, follow up via the online portal.',
  sources = '[{"url": "https://www.duesseldorf.de/auslaenderamt", "title": "Landeshauptstadt Düsseldorf — Ausländerbehörde", "accessed_at": "2026-07-02"}, {"url": "https://service.duesseldorf.de/online-dienst-auslaenderbehoerde", "title": "Serviceportal Düsseldorf — Online-Dienst Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'duesseldorf' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://www.leipzig.de/jugend-familie-und-soziales/auslaender-und-migranten/auslaender-und-staatsangehoerigkeitsrecht-auslaenderbehoerde/aufenthalt/vom-antrag-zum-aufenthaltsdokument',
  office_name = 'Ausländerbehörde Leipzig',
  office_address = 'Technisches Rathaus, Haus B, Eingang Prager Straße 128, Leipzig',
  city_notes_md = 'Leipzig''s Ausländerbehörde works differently from a public booking calendar: after your application is fully processed, the office automatically mails you an appointment. For collecting your finished eAT card, you instead get a code by post that you use to self-book a pickup slot online. Walk-in visits without an appointment are not possible.',
  sources = '[{"url": "https://www.leipzig.de/jugend-familie-und-soziales/auslaender-und-migranten/auslaender-und-staatsangehoerigkeitsrecht-auslaenderbehoerde/aufenthalt/vom-antrag-zum-aufenthaltsdokument", "title": "Stadt Leipzig — Vom Antrag zum Aufenthaltsdokument", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'leipzig' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://termine.dortmund.de/32/select2?md=1',
  walk_in_possible = true,
  office_name = 'Ausländerbehörde Dortmund',
  office_address = 'Altes Stadthaus, Olpe 1, 44122 Dortmund (eAT card collection at Berswordthalle, entrance via Kleppingstraße or Friedensplatz)',
  city_notes_md = 'Dortmund''s Ausländerbehörde requires a booked appointment for issuing or extending a residence permit. Once your card is ready, though, you can now collect your electronic residence permit (eAT) without an appointment via a self-service collection box at the Berswordthalle — free and step-free access.',
  sources = '[{"url": "https://integreat.app/dortmund/de/willkommen/wichtige-aemter/auslaenderbehoerde/", "title": "Dortmund — Ausländerbehörde overview", "accessed_at": "2026-07-02"}, {"url": "https://www.wirindortmund.de/dortmund/kundinnen-koennen-elektronische-aufenthaltstitel-kuenftig-ohne-termin-abholen-244597", "title": "Wir in Dortmund — eAT ohne Termin abholen", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'dortmund' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/42944/show',
  office_name = 'Staatsangehörigkeits- und Ausländerangelegenheiten (ABH) Essen',
  office_address = 'Kruppstraße 16, 45128 Essen',
  city_notes_md = 'Essen''s Ausländerbehörde (ABH) books appointments by phone via the ServiceCenter on 0201-88-38883 (Mon, Tue, Thu 07:30–15:00; Wed, Fri 07:30–12:00), or by email for eAT pickup appointments specifically at 38883@abh.essen.de.',
  sources = '[{"url": "https://www.essen.de/leben/migration_und_integration/staatsangehoerigkeits__und_auslaenderangelegenheiten/terminvereinbarung.de.html", "title": "Stadt Essen — Terminvereinbarung Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'essen' and t.slug = 'residence-permit';

-- ---- residence-permit: Bremen, Dresden, Hannover, Nuremberg, Aachen ----
update city_task_variants v set
  booking_url = 'https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/migrationsamt-100086',
  office_name = 'Migrationsamt Bremen',
  office_address = 'Stresemannstr. 48, 28207 Bremen',
  office_hours = 'Mon 08:00–12:00 & 14:00–17:00, Tue by arrangement only, Wed 08:00–12:00, Thu 08:00–12:00 — appointment required, walk-ins cannot be served',
  city_notes_md = 'Bremen''s Migrationsamt only sees visitors with a booked appointment (phone 0421-361-15275/-15004, or email office@migrationsamt.bremen.de). If you already hold a Bremen residence permit, a renewal appointment is sent to you automatically before it expires — attend it if at all possible, since that''s what guarantees timely renewal.',
  sources = '[{"url": "https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/migrationsamt-100086", "title": "Serviceportal Bremen — Migrationsamt", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'bremen' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://www.dresden.de/de/rathaus/dienstleistungen/auslaenderangelegenheiten-terminabsprachen.php',
  office_name = 'Ausländerbehörde Dresden',
  office_address = 'Lingnerallee 3, Entrance North, 01069 Dresden',
  office_hours = 'By appointment only: Tue & Thu 08:00–11:00 & 14:00–17:00, Fri 08:00–11:00',
  typical_wait_time = 'Appointment allocation can take several weeks to months',
  city_notes_md = 'Dresden''s Ausländerbehörde only sees visitors by appointment, arranged by phone (0351-4886009) or email (auslaenderbehoerde@dresden.de) — there''s no public self-service calendar. The office moved to Lingnerallee 3 in April 2026 (nearest tram stops: Deutsches Hygiene-Museum, Pirnaischer Platz).',
  sources = '[{"url": "https://www.dresden.de/de/rathaus/dienstleistungen/auslaenderangelegenheiten-terminabsprachen.php", "title": "Landeshauptstadt Dresden — Terminvereinbarung Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'dresden' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://auslaenderbehoerdeonline.hannover-stadt.de/',
  office_name = 'HannoverServiceCenter (HSC)',
  office_address = 'Am Schützenplatz 1, 30169 Hannover',
  city_notes_md = 'If you live within the city of Hannover, the HannoverServiceCenter (HSC) handles residence permits — many applications can be submitted directly online without an in-person visit. If you live elsewhere in the wider Region Hannover, a separate body applies instead: the Ausländerbehörde der Region Hannover (Team Zuwanderung), Maschstraße 17, 30169 Hannover — check which one covers your registered address.',
  sources = '[{"url": "https://www.hannover.de/Leben-in-der-Region-Hannover/B%C3%BCrger-Service/Ausl%C3%A4nder%C2%ADangelegen%C2%ADheiten/Ausl%C3%A4nderbeh%C3%B6rden/Ausl%C3%A4nderbeh%C3%B6rde-der-Region-Hannover", "title": "Hannover.de — Ausländerbehörden overview", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'hannover' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://www.nuernberg.de/internet/auslaenderbehoerde/aufenthaltstitel.html',
  office_name = 'Amt für Migration und Integration der Stadt Nürnberg',
  city_notes_md = 'Nuremberg''s Amt für Migration und Integration handles residence permits mostly online: you submit your application via the city''s portal, and once your documents are complete, you''re invited by post to an in-person appointment (the letter specifies the exact location). Appointments run through the city''s official booking portal.',
  sources = '[{"url": "https://www.nuernberg.de/internet/auslaenderbehoerde/", "title": "Amt für Migration und Integration der Stadt Nürnberg", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'nuremberg' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://termine.staedteregion-aachen.de/auslaenderamt/',
  office_name = 'Ausländeramt StädteRegion Aachen',
  office_address = 'Hackländerstr. 1, 52064 Aachen (permit pickup at the branch office in Aachen Arkaden, ground floor, Trierer Straße 1, 52078 Aachen)',
  office_hours = 'Mon 08:00–15:00, Tue 08:00–15:00, Wed 08:00–16:45, Thu 08:00–13:00, Fri 08:00–12:00',
  city_notes_md = 'Unlike Anmeldung, which the city of Aachen itself handles, residence-permit matters are handled by the **StädteRegion Aachen** (the wider city-region authority) — a different office with its own booking system. Book via termine.staedteregion-aachen.de or call 0241-5198-5600.',
  sources = '[{"url": "https://termine.staedteregion-aachen.de/auslaenderamt/", "title": "Termine Städteregion Aachen — Ausländerbehörde", "accessed_at": "2026-07-02"}, {"url": "https://www.staedteregion-aachen.de/de/navigation/aemter/auslaenderamt-a-33/infostelle-/-termine", "title": "StädteRegion Aachen — Infostelle/Termine", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'aachen' and t.slug = 'residence-permit';

-- ---- residence-permit: Berlin, Munich (gaps the initial scoping missed —
-- their Anmeldung rows were already fact-checked in Round 1, but the
-- separate residence-permit row for each was never researched) ----
update city_task_variants v set
  booking_url = 'https://www.berlin.de/einwanderung/en/services/appointments/',
  office_name = 'Landesamt für Einwanderung (LEA)',
  office_address = 'Friedrich-Krause-Ufer 24, 13353 Berlin',
  typical_wait_time = 'Renewals can be requested up to 8 weeks before your permit expires; aim for an appointment 4–6 weeks before expiry',
  city_notes_md = 'Berlin''s Landesamt für Einwanderung (LEA) no longer uses a public appointment calendar — its old online booking system (OTV) was permanently shut down. Applications are now fully digital: upload your documents via the LEA''s online contact form, and the office assigns you an appointment itself once they''ve reviewed them. Demand is very high — apply well before your current permit expires.',
  sources = '[{"url": "https://www.berlin.de/einwanderung/en/services/appointments/", "title": "Berlin.de — Landesamt für Einwanderung, appointments", "accessed_at": "2026-07-02"}, {"url": "https://www.berlin.de/einwanderung/en/", "title": "Berlin.de — Landesamt für Einwanderung", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'berlin' and t.slug = 'residence-permit';

update city_task_variants v set
  booking_url = 'https://stadt.muenchen.de/buergerservice/ausland-migration.html',
  office_name = 'Ausländerbehörde München (KVR)',
  office_address = 'Ruppertstr. 19, 80337 München',
  office_hours = 'Service line reachable Mon–Thu 07:30–15:30, Fri 07:30–13:00',
  typical_wait_time = 'Appointment allocation can take several weeks to months; new slots release 10 minutes before each opening (morning and afternoon), Mon–Fri',
  city_notes_md = 'In Munich the KVR (Kreisverwaltungsreferat) at Ruppertstraße 19 handles residence permits, in the same building as its Bürgerbüro Anmeldung services. Visits without a booked appointment are generally not possible — in genuine emergencies you can call and ask for an earlier slot.',
  sources = '[{"url": "https://stadt.muenchen.de/buergerservice/ausland-migration.html", "title": "Landeshauptstadt München — Aufenthalt und Migration", "accessed_at": "2026-07-02"}]'::jsonb,
  last_verified_at = '2026-07-02'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id and c.slug = 'munich' and t.slug = 'residence-permit';

-- ================================================================
-- Round 9 (2026-07-03): 10 more problems + solutions covering more
-- real newcomer situations. Same idempotent pattern.
-- ================================================================
insert into problems (slug, title_en, description_md, category_id, related_task_ids, severity, status, last_verified_at, generated_by) values
  ('lost-residence-permit-eat', 'You lost your residence permit card (eAT)', E'Your electronic residence permit (eAT) card is lost or stolen. It''s your proof of legal status, so you need a replacement promptly — and to protect yourself against misuse.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit')], 'high', 'published', '2026-07-03', 'hand-written'),
  ('abmeldung-when-leaving', 'How to deregister (Abmeldung) when you leave Germany', E'When you move out of Germany for good (or sometimes within it), you must **deregister** your address (Abmeldung). Skipping it means you keep being liable for the Rundfunkbeitrag and stay on the tax register.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('apartment-hunt-scams', 'Avoiding rental scams while apartment-hunting', E'Germany''s tight housing market breeds scams: fake listings, "pay the deposit before viewing", or landlords who ask for money by wire to hold a flat you never see. Newcomers are prime targets.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='anmeldung')], 'high', 'published', '2026-07-03', 'hand-written'),
  ('steuererklaerung-tax-return', 'Should you file a German tax return (Steuererklärung)?', E'Many internationals think a tax return is only a burden — but as an employee you''re often owed **money back** (overpaid wage tax, moving costs, commute, first-job expenses). Filing is usually voluntary for employees and frequently worth it.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='tax-id')], 'low', 'published', '2026-07-03', 'hand-written'),
  ('changing-krankenkasse', 'Switching your public health insurer (Krankenkasse)', E'Public insurers (TK, AOK, Barmer, DAK...) offer legally near-identical coverage but differ in service, English support and the small extra contribution rate (Zusatzbeitrag). You''re allowed to switch — many people never realise it.', (select id from task_categories where slug='health'), array[(select id from tasks where slug='health-insurance')], 'low', 'published', '2026-07-03', 'hand-written'),
  ('kindergeld-for-families', 'Claiming child benefit (Kindergeld) as an international family', E'If you live and work in Germany with children, you''re usually entitled to **Kindergeld** — a monthly payment per child — regardless of nationality, as long as your residence status allows it. Many families don''t know they qualify.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('driving-foreign-licence-6-months', 'Driving on your foreign licence — the 6-month rule', E'You can usually drive on a non-EU licence for only about **6 months** after registering in Germany. After that it may no longer be valid — even if it hasn''t expired — and driving on it can count as driving without a licence.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='driving-license')], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('family-reunion-visa', 'Bringing your spouse or family to Germany', E'Family reunion (Familiennachzug) lets you bring a spouse and children, but it has conditions — enough income and living space, and often a basic-German (A1) certificate for the spouse. The process runs partly through the German embassy abroad.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit')], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('lost-job-on-work-permit', 'You lost your job on a work-based residence permit', E'Losing your job doesn''t instantly end your residence permit, but it does start a clock: you must inform the Ausländerbehörde, and you typically get a limited window (often around 3–6 months) to find new employment before your status is at risk.', (select id from task_categories where slug='work'), array[(select id from tasks where slug='work-permit-change'), (select id from tasks where slug='residence-permit')], 'high', 'published', '2026-07-03', 'hand-written'),
  ('integration-course-needed', 'Do you need an integration or German language course?', E'Some residence permits come with an **obligation** to attend an integration course (German + "life in Germany"); for others it''s a voluntary right you can claim cheaply. Ignoring an obligation can affect permit extensions.', (select id from task_categories where slug='work'), array[]::uuid[], 'low', 'published', '2026-07-03', 'hand-written')
on conflict (slug, locale) do update set title_en=excluded.title_en, description_md=excluded.description_md, category_id=excluded.category_id, related_task_ids=excluded.related_task_ids, severity=excluded.severity, status=excluded.status, last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by;

delete from solutions where problem_id in (select id from problems where slug in ('lost-residence-permit-eat','abmeldung-when-leaving','apartment-hunt-scams','steuererklaerung-tax-return','changing-krankenkasse','kindergeld-for-families','driving-foreign-licence-6-months','family-reunion-visa','lost-job-on-work-permit','integration-course-needed'));

insert into solutions (problem_id, city_id, title_en, body_md, effectiveness, sort_order, status) values
  ((select id from problems where slug='lost-residence-permit-eat'), null, 'Report it and book an Ausländerbehörde appointment', 'Report the loss (a police report helps if it was stolen), then contact your Ausländerbehörde to apply for a replacement eAT. Ask for interim proof of status while you wait.', 'official', 1, 'published'),
  ((select id from problems where slug='lost-residence-permit-eat'), null, 'Block the online eID function', 'The eAT has an online-ID chip — call the blocking hotline 116 116 to disable it so no one can misuse your identity.', 'official', 2, 'published'),
  ((select id from problems where slug='abmeldung-when-leaving'), null, 'File the Abmeldung with your Bürgeramt', 'Submit the deregistration form (often possible by post or online) around your move-out date — no earlier than a week before. Keep the Abmeldebestätigung; you''ll need it to stop the Rundfunkbeitrag and for tax.', 'official', 1, 'published'),
  ((select id from problems where slug='abmeldung-when-leaving'), null, 'Cancel contracts and tell the tax office', 'Use the Abmeldung to cancel your Rundfunkbeitrag and notify insurers, banks and the Finanzamt. Leaving mid-year may also mean you''re owed a tax refund — worth filing for.', 'workaround', 2, 'published'),
  ((select id from problems where slug='apartment-hunt-scams'), null, 'Never pay before an in-person viewing', 'The biggest red flag is any request for a deposit or "key transfer" fee before you''ve seen the flat and met the landlord. Legitimate landlords don''t ask for money to view.', 'official', 1, 'published'),
  ((select id from problems where slug='apartment-hunt-scams'), null, 'Watch for classic scam signs', 'Landlord "abroad", pressure to act fast, too-good-to-be-true rent, poor-German copy-paste messages, or payment via wire/crypto only — all warning signs. Use a proper deposit account (Mietkautionskonto) only after a signed contract.', 'workaround', 2, 'published'),
  ((select id from problems where slug='steuererklaerung-tax-return'), null, 'File it — you''re often owed a refund', 'Employees frequently get money back. Use a low-cost tool (e.g. an English-friendly tax app) or the official ELSTER portal. You can file for up to four prior years if voluntary.', 'official', 1, 'published'),
  ((select id from problems where slug='steuererklaerung-tax-return'), null, 'Get help if your situation is complex', 'For freelancers, multiple countries, or crypto/investments, a Lohnsteuerhilfeverein (income-tax help association) or a Steuerberater is worth the fee.', 'workaround', 2, 'published'),
  ((select id from problems where slug='changing-krankenkasse'), null, 'Just apply to the new insurer — they handle the switch', 'Pick a new Krankenkasse and sign up; the new insurer usually cancels the old one for you. You can generally switch after 12 months of membership, or sooner if your contribution rate rises.', 'official', 1, 'published'),
  ((select id from problems where slug='changing-krankenkasse'), null, 'Compare service and the Zusatzbeitrag', 'Coverage is legally standardized, so compare the small extra contribution rate, English-language service, and app quality — not the core benefits.', 'workaround', 2, 'published'),
  ((select id from problems where slug='kindergeld-for-families'), null, 'Apply to the Familienkasse', 'Submit the Kindergeld application to the Familienkasse (part of the employment agency) with your children''s birth certificates and your residence/work status. It can be backdated a limited number of months, so don''t delay.', 'official', 1, 'published'),
  ((select id from problems where slug='kindergeld-for-families'), null, 'Check eligibility tied to your permit', 'Entitlement depends on your residence title allowing it (most work and settlement permits do; some study/short-term ones don''t). Check your permit type before assuming.', 'workaround', 2, 'published'),
  ((select id from problems where slug='driving-foreign-licence-6-months'), null, 'Exchange your licence before the 6 months run out', 'Start the licence exchange (Umschreibung) at the Führerscheinstelle early — see the driving-licence guide. Whether you need a test depends on your issuing country.', 'official', 1, 'published'),
  ((select id from problems where slug='driving-foreign-licence-6-months'), null, 'Carry a certified translation meanwhile', 'While still within the valid window, carry your licence plus (if not in German/English) a certified translation or International Driving Permit to avoid roadside trouble.', 'workaround', 2, 'published'),
  ((select id from problems where slug='family-reunion-visa'), null, 'Meet the income and housing conditions first', 'You generally must show enough income to support your family without benefits, and adequate living space. Sort these before applying — they''re the usual sticking points.', 'official', 1, 'published'),
  ((select id from problems where slug='family-reunion-visa'), null, 'Spouse applies at the German embassy back home', 'The family member usually applies for the reunion visa at the German mission in their country; a basic-German A1 certificate is often required for spouses. Book the embassy appointment early — waits can be long.', 'official', 2, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Tell the Ausländerbehörde promptly', 'Inform the immigration office of the job loss. They record it and confirm how long you have to find new work — don''t let them hear it later, which looks worse.', 'official', 1, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Use the job-search window and claim benefits you''re due', 'You typically get a set period to find a comparable job. You may also be entitled to unemployment benefit (ALG I) if you paid in long enough — claim it at the Agentur für Arbeit.', 'workaround', 2, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Get advice before the window closes', 'If time is running short, a Migrationsberatung or immigration lawyer can advise on switching permit type (e.g. job-seeker) before your status lapses.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='integration-course-needed'), null, 'Check whether your permit obliges a course', 'Your residence-permit paperwork or the Ausländerbehörde will say if attendance is obligatory. If it is, sign up via a BAMF-approved provider — non-attendance can hurt extensions.', 'official', 1, 'published'),
  ((select id from problems where slug='integration-course-needed'), null, 'Claim it voluntarily if it helps you', 'Even when optional, integration and German courses are heavily subsidised and count toward later permanent-residency language requirements — often worth doing.', 'workaround', 2, 'published');

-- ================================================================
-- Round 14 (2026-07-03): full sync of content that had drifted
-- ahead of this seed file (glossary, letters, problems/solutions,
-- and the new commuter_areas feature). Regenerated directly from
-- the live database as idempotent upserts, so a fresh `db reset`
-- reproduces production exactly. Task/city references are rebuilt
-- as slug-subselects for portability.
-- ================================================================

-- ---- glossary_terms (full set) ----
insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status) values
  ('abmeldung', 'Abmeldung', 'Deregistration', 'Deregistering your address when you leave Germany. Only needed when moving abroad — moving within Germany just requires a new Anmeldung.', array[]::uuid[], 'published'),
  ('agentur-fuer-arbeit', 'Agentur für Arbeit', 'Federal Employment Agency', 'The government agency for job placement, unemployment benefit and work-related support. Also issues some work approvals.', array[]::uuid[], 'published'),
  ('anmeldebestaetigung', 'Anmeldebestätigung', 'Registration confirmation', 'The stamped confirmation you receive after Anmeldung. Banks, employers and the immigration office will ask for it — keep it safe and make copies.', array[]::uuid[], 'published'),
  ('anmeldung', 'Anmeldung', 'Address registration', 'Registering your home address with the city. Legally required within **two weeks** of moving in (§17 BMG). The confirmation (Anmeldebestätigung) is needed for almost every other procedure.', array[]::uuid[], 'published'),
  ('apostille', 'Apostille', 'Apostille', 'An international certification making your home-country documents legally valid in Germany. Obtained in the country that issued the document.', array[]::uuid[], 'published'),
  ('arbeitserlaubnis', 'Arbeitserlaubnis', 'Work permit', 'Permission to work, often built into your residence permit. Whether and how much you may work is printed on the permit''s supplementary sheet (Zusatzblatt).', array[(select id from tasks where slug='work-permit-change')]::uuid[], 'published'),
  ('arbeitslosengeld', 'Arbeitslosengeld', 'Unemployment benefit', '**ALG I** is contribution-based support if you lose your job after paying in long enough; **Bürgergeld** is basic welfare. Claimed at the Agentur für Arbeit.', array[]::uuid[], 'published'),
  ('aufenthaltsgestattung', 'Aufenthaltsgestattung', 'Permission to remain (asylum)', 'A document confirming you may stay in Germany while your asylum application is processed. Different from a residence permit.', array[]::uuid[], 'published'),
  ('aufenthaltstitel', 'Aufenthaltstitel', 'Residence permit', 'The umbrella term for German residence permits: visa, temporary permit (Aufenthaltserlaubnis), Blue Card, permanent settlement permit (Niederlassungserlaubnis) and more.', array[]::uuid[], 'published'),
  ('auslaenderbehoerde', 'Ausländerbehörde', 'Immigration office', 'The local authority responsible for residence permits, visa conversions and work permissions. Every city or district has its own, with its own procedures.', array[]::uuid[], 'published'),
  ('bafoeg', 'BAföG', 'Student financial aid', 'State financial support for eligible students, partly grant and partly interest-free loan. Mostly for Germans/settled residents, with some exceptions.', array[]::uuid[], 'published'),
  ('beglaubigte-uebersetzung', 'Beglaubigte Übersetzung', 'Certified translation', 'A translation by a sworn translator, required for foreign documents (birth certificates, diplomas). Regular translations are usually not accepted.', array[]::uuid[], 'published'),
  ('bescheid', 'Bescheid', 'Official decision', 'An official written decision (e.g. Steuerbescheid, Festsetzungsbescheid). Usually includes a deadline (Frist) and instructions for objection (Widerspruch).', array[]::uuid[], 'published'),
  ('blaue-karte', 'Blaue Karte EU', 'EU Blue Card', 'A residence permit for university-educated professionals with a job offer above a salary threshold. Offers a faster route to permanent residence.', array[]::uuid[], 'published'),
  ('brutto-netto', 'Brutto / Netto', 'Gross vs net pay', '**Brutto** is your salary before tax and social contributions; **Netto** is what actually lands in your account. The gap is often 30–45%.', array[]::uuid[], 'published'),
  ('buergeramt', 'Bürgeramt', 'Citizens'' office', 'The local office handling registration, ID matters and certificates. Also called Bürgerbüro, Einwohnermeldeamt or KVR depending on the city.', array[]::uuid[], 'published'),
  ('duldung', 'Duldung', 'Tolerated stay', 'A temporary suspension of deportation — not a residence permit, but confirmation the authorities are, for now, not enforcing removal. Rights attached are limited.', array[]::uuid[], 'published'),
  ('einbuergerung', 'Einbürgerung', 'Naturalisation', 'Becoming a German citizen, typically after several years of legal residence plus language, income and integration requirements.', array[]::uuid[], 'published'),
  ('elster', 'ELSTER', 'Online tax portal', 'The government''s free online portal for filing tax returns and other tax matters electronically with the Finanzamt.', array[]::uuid[], 'published'),
  ('elterngeld', 'Elterngeld', 'Parental allowance', 'Income-replacement paid to parents who reduce work after a birth, for up to 12–14 months. Separate from Kindergeld.', array[]::uuid[], 'published'),
  ('fiktionsbescheinigung', 'Fiktionsbescheinigung', 'Bridging certificate', 'A certificate confirming your stay is legal while your residence-permit application is pending. Check which paragraph is ticked — it decides whether you may keep working and travelling.', array[]::uuid[], 'published'),
  ('finanzamt', 'Finanzamt', 'Tax office', 'The local tax authority: issues tax numbers, processes tax returns and tax-class changes.', array[]::uuid[], 'published'),
  ('freiberufler', 'Freiberufler', 'Liberal professional / freelancer', 'A self-employed professional (e.g. writer, developer, doctor) taxed more simply than a trader — no Gewerbe registration, but you register with the Finanzamt.', array[]::uuid[], 'published'),
  ('fuehrungszeugnis', 'Führungszeugnis', 'Police clearance certificate', 'An official criminal-record certificate, often required for jobs (especially with children/vulnerable people). Requested at the Bürgeramt or online.', array[]::uuid[], 'published'),
  ('gehaltsabrechnung', 'Gehaltsabrechnung', 'Payslip', 'Your monthly pay statement showing gross pay, tax, social-insurance deductions and net pay. Keep them — landlords and offices ask for them.', array[]::uuid[], 'published'),
  ('gewerbe', 'Gewerbe', 'Trade / business', 'A commercial self-employed activity (e.g. selling goods, a shop). Must be registered as a **Gewerbeanmeldung** at the Gewerbeamt, unlike a Freiberufler.', array[]::uuid[], 'published'),
  ('haftpflichtversicherung', 'Privathaftpflichtversicherung', 'Personal liability insurance', 'Cheap but near-essential insurance covering damage you accidentally cause to others or their property. Landlords and many situations expect you to have it.', array[]::uuid[], 'published'),
  ('hauptwohnsitz', 'Hauptwohnsitz', 'Primary residence', 'Your main registered home. If you have more than one address in Germany you must declare which is primary; a **Zweitwohnsitz** (second home) can carry an extra local tax.', array[]::uuid[], 'published'),
  ('hausratversicherung', 'Hausratversicherung', 'Home contents insurance', 'Optional insurance covering your belongings against fire, water, burglary etc. Common but not mandatory; often bundled with liability insurance.', array[]::uuid[], 'published'),
  ('immatrikulation', 'Immatrikulation', 'University enrolment', 'Formal enrolment at a German university. Your **Immatrikulationsbescheinigung** (enrolment certificate) proves student status for visas, insurance and discounts.', array[]::uuid[], 'published'),
  ('kaution', 'Kaution', 'Rental deposit', 'A security deposit for a flat, legally capped at **three months'' cold rent**. Must be kept in a separate account and returned (with interest) when you leave.', array[]::uuid[], 'published'),
  ('kindergeld', 'Kindergeld', 'Child benefit', 'A monthly government payment per child to families living in Germany, regardless of nationality if your residence status allows it. Claimed at the **Familienkasse**.', array[]::uuid[], 'published'),
  ('krankenkasse', 'Krankenkasse', 'Health insurance fund', 'A public health insurer (e.g. TK, AOK, Barmer). Membership certificates from a Krankenkasse are required by employers and universities.', array[]::uuid[], 'published'),
  ('kuendigung', 'Kündigung', 'Termination / notice', 'Formal notice ending a contract — a job, flat, insurance or gym. German contracts have strict notice periods and usually must be cancelled in writing.', array[]::uuid[], 'published'),
  ('lohnsteuer', 'Lohnsteuer', 'Wage tax', 'Income tax your employer withholds directly from your salary each month and pays to the Finanzamt. How much depends on your **Steuerklasse**.', array[]::uuid[], 'published'),
  ('mahnung', 'Mahnung', 'Payment reminder', 'A formal payment reminder. Ignoring a Mahnung leads to escalating fees and eventually enforcement — never throw one away unread.', array[]::uuid[], 'published'),
  ('mehrwertsteuer', 'Mehrwertsteuer (MwSt) / Umsatzsteuer', 'Value-added tax (VAT)', 'Germany''s sales tax (standard 19%, reduced 7%), included in shop prices. Freelancers/businesses charge and remit it unless they qualify as a Kleinunternehmer.', array[]::uuid[], 'published'),
  ('mietspiegel', 'Mietspiegel', 'Local rent index', 'An official table of typical local rents by area, size and age of building. Used to judge whether a rent or a rent increase is legally justified.', array[]::uuid[], 'published'),
  ('minijob', 'Minijob', 'Mini job', 'A small job with earnings capped at a monthly limit (around €538), largely tax- and contribution-free. Popular with students, but watch student work-hour limits.', array[]::uuid[], 'published'),
  ('nebenkosten', 'Nebenkosten', 'Ancillary/utility costs', 'The running costs on top of base rent — heating, water, building upkeep. **Warmmiete** = base rent + Nebenkosten; **Kaltmiete** = base rent only.', array[]::uuid[], 'published'),
  ('niederlassungserlaubnis', 'Niederlassungserlaubnis', 'Permanent settlement permit', 'The permanent residence permit, usually available after several years of temporary residence, secure income and language proficiency.', array[]::uuid[], 'published'),
  ('pflegeversicherung', 'Pflegeversicherung', 'Long-term care insurance', 'Mandatory insurance (bundled with health insurance) covering long-term nursing care. Automatically deducted with your other social contributions.', array[]::uuid[], 'published'),
  ('probezeit', 'Probezeit', 'Probation period', 'A trial period at the start of a job (usually up to 6 months) during which either side can terminate with short notice (often 2 weeks).', array[]::uuid[], 'published'),
  ('rundfunkbeitrag', 'Rundfunkbeitrag', 'Broadcasting fee', 'The mandatory public-broadcasting fee (about €18.36/month), paid **once per household** — widely known by its old name "GEZ". Letters come from "ARD ZDF Deutschlandradio Beitragsservice" — they are genuine, not a scam.', array[]::uuid[], 'published'),
  ('schufa', 'SCHUFA', 'Credit record', 'Germany''s main credit agency. A "SCHUFA-Auskunft" is routinely requested by landlords. One free data copy per year is your legal right.', array[]::uuid[], 'published'),
  ('sozialversicherung', 'Sozialversicherung', 'Social insurance', 'Germany''s mandatory contributions covering health, pension, unemployment, care and accident insurance — automatically deducted from your salary.', array[]::uuid[], 'published'),
  ('sperrkonto', 'Sperrkonto', 'Blocked account', 'A special account proving you can support yourself — required for many student and jobseeker visas. Only a fixed amount per month can be withdrawn.', array[]::uuid[], 'published'),
  ('steuer-id', 'Steuer-ID', 'Tax ID', 'Your permanent 11-digit tax identification number (steuerliche Identifikationsnummer). Sent by post automatically a few weeks after your first Anmeldung. Your employer needs it.', array[]::uuid[], 'published'),
  ('steuerklasse', 'Steuerklasse', 'Tax class', 'One of six wage-tax categories deciding your monthly deductions. Assigned automatically (class I for singles); married couples can choose combinations. Errors are fixed via the Finanzamt.', array[]::uuid[], 'published'),
  ('steuernummer', 'Steuernummer', 'Tax number', 'A number issued by your local Finanzamt for self-employed/business tax, used on invoices. **Different** from the lifelong 11-digit Steuer-ID.', array[(select id from tasks where slug='tax-id')]::uuid[], 'published'),
  ('termin', 'Termin', 'Appointment', 'Many German offices only see you with a booked appointment (Terminvereinbarung). Booking portals release new slots at fixed times, often early morning.', array[]::uuid[], 'published'),
  ('ummeldung', 'Ummeldung', 'Re-registration (moving within Germany)', 'Registering a **new address** when you move house within Germany. Like Anmeldung, do it within 14 days at the new city''s Bürgeramt.', array[]::uuid[], 'published'),
  ('werkstudent', 'Werkstudent', 'Working student', 'A student employment status allowing up to ~20 hours/week during term with reduced social contributions. A common way for students to work legally.', array[]::uuid[], 'published'),
  ('wohnberechtigungsschein', 'Wohnberechtigungsschein (WBS)', 'Social-housing entitlement certificate', 'A certificate that lets lower-income residents rent subsidised social housing. Issued by the city if your income is below set limits.', array[]::uuid[], 'published'),
  ('wohngeld', 'Wohngeld', 'Housing benefit', 'A state subsidy toward rent for low-income households. Availability depends on income, rent and residence status; applied for at the local Wohngeldstelle.', array[]::uuid[], 'published'),
  ('wohngemeinschaft', 'Wohngemeinschaft (WG)', 'Shared flat', 'A flat share where several people rent rooms and share the kitchen/bathroom. The most common (and affordable) housing for newcomers and students.', array[]::uuid[], 'published'),
  ('wohnungsgeberbestaetigung', 'Wohnungsgeberbestätigung', 'Landlord confirmation', 'A form your landlord must sign confirming you moved in. Required for Anmeldung — a rental contract alone is **not** enough. Landlords are legally obliged to provide it (§19 BMG).', array[]::uuid[], 'published'),
  ('zwischenmiete', 'Zwischenmiete', 'Sublet', 'Temporarily renting someone else''s flat or room while they''re away. A practical way to get an address and rental history before finding a permanent place.', array[]::uuid[], 'published')
on conflict (slug, locale) do update set term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md, related_task_ids=excluded.related_task_ids, status=excluded.status;

-- ---- city_task_variants (full set: Anmeldung + residence-permit, all 15 cities) ----
insert into city_task_variants (city_id, task_id, appointment_required, walk_in_possible, online_possible, booking_url, office_name, office_address, office_hours, typical_wait_time, fees_eur, fees_note, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by) values
  ((select id from cities where slug='aachen'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show', 'Bürger*innenbüro Aachen-Mitte', 'Hackländerstraße 1, 52058 Aachen (Bahnhofplatz) — a second location exists at Johannes-Paul-II.-Straße 1, 52062 Aachen (Katschhof)', NULL, 'Additional same-day slots release around 07:45; the appointment phone line (0241 432-1234) is staffed Mon–Fri 07:00–18:00', 0, NULL, 'Aachen handles Anmeldung through its **Bürgerservice**; book via the city service portal. As a border city with a large student population, demand is steady — book as soon as your documents are ready.', 'published', '[{"url": "https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show", "title": "Serviceportal der Stadt Aachen — Terminbuchung", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='aachen'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://termine.staedteregion-aachen.de/auslaenderamt/', 'Ausländeramt StädteRegion Aachen', 'Hackländerstr. 1, 52064 Aachen (permit pickup at the branch office in Aachen Arkaden, ground floor, Trierer Straße 1, 52078 Aachen)', 'Mon 08:00–15:00, Tue 08:00–15:00, Wed 08:00–16:45, Thu 08:00–13:00, Fri 08:00–12:00', 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Unlike Anmeldung, which the city of Aachen itself handles, residence-permit matters are handled by the **StädteRegion Aachen** (the wider city-region authority) — a different office with its own booking system. Book via termine.staedteregion-aachen.de or call 0241-5198-5600.', 'published', '[{"url": "https://termine.staedteregion-aachen.de/auslaenderamt/", "title": "Termine Städteregion Aachen — Ausländerbehörde", "accessed_at": "2026-07-02"}, {"url": "https://www.staedteregion-aachen.de/de/navigation/aemter/auslaenderamt-a-33/infostelle-/-termine", "title": "StädteRegion Aachen — Infostelle/Termine", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='berlin'), (select id from tasks where slug='anmeldung'), true, false, true, 'https://service.berlin.de/dienstleistung/120686/', 'Bürgeramt (any district)', 'Multiple locations across Berlin', 'Varies by office; check service.berlin.de', '2–6 weeks for an appointment', 0, NULL, 'In Berlin you can book at **any Bürgeramt in any district** — pick whichever has the earliest slot.

New appointments are released **every morning**; refreshing the booking page between 7 and 9 am gives the best chances. Cancellations also free up same-week slots during the day.

Berlin also offers **online registration** for straightforward moves (single household, no special cases) via service.berlin.de — check whether you qualify before hunting for an appointment.', 'published', '[{"url": "https://service.berlin.de/dienstleistung/120686/", "title": "Service Berlin — Anmeldung einer Wohnung", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='berlin'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.berlin.de/einwanderung/en/services/appointments/', 'Landesamt für Einwanderung (LEA)', 'Friedrich-Krause-Ufer 24, 13353 Berlin', NULL, 'Renewals can be requested up to 8 weeks before your permit expires; aim for an appointment 4–6 weeks before expiry', null, 'Roughly €50–140 depending on permit type and duration', 'Berlin''s Landesamt für Einwanderung (LEA) no longer uses a public appointment calendar — its old online booking system (OTV) was permanently shut down. Applications are now fully digital: upload your documents via the LEA''s online contact form, and the office assigns you an appointment itself once they''ve reviewed them. Demand is very high — apply well before your current permit expires.', 'published', '[{"url": "https://www.berlin.de/einwanderung/en/services/appointments/", "title": "Berlin.de — Landesamt für Einwanderung, appointments", "accessed_at": "2026-07-02"}, {"url": "https://www.berlin.de/einwanderung/en/", "title": "Berlin.de — Landesamt für Einwanderung", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='bremen'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://www.service.bremen.de/terminbuchung-1469', 'BürgerServiceCenter-Mitte', 'Martinistraße 3, 28195 Bremen (relocated early 2026 from Pelzerstraße 40)', 'Mon & Thu 07:30–17:00, Tue & Fri 07:30–12:00, Wed 07:30–13:00 (varies at other BürgerServiceCenter locations)', 'Often several weeks — book as early as you can', 0, NULL, 'Bremen uses **BürgerServiceCenter** offices (e.g. Mitte and Nord), booked through service.bremen.de. Slots can be scarce, so reserve as soon as you have your documents.', 'published', '[{"url": "https://www.service.bremen.de/terminbuchung-1469", "title": "Serviceportal Bremen — Terminbuchung", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='bremen'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/migrationsamt-100086', 'Migrationsamt Bremen', 'Stresemannstr. 48, 28207 Bremen', 'Mon 08:00–12:00 & 14:00–17:00, Tue by arrangement only, Wed 08:00–12:00, Thu 08:00–12:00 — appointment required, walk-ins cannot be served', 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Bremen''s Migrationsamt only sees visitors with a booked appointment (phone 0421-361-15275/-15004, or email office@migrationsamt.bremen.de). If you already hold a Bremen residence permit, a renewal appointment is sent to you automatically before it expires — attend it if at all possible, since that''s what guarantees timely renewal.', 'published', '[{"url": "https://www.service.bremen.de/die-senatorin-fuer-inneres-und-sport/migrationsamt-100086", "title": "Serviceportal Bremen — Migrationsamt", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='cologne'), (select id from tasks where slug='anmeldung'), true, true, null, 'https://terminator.koeln/', 'Bürgeramt (citizens'' office)', NULL, 'Mon & Wed: walk-in possible (expect queues); Tue, Thu, Fri: appointment required', 'Often several weeks — book as early as possible and check terminator.koeln daily for newly released slots', 0, NULL, 'Cologne (Köln) registers you at district **Bürgerämter**. Slots are booked through the city''s Terminator system and go fast; new appointments are released periodically, so check at different times of day and try more than one district office.', 'published', '[{"url": "https://www.stadt-koeln.de/artikel/06415/index.html", "title": "Stadt Köln — Terminvereinbarung online", "accessed_at": "2026-07-02"}, {"url": "https://terminator.koeln/", "title": "terminator.koeln — official Cologne appointment portal", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='cologne'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/74526/index.html', 'Bezirksausländeramt (district office — assigned by your postcode)', NULL, NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Cologne''s Ausländeramt is split into district offices (Bezirksausländerämter); since April 2026 you book online by entering your postcode, which routes you to the right one — e.g. the Innenstadt office is at Ludwigstraße 8. Personal visits require both a booked appointment and an invitation letter from the office, so don''t show up without one.', 'published', '[{"url": "https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/74526/index.html", "title": "Stadt Köln — Online-Terminvereinbarung Bezirksausländerämter", "accessed_at": "2026-07-02"}, {"url": "https://www.stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/index.html", "title": "Stadt Köln — Ausländeramt", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='dortmund'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://www.dortmund.de/rathaus/verwaltung/buergerdienste/terminvereinbarungen/', 'Dienstleistungszentrum Innenstadt (Bürgerdienste)', 'Südwall 2–4, 44137 Dortmund', 'Mon 07:00–16:00, Tue 07:00–16:00, Wed 07:00–12:00, Thu 07:00–18:00, Fri 07:00–12:00 (district offices open slightly later, from 08:00)', 'Slots release daily at 07:00 for same-day, +7 days and +14 days — often bookable within 1–2 weeks', 0, NULL, 'Dortmund''s Bürgerdienste (citizen services) handle registration at the central Dienstleistungszentrum Innenstadt or a district office (Bezirksverwaltungsstelle). Appointments are required — book online or call (0231) 50-1 11 50.', 'published', '[{"url": "https://www.dortmund.de/rathaus/verwaltung/buergerdienste/terminvereinbarungen/", "title": "Stadt Dortmund — Terminvereinbarungen", "accessed_at": "2026-07-02"}, {"url": "https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/buergerdienste/downloads/oeffnungszeiten_buergerdienste.pdf", "title": "Stadt Dortmund — Öffnungszeiten der Bürgerdienste", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='dortmund'), (select id from tasks where slug='residence-permit'), true, true, null, 'https://termine.dortmund.de/32/select2?md=1', 'Ausländerbehörde Dortmund', 'Altes Stadthaus, Olpe 1, 44122 Dortmund (eAT card collection at Berswordthalle, entrance via Kleppingstraße or Friedensplatz)', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Dortmund''s Ausländerbehörde requires a booked appointment for issuing or extending a residence permit. Once your card is ready, though, you can now collect your electronic residence permit (eAT) without an appointment via a self-service collection box at the Berswordthalle — free and step-free access.', 'published', '[{"url": "https://integreat.app/dortmund/de/willkommen/wichtige-aemter/auslaenderbehoerde/", "title": "Dortmund — Ausländerbehörde overview", "accessed_at": "2026-07-02"}, {"url": "https://www.wirindortmund.de/dortmund/kundinnen-koennen-elektronische-aufenthaltstitel-kuenftig-ohne-termin-abholen-244597", "title": "Wir in Dortmund — eAT ohne Termin abholen", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='dresden'), (select id from tasks where slug='anmeldung'), true, true, null, 'https://termine-buergerbuero.dresden.de/', 'Bürgeramt (citizens'' office)', NULL, 'Tue & Thu 13:00–16:00: walk-in possible at most Bürgerbüros (expect a wait) — otherwise by appointment', 'Book ahead via the online portal, or walk in Tuesday/Thursday afternoon if urgent', 0, NULL, 'Dresden registers at district **Bürgerbüros** (Altstadt, Neustadt and others). Book via the city''s Bürgerbüro appointment portal; demand rises around the start of the university semester.', 'published', '[{"url": "https://www.dresden.de/de/rathaus/dienstleistungen/Terminvereinbarung_Buergerbueros.php", "title": "Landeshauptstadt Dresden — Terminvereinbarung in Bürgerbüros", "accessed_at": "2026-07-02"}, {"url": "https://termine-buergerbuero.dresden.de/", "title": "Dresden — Bürgerbüro appointment booking", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='dresden'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.dresden.de/de/rathaus/dienstleistungen/auslaenderangelegenheiten-terminabsprachen.php', 'Ausländerbehörde Dresden', 'Lingnerallee 3, Entrance North, 01069 Dresden', 'By appointment only: Tue & Thu 08:00–11:00 & 14:00–17:00, Fri 08:00–11:00', 'Appointment allocation can take several weeks to months', null, 'Roughly €50–140 depending on permit type and duration', 'Dresden''s Ausländerbehörde only sees visitors by appointment, arranged by phone (0351-4886009) or email (auslaenderbehoerde@dresden.de) — there''s no public self-service calendar. The office moved to Lingnerallee 3 in April 2026 (nearest tram stops: Deutsches Hygiene-Museum, Pirnaischer Platz).', 'published', '[{"url": "https://www.dresden.de/de/rathaus/dienstleistungen/auslaenderangelegenheiten-terminabsprachen.php", "title": "Landeshauptstadt Dresden — Terminvereinbarung Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='duesseldorf'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://termine.duesseldorf.de/', 'Bürgeramt (citizens'' office)', NULL, NULL, 'Often several weeks — book as early as you can', 0, NULL, 'Düsseldorf''s **Bürgerbüros** are spread across the districts and booked via termine.duesseldorf.de. A less central office often has earlier availability than the main one.', 'published', '[{"url": "https://termine.duesseldorf.de/", "title": "Terminvereinbarung Stadt Düsseldorf", "accessed_at": "2026-07-02"}, {"url": "https://www.duesseldorf.de/einwohnerangelegenheiten", "title": "Landeshauptstadt Düsseldorf — Einwohnermeldeamt", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='duesseldorf'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://service.duesseldorf.de/online-dienst-auslaenderbehoerde', 'Kommunale Ausländerbehörde Düsseldorf', 'Erkrather Straße 377, 40231 Düsseldorf', NULL, 'An appointment is typically mailed to you automatically about 6–8 weeks before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Düsseldorf''s Ausländerbehörde now requires all applications to go through its online services (email applications are no longer accepted). Issuing or extending a residence permit requires an in-person appointment, which the office notifies you of in writing roughly 6–8 weeks before your current permit runs out — if that timing feels late, don''t wait passively, follow up via the online portal.', 'published', '[{"url": "https://www.duesseldorf.de/auslaenderamt", "title": "Landeshauptstadt Düsseldorf — Ausländerbehörde", "accessed_at": "2026-07-02"}, {"url": "https://service.duesseldorf.de/online-dienst-auslaenderbehoerde", "title": "Serviceportal Düsseldorf — Online-Dienst Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='essen'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://www.essen.de/rathaus/onlinetermine_der_stadtessen.de.html', 'Bürgeramt (citizens'' office)', NULL, NULL, 'A base allotment of slots opens 6 weeks ahead, with extra capacity released 1 week ahead and same-day each morning before office hours', 0, NULL, 'Essen registers you at district **Bürgerläden / Bürgeramt** offices booked via the city''s online-Termin system. Bring your Wohnungsgeberbestätigung and passport, and book early.', 'published', '[{"url": "https://www.essen.de/rathaus/onlinetermine_der_stadtessen.de.html", "title": "Stadt Essen — Online-Termine", "accessed_at": "2026-07-02"}, {"url": "https://www.essen.de/buergeraemter", "title": "Serviceportal Stadt Essen — Bürgeramt", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='essen'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/42944/show', 'Staatsangehörigkeits- und Ausländerangelegenheiten (ABH) Essen', 'Kruppstraße 16, 45128 Essen', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Essen''s Ausländerbehörde (ABH) books appointments by phone via the ServiceCenter on 0201-88-38883 (Mon, Tue, Thu 07:30–15:00; Wed, Fri 07:30–12:00), or by email for eAT pickup appointments specifically at 38883@abh.essen.de.', 'published', '[{"url": "https://www.essen.de/leben/migration_und_integration/staatsangehoerigkeits__und_auslaenderangelegenheiten/terminvereinbarung.de.html", "title": "Stadt Essen — Terminvereinbarung Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='frankfurt'), (select id from tasks where slug='anmeldung'), true, true, null, 'https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen', 'Bürgeramt (citizens'' office)', NULL, 'Mon & Wed: walk-in possible; Tue, Thu, Fri: appointment required', 'New slots release each weekday at 06:00, two weeks ahead — check the portal in the morning, or set a Terminwunsch alert for automatic email notification', 0, NULL, 'Frankfurt''s **Bürgerämter** are in high demand as an international hub. Book online as soon as you have a fixed address — ideally the day you move in — and watch for freshly released slots, which get taken quickly.', 'published', '[{"url": "https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen", "title": "Frankfurt.de — Online-Terminvereinbarungen", "accessed_at": "2026-07-02"}, {"url": "https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/buergeramt-statistik-und-wahlen/buergeraemter/terminservice", "title": "Frankfurt.de — Bürgerämter Terminservice", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='frankfurt'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://frankfurt.de/auslaenderangelegenheiten', 'Ausländerbehörde Frankfurt', 'Kleyerstraße 86, 60326 Frankfurt am Main (second entrance: Rebstöcker Straße 4)', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Frankfurt''s Ausländerbehörde doesn''t use a simple public calendar for new applications — you submit your request online first, and a caseworker then assigns you an appointment (some departments send a separate online-booking link after you apply). Phone hotline: +49 69 212-42485, Mon–Thu 08:00–16:00, Fri 08:00–12:00. As a major international city, demand is high — apply as early as possible.', 'published', '[{"url": "https://frankfurt.de/auslaenderangelegenheiten", "title": "Frankfurt.de — Ausländerangelegenheiten", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='hamburg'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin', 'Bürgeramt (citizens'' office)', NULL, 'Varies by location — main Hamburg Service centers typically Mon–Fri 07:00–19:00', 'Often several weeks — book as early as you can', 0, NULL, 'Hamburg runs Anmeldung through district **Kundenzentren** (customer centres), not one central office. Book via the Hamburg Serviceportal for any centre with a free slot — availability varies a lot between districts, so check several. Bring your Wohnungsgeberbestätigung and passport.', 'published', '[{"url": "https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin", "title": "HamburgService — online appointment booking", "accessed_at": "2026-07-02"}, {"url": "https://www.hamburg.de/service/suche/termin/", "title": "hamburg.de — service search", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='hamburg'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.hamburg.de/go/17584', 'Ausländerbehörde Hamburg', 'Hammer Str. 30–34, 22041 Hamburg', NULL, 'Appointment allocation can take several weeks to months — in urgent cases you can call and request an earlier slot', null, 'Roughly €50–140 depending on permit type and duration', 'Hamburg''s immigration matters are handled by the Ausländerbehörde at Hammer Straße. Visits without a booked appointment are generally not possible — book online well before your current permit expires; if no slot is available in time, submit your application in writing to preserve your legal stay.', 'published', '[{"url": "https://www.hamburg.de/go/17584", "title": "hamburg.de — Ausländerbehörde appointment booking", "accessed_at": "2026-07-02"}, {"url": "https://www.hamburg.de/auslaenderbehoerde/", "title": "hamburg.de — Ausländerbehörde", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='hannover'), (select id from tasks where slug='anmeldung'), true, true, null, 'https://serviceportal.hannover-stadt.de/buergerservice/online/angebot/buergeramt-termin-buchen-900000037-30810.html', 'Bürgeramt (citizens'' office)', NULL, NULL, 'New online slots release daily around 08:00. Walk-in possible Thursdays 08:00–13:00 & 14:00–18:00 at the Aegi, Bemerode, Herrenhausen, Linden and Podbi-Park offices only (not at Döhren, Ricklingen, Sahlkamp or Schützenplatz).', 0, NULL, 'In Hannover the region''s **Bürgerämter** handle Anmeldung across several district offices. Book online and check more than one location if your nearest is fully booked.', 'published', '[{"url": "https://www.hannover.de/Leben-in-der-Region-Hannover/B%C3%BCrger-Service/B%C3%BCrger-Service-in-der-Landeshauptstadt-Hannover/Termine-bei-Beh%C3%B6rden-buchen/Terminvereinbarung-in-den-B%C3%BCrger%C3%A4mtern", "title": "Hannover.de — Terminvereinbarung in den Bürgerämtern", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='hannover'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://auslaenderbehoerdeonline.hannover-stadt.de/', 'HannoverServiceCenter (HSC)', 'Am Schützenplatz 1, 30169 Hannover', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'If you live within the city of Hannover, the HannoverServiceCenter (HSC) handles residence permits — many applications can be submitted directly online without an in-person visit. If you live elsewhere in the wider Region Hannover, a separate body applies instead: the Ausländerbehörde der Region Hannover (Team Zuwanderung), Maschstraße 17, 30169 Hannover — check which one covers your registered address.', 'published', '[{"url": "https://www.hannover.de/Leben-in-der-Region-Hannover/B%C3%BCrger-Service/Ausl%C3%A4nder%C2%ADangelegen%C2%ADheiten/Ausl%C3%A4nderbeh%C3%B6rden/Ausl%C3%A4nderbeh%C3%B6rde-der-Region-Hannover", "title": "Hannover.de — Ausländerbehörden overview", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='leipzig'), (select id from tasks where slug='anmeldung'), false, true, null, 'https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/aemtertermine-online/', 'Bürgeramt (citizens'' office)', NULL, NULL, 'Walk-in is possible during opening hours (since Nov 2023) — check current wait times online. If you prefer an appointment, new slots release daily at 17:00, two weeks ahead.', 0, NULL, 'Leipzig has grown fast, so its **Bürgerämter** book out quickly. Reserve a slot through the city portal as soon as you can, and check both the central and district offices.', 'published', '[{"url": "https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/aemtertermine-online/", "title": "Stadt Leipzig — Ämtertermine online", "accessed_at": "2026-07-02"}, {"url": "https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/buergerbueros/", "title": "Stadt Leipzig — Bürgerbüros", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='leipzig'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.leipzig.de/jugend-familie-und-soziales/auslaender-und-migranten/auslaender-und-staatsangehoerigkeitsrecht-auslaenderbehoerde/aufenthalt/vom-antrag-zum-aufenthaltsdokument', 'Ausländerbehörde Leipzig', 'Technisches Rathaus, Haus B, Eingang Prager Straße 128, Leipzig', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Leipzig''s Ausländerbehörde works differently from a public booking calendar: after your application is fully processed, the office automatically mails you an appointment. For collecting your finished eAT card, you instead get a code by post that you use to self-book a pickup slot online. Walk-in visits without an appointment are not possible.', 'published', '[{"url": "https://www.leipzig.de/jugend-familie-und-soziales/auslaender-und-migranten/auslaender-und-staatsangehoerigkeitsrecht-auslaenderbehoerde/aufenthalt/vom-antrag-zum-aufenthaltsdokument", "title": "Stadt Leipzig — Vom Antrag zum Aufenthaltsdokument", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='munich'), (select id from tasks where slug='anmeldung'), false, true, false, 'https://stadt.muenchen.de/buergerservice/terminvereinbarung.html', 'Bürgerbüro (KVR)', 'Ruppertstraße 19, 80337 München (main office; several branch offices exist)', 'Mon–Fri mornings; extended hours on Thursdays — check stadt.muenchen.de', 'Same day to 2 weeks', 0, NULL, 'Munich''s Bürgerbüros accept **walk-ins with a queue ticket**, but daily ticket numbers are limited — arrive early in the morning, especially at the main KVR office.

Booking an appointment online is still the more predictable option and usually possible within days at one of the branch offices (Leonrodstraße, Forstenrieder Allee, Orleansplatz, Riesenfeldstraße).', 'published', '[{"url": "https://stadt.muenchen.de/buergerservice/terminvereinbarung.html", "title": "Stadt München — Terminvereinbarung Bürgerbüro", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='munich'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://stadt.muenchen.de/buergerservice/ausland-migration.html', 'Ausländerbehörde München (KVR)', 'Ruppertstr. 19, 80337 München', 'Service line reachable Mon–Thu 07:30–15:30, Fri 07:30–13:00', 'Appointment allocation can take several weeks to months; new slots release 10 minutes before each opening (morning and afternoon), Mon–Fri', null, 'Roughly €50–140 depending on permit type and duration', 'In Munich the KVR (Kreisverwaltungsreferat) at Ruppertstraße 19 handles residence permits, in the same building as its Bürgerbüro Anmeldung services. Visits without a booked appointment are generally not possible — in genuine emergencies you can call and ask for an earlier slot.', 'published', '[{"url": "https://stadt.muenchen.de/buergerservice/ausland-migration.html", "title": "Landeshauptstadt München — Aufenthalt und Migration", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='nuremberg'), (select id from tasks where slug='anmeldung'), true, true, null, 'https://nuernberg.termine-reservieren.de/', 'Bürgeramt Mitte', 'Äußere Laufer Gasse 25, Nürnberg', 'Wed 08:00–12:00: walk-in for urgent cases only (Bürgeramt Mitte); otherwise by appointment', 'Slots for the next 14 days release daily at 06:30, with extra same-day slots released around 08:00', 0, NULL, 'Nuremberg''s Bürgerämter require an appointment, bookable online or by calling 0911 231-0. For urgent cases without a booked slot, Bürgeramt Mitte allows walk-ins Wednesday mornings only.', 'published', '[{"url": "https://nuernberg.termine-reservieren.de/", "title": "Terminvereinbarung Stadt Nürnberg", "accessed_at": "2026-07-02"}, {"url": "https://www.nuernberg.de/internet/buergeramt_mitte/termine.html", "title": "Nürnberg.de — Bürgeramt Mitte Termine", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-02', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='nuremberg'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.nuernberg.de/internet/auslaenderbehoerde/aufenthaltstitel.html', 'Amt für Migration und Integration der Stadt Nürnberg', NULL, NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Nuremberg''s Amt für Migration und Integration handles residence permits mostly online: you submit your application via the city''s portal, and once your documents are complete, you''re invited by post to an in-person appointment (the letter specifies the exact location). Appointments run through the city''s official booking portal.', 'published', '[{"url": "https://www.nuernberg.de/internet/auslaenderbehoerde/", "title": "Amt für Migration und Integration der Stadt Nürnberg", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='stuttgart'), (select id from tasks where slug='anmeldung'), true, null, null, 'https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42', 'Bürgeramt (citizens'' office)', NULL, NULL, 'Often several weeks — book as early as you can', 0, NULL, 'Stuttgart registers at district **Bürgerbüros**. Book online early, especially around summer and semester starts. Checking a less central Bürgerbüro can get you an earlier appointment.', 'published', '[{"url": "https://www.stuttgart.de/en/service/buergerbueros", "title": "Stuttgart.de — Citizens'' Bureaus", "accessed_at": "2026-07-02"}, {"url": "https://service.stuttgart.de/ssc-app-stuttgart/?m=32-42", "title": "Stuttgart — Terminservice", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com'),
  ((select id from cities where slug='stuttgart'), (select id from tasks where slug='residence-permit'), true, false, null, 'https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung', 'Ausländerbehörde Stuttgart', 'Eberhardstraße 39, 70173 Stuttgart', NULL, 'Often several weeks to a few months — apply well before your current permit expires', null, 'Roughly €50–140 depending on permit type and duration', 'Stuttgart''s Ausländerbehörde requires an appointment for all visits. For collecting your finished eAT card, booking depends on your application date — permits applied for since 17 Feb 2025 trigger an automatic email notification once the card arrives, which you then use to book a collection slot. If your permit or Fiktionsbescheinigung is expiring within 7 days, you can request an emergency appointment online rather than risk a gap in your legal stay.', 'published', '[{"url": "https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung", "title": "Stuttgart.de — Ausländerbehörde appointment", "accessed_at": "2026-07-02"}, {"url": "https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/notfall-termin", "title": "Stuttgart.de — Emergency appointment", "accessed_at": "2026-07-02"}]'::jsonb, '2026-07-03', 'hand-written', 'patelmeet.2905@gmail.com')
on conflict (city_id, task_id, locale) do update set appointment_required=excluded.appointment_required, walk_in_possible=excluded.walk_in_possible, online_possible=excluded.online_possible, booking_url=excluded.booking_url, office_name=excluded.office_name, office_address=excluded.office_address, office_hours=excluded.office_hours, typical_wait_time=excluded.typical_wait_time, fees_eur=excluded.fees_eur, fees_note=excluded.fees_note, city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources, last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

-- ---- letters (full set) ----
insert into letters (slug, title_de, title_en, sender, what_it_means_md, what_to_do_md, deadline_note, looks_like_md, related_task_id, urgency, status, last_verified_at) values
  ('anmeldebestaetigung', 'Anmeldebestätigung / Meldebescheinigung', 'Registration confirmation', 'Bürgeramt (citizens'' office)', 'This is the **confirmation that you registered your address (Anmeldung)** — the single most-requested document for newcomers. Banks, employers, the immigration office and mobile providers all ask for it. It is not a bill or a demand; it''s proof, and you should guard it.', '1. Check that your name and address are spelled correctly.
2. Make several photocopies or scans — you''ll be asked for it repeatedly.
3. Store the original safely; if you lose it, you can request a new **Meldebescheinigung** from the Bürgeramt (usually for a small fee).', NULL, 'A stamped sheet from the Bürgeramt/Bürgerbüro headed "Anmeldebestätigung" or "Meldebescheinigung", showing your name and registered address.', (select id from tasks where slug='anmeldung'), 'info', 'published', '2026-07-02'),
  ('arbeitszeugnis', 'Arbeitszeugnis', 'Employment reference letter', 'Your (former) employer', 'A written job reference you are legally entitled to when leaving a job. German references use coded, polite-sounding language where the exact wording secretly signals your performance grade.', '1. Always request one when leaving — you have a legal right to it.
2. Have the wording checked (a Mieterverein-style service or lawyer, or online guides) because coded phrases can hide a poor rating.
3. Ask for corrections if the grade is unfairly low.', NULL, 'A formal company-letterhead document headed "Arbeitszeugnis" describing your role and performance in set phrases.', null, 'info', 'published', '2026-07-03'),
  ('auslaenderbehoerde-document-request', 'Aufforderung zur Vorlage von Unterlagen', 'Ausländerbehörde document request', 'Ausländerbehörde (local immigration office)', 'The immigration office is **asking you to submit additional documents** for your residence-permit application, or inviting you to an appointment. This is a normal part of processing — but it usually comes with a deadline, and not responding can stall or endanger your application.', '1. Read carefully which documents are requested (a translation app or our letter helper can help).
2. Gather them — common requests are proof of income, health insurance, or a valid passport.
3. Submit them by the stated method (post, email or in person) before the deadline.
4. If you can''t get a document in time, contact the office in writing to explain and ask for an extension.', 'A response deadline (Frist) is almost always stated — missing it can lead to your application being rejected.', 'Official letter from your city''s Ausländerbehörde, referencing your case number (Aktenzeichen) and listing requested documents (Unterlagen).', (select id from tasks where slug='residence-permit'), 'action-needed', 'published', '2026-07-02'),
  ('beitragsservice-anmeldung', 'Rundfunkbeitrag — Anmeldung', 'Broadcasting fee — registration letter', 'ARD ZDF Deutschlandradio Beitragsservice', 'Shortly after your Anmeldung you will get a letter asking you to register your household for the broadcasting fee (**Rundfunkbeitrag**, ~€18.36/month). This is **genuine and mandatory** — it is not a scam, even though the letter is unsolicited.

The fee is **per household**, not per person. If a flatmate already pays for your address, you don''t pay again.', '1. If nobody in your household pays yet: fill in the enclosed form or register at rundfunkbeitrag.de.
2. If a flatmate already pays: reply with their **Beitragsnummer** (account number) to link your name to the existing payment.
3. Do **not** simply ignore the letter — non-response leads to estimated fee notices and eventually enforcement.', 'Reply within the period stated in the letter (usually 4 weeks) to avoid estimated back-payments.', 'White letter, blue logo "ARD ZDF Deutschlandradio", sender "Beitragsservice, 50656 Köln". Contains a pre-filled response form with a Beitragsnummer.', (select id from tasks where slug='rundfunkbeitrag'), 'action-needed', 'published', '2026-07-02'),
  ('finanzamt-steuernummer', 'Mitteilung der Steuernummer', 'Tax number notice (for freelancers/self-employed)', 'Finanzamt (local tax office)', 'This letter assigns you a **Steuernummer** — different from your lifelong Steuer-ID. The Steuernummer is issued by your local Finanzamt when you register a freelance or self-employed activity, and you put it on the invoices you send to clients. If you''re only an employee, you generally don''t need one.', '1. Note the Steuernummer and use it on your invoices (Rechnungen).
2. Keep it separate in your mind from your Steuer-ID (the 11-digit lifelong number) — both exist and are used for different things.
3. Store the letter; you''ll reference the number in your tax filings.', NULL, 'Letter from your local Finanzamt assigning a "Steuernummer" (format varies by state), often following your Fragebogen zur steuerlichen Erfassung (tax registration questionnaire).', (select id from tasks where slug='tax-id'), 'info', 'published', '2026-07-02'),
  ('krankenkasse-beitragsbescheid', 'Mitgliedsbescheinigung / Beitragsbescheid', 'Health-insurance membership & contribution notice', 'Your Krankenkasse (e.g. TK, AOK, Barmer)', 'This letter from your public health insurer either confirms your **membership (Mitgliedsbescheinigung)** or states your **monthly contribution (Beitragsbescheid)**. The membership confirmation is the document your employer or university needs as proof you''re insured; the contribution notice tells you how much you pay and why.

It is routine, not a problem — but the membership certificate is important to keep.', '1. If it''s a Mitgliedsbescheinigung, forward a copy to your employer or university — they usually require it.
2. If it''s a Beitragsbescheid, check the contribution amount matches your income and status (students and low earners pay reduced rates).
3. Keep the letter with your important documents.', NULL, 'Letter on your Krankenkasse''s letterhead (TK, AOK, Barmer, DAK, etc.), referencing your Versichertennummer (insurance number).', (select id from tasks where slug='health-insurance'), 'info', 'published', '2026-07-02'),
  ('lohnsteuerbescheinigung', 'Lohnsteuerbescheinigung', 'Annual income-tax certificate', 'Your employer', 'A once-a-year summary from your employer of your total gross pay and the tax + social contributions withheld. You need it to file your tax return.', '1. Keep it safe — you enter its figures into your tax return.
2. Check it roughly matches your December payslip''s year-to-date totals.
3. No payment or action is required by itself.', NULL, 'A one-page statement headed "Ausdruck der elektronischen Lohnsteuerbescheinigung" with numbered boxes of yearly totals.', (select id from tasks where slug='tax-id'), 'info', 'published', '2026-07-03'),
  ('mahnbescheid', 'Mahnbescheid', 'Court order for payment', 'Local court (Amtsgericht), on a yellow form', 'A **court-issued** demand for payment (not the same as a company''s Mahnung). It means a creditor has taken the debt to the court''s automated dunning process. Ignoring it lets them enforce the debt against you.', '1. Do not ignore it — this is serious.
2. If the claim is wrong or you dispute it, tick the objection (**Widerspruch**) box and return it within the deadline.
3. If it''s valid, pay or arrange payment. Get advice if unsure — the deadline is short.', 'You have **two weeks** from delivery to object (Widerspruch) — miss it and it becomes enforceable.', 'A distinctive **yellow** form headed "Mahnbescheid" from an Amtsgericht, with a tear-off objection slip.', null, 'urgent', 'published', '2026-07-03'),
  ('mahnung', 'Mahnung', 'Payment reminder', 'Any company or public authority', 'A **Mahnung** is a formal reminder that a payment is overdue. German dunning follows predictable stages: a friendly reminder (Zahlungserinnerung), then one or more Mahnungen with added fees (Mahngebühren), and eventually escalation to a debt collector (Inkasso) or a court dunning order (Mahnbescheid). Ignoring a Mahnung is what turns a small bill into a serious problem — never throw one away unread.', '1. Identify what the claim is for and whether it''s actually valid.
2. If it''s correct, pay the amount (including any fees) before the new deadline.
3. If it''s wrong or you don''t recognise it, dispute it in writing (Widerspruch) and keep a copy — do not just ignore it.
4. If you receive a court **Mahnbescheid** (yellow form), you must object within the stated period or it becomes legally enforceable.', 'Each Mahnung sets a new payment deadline; a court Mahnbescheid has a strict objection window (usually two weeks).', 'A letter headed "Mahnung", "Zahlungserinnerung" or (for the court version) "Mahnbescheid" on a distinctive yellow form, stating an overdue amount and a new deadline.', null, 'urgent', 'published', '2026-07-02'),
  ('mieterhoehung', 'Mieterhöhung', 'Rent increase notice', 'Your landlord', 'Your landlord is proposing to raise the rent. In Germany increases are tightly regulated — there are caps, waiting periods, and the landlord must justify it (e.g. by the local **Mietspiegel**).', '1. Do not just sign — check whether the increase follows the legal rules and caps for your area.
2. You normally must actively **agree** to a standard increase; you have a review period.
3. If unsure, a tenants'' association (Mieterverein) will check it cheaply.', 'You typically have until the end of the second month after receiving it to agree; get advice before that runs out.', 'A letter headed "Mieterhöhung" citing the Mietspiegel or comparable flats, showing old vs new rent and asking for your agreement.', null, 'action-needed', 'published', '2026-07-03'),
  ('nebenkostenabrechnung', 'Betriebskosten-/Nebenkostenabrechnung', 'Annual utility bill reconciliation', 'Your landlord / property manager', 'Once a year your landlord reconciles the actual running costs (heating, water, etc.) against the monthly advance you paid. You either **get money back** or must **pay extra (Nachzahlung)**.', '1. Check the period and that costs look reasonable.
2. If you owe money, pay by the deadline.
3. You have the right to inspect the underlying receipts, and to object in writing within the stated period if something looks wrong.', 'You can usually object within a set period (often stated on the letter); the landlord must send it within 12 months of the period ending.', 'A multi-page statement headed "Betriebskostenabrechnung" or "Nebenkostenabrechnung" with a table of cost types and a final Guthaben (credit) or Nachzahlung (amount due).', null, 'action-needed', 'published', '2026-07-03'),
  ('rundfunkbeitrag-festsetzungsbescheid', 'Festsetzungsbescheid (Rundfunkbeitrag)', 'Broadcasting-fee assessment notice', 'ARD ZDF Deutschlandradio Beitragsservice', 'This is a formal notice that the Beitragsservice has **assessed unpaid broadcasting fees** against you — usually because an earlier registration or payment request went unanswered. Unlike the first friendly letter, a Festsetzungsbescheid is an official administrative act with legal force, and the amount can grow with late fees (Säumniszuschlag) if ignored.

It is genuine and enforceable — the Beitragsservice can ultimately have the debt collected through the courts.', '1. Check whether the fee actually applies to you — if a flatmate already pays for your household, you may not owe it (respond with their **Beitragsnummer**).
2. If you do owe it, pay the stated amount or set up a payment plan.
3. If you believe it''s wrong, file a written objection (**Widerspruch**) within the deadline stated on the notice.
4. Do not ignore it — non-payment leads to enforcement (Vollstreckung).', 'The objection deadline (Widerspruchsfrist) is stated on the notice — usually one month from delivery.', 'Formal letter headed "Festsetzungsbescheid", from "ARD ZDF Deutschlandradio Beitragsservice, 50656 Köln", showing an assessed amount and a Beitragsnummer.', (select id from tasks where slug='rundfunkbeitrag'), 'urgent', 'published', '2026-07-02'),
  ('steuer-id-mitteilung', 'Mitteilung der steuerlichen Identifikationsnummer', 'Notification of your tax ID', 'Bundeszentralamt für Steuern', 'This letter contains your permanent 11-digit **tax ID (Steuer-ID)**. It arrives automatically 2–4 weeks after your first Anmeldung. You keep this number for life — it never changes, even when you move.', '1. Give the number to your **employer** (otherwise you are taxed at the maximum rate — refundable, but painful).
2. Give it to your **bank** and **health insurer** when asked.
3. Store the letter permanently; requesting the number again takes weeks.', NULL, 'Official letter from "Bundeszentralamt für Steuern", Bonn. The 11-digit number is printed in a highlighted box labeled "Identifikationsnummer".', (select id from tasks where slug='tax-id'), 'info', 'published', '2026-07-02'),
  ('steuerbescheid', 'Steuerbescheid', 'Tax assessment notice', 'Finanzamt (tax office)', 'The tax office''s official decision after you file a tax return: it states whether you get a **refund (Erstattung)** or must **pay more (Nachzahlung)**. Most employees who file get a refund.', '1. Compare the figures with your own return.
2. If it matches, a refund is paid to your bank automatically; a Nachzahlung must be paid by the deadline.
3. If it looks wrong, you can file an objection (**Einspruch**) within one month.', 'Objection deadline (Einspruchsfrist) is one month from delivery — stated on the notice.', 'A multi-page letter headed "Bescheid für [year] über Einkommensteuer" from your Finanzamt, ending with a refund or amount-due figure.', (select id from tasks where slug='tax-id'), 'action-needed', 'published', '2026-07-03')
on conflict (slug, locale) do update set title_de=excluded.title_de, title_en=excluded.title_en, sender=excluded.sender, what_it_means_md=excluded.what_it_means_md, what_to_do_md=excluded.what_to_do_md, deadline_note=excluded.deadline_note, looks_like_md=excluded.looks_like_md, related_task_id=excluded.related_task_id, urgency=excluded.urgency, status=excluded.status, last_verified_at=excluded.last_verified_at;

-- ---- problems (full set) ----
insert into problems (slug, title_en, description_md, category_id, related_task_ids, severity, status, last_verified_at, generated_by) values
  ('abmeldung-when-leaving', 'How to deregister (Abmeldung) when you leave Germany', 'When you move out of Germany for good (or sometimes within it), you must **deregister** your address (Abmeldung). Skipping it means you keep being liable for the Rundfunkbeitrag and stay on the tax register.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('apartment-hunt-scams', 'Avoiding rental scams while apartment-hunting', 'Germany''s tight housing market breeds scams: fake listings, "pay the deposit before viewing", or landlords who ask for money by wire to hold a flat you never see. Newcomers are prime targets.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'high', 'published', '2026-07-03', 'hand-written'),
  ('appointment-after-visa-expiry', 'The only appointment is after your visa expires', 'You need to extend or convert your residence permit, but the earliest Ausländerbehörde appointment the booking system offers is **after** your current visa runs out. It feels like the office is forcing you into illegality through no fault of your own.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit'),(select id from tasks where slug='visa-conversion')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('auslaenderbehoerde-not-responding', 'The Ausländerbehörde won''t answer your emails', 'You''ve emailed the immigration office (Ausländerbehörde) about your residence permit — maybe several times — and heard nothing back for weeks or months. Meanwhile your visa is ticking down. This silence is one of the most stressful experiences newcomers face, because the office that controls your legal status simply isn''t responding.

The key thing to understand: as long as you **applied before your permit expired**, your stay usually remains legal while you wait, and you can request a Fiktionsbescheinigung as proof.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit'),(select id from tasks where slug='fiktionsbescheinigung')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('bank-account-chicken-and-egg', 'Bank wants Anmeldung, landlord wants a bank account', 'Many landlords want to see a German bank account (and SCHUFA) before renting to you, while traditional banks want your Anmeldebestätigung before opening an account. Newcomers get stuck in the loop.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='anmeldung'),(select id from tasks where slug='bank-account')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('blocked-account-release-delay', 'The money in your blocked account won''t release', 'You have money sitting in your blocked account (Sperrkonto) but can''t access the monthly amount you''re entitled to. This is a serious cash-flow problem when rent and living costs are due and your own funds are locked away.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='blocked-account')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('cancelling-contracts-minimum-term', 'Contracts you can''t easily cancel (phone, gym, internet)', 'German contracts often lock you in for 12–24 months and auto-renew unless cancelled in writing on time. Newcomers get stuck paying for services they no longer use.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('changing-krankenkasse', 'Switching your public health insurer (Krankenkasse)', 'Public insurers (TK, AOK, Barmer, DAK...) offer legally near-identical coverage but differ in service, English support and the small extra contribution rate (Zusatzbeitrag). You''re allowed to switch — many people never realise it.', (select id from task_categories where slug='health'), array[(select id from tasks where slug='health-insurance')]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('citizenship-eligibility', 'When can you apply for German citizenship?', 'Germany''s naturalisation rules changed recently, shortening the usual residence requirement and allowing dual citizenship in more cases. Worth checking if you now qualify.', (select id from task_categories where slug='residence'), array[]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('deposit-not-returned', 'Your landlord won''t return the deposit (Kaution)', 'You moved out but your landlord is withholding some or all of your deposit — sometimes for vague "damage" or long after the legal timeframe. Deposits are legally protected and must come back.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('driving-foreign-licence-6-months', 'Driving on your foreign licence — the 6-month rule', 'You can usually drive on a non-EU licence for only about **6 months** after registering in Germany. After that it may no longer be valid — even if it hasn''t expired — and driving on it can count as driving without a licence.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='driving-license')]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('english-speaking-doctor', 'Finding an English-speaking doctor', 'Falling ill in a new country is stressful when you don''t speak the language. Finding an English-speaking GP (Hausarzt) or specialist takes a few known tricks.', (select id from task_categories where slug='health'), array[(select id from tasks where slug='health-insurance')]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('expired-fiktionsbescheinigung', 'Your Fiktionsbescheinigung expired while you''re still waiting', 'Your bridging certificate (**Fiktionsbescheinigung**) has run out but the Ausländerbehörde still hasn''t decided on your residence permit. You''re left unsure whether you''re still legally in the country or allowed to work and travel.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit'),(select id from tasks where slug='fiktionsbescheinigung')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('family-reunion-visa', 'Bringing your spouse or family to Germany', 'Family reunion (Familiennachzug) lets you bring a spouse and children, but it has conditions — enough income and living space, and often a basic-German (A1) certificate for the spouse. The process runs partly through the German embassy abroad.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit')]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('finding-a-flat-tight-market', 'Actually finding a flat in a tight market', 'In cities like Berlin and Munich, hundreds apply for one flat. Newcomers without a German rental history or SCHUFA feel locked out. It''s hard, but there are strategies that work.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'high', 'published', '2026-07-03', 'hand-written'),
  ('german-only-counter-staff', 'The official at the counter only speaks German', 'You finally got your appointment, but the clerk speaks little or no English and you speak little or no German. The appointment feels like it''s slipping away over a language gap, with an official decision hanging on whether you can communicate.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung'),(select id from tasks where slug='residence-permit')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('german-only-forms', 'Every form and letter is in German only', 'German offices overwhelmingly communicate in German — application forms, official letters, even signs at the counter. As a newcomer who doesn''t yet speak the language, this is a constant barrier that makes routine tasks feel impossible and risks you missing something important.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('having-a-baby-in-germany', 'Having a baby in Germany as an international', 'A birth triggers a cascade of paperwork: birth certificate (Geburtsurkunde), registering the baby, adding them to your health insurance, Kindergeld, Elterngeld, and sometimes a residence permit for the child.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('integration-course-needed', 'Do you need an integration or German language course?', 'Some residence permits come with an **obligation** to attend an integration course (German + "life in Germany"); for others it''s a voluntary right you can claim cheaply. Ignoring an obligation can affect permit extensions.', (select id from task_categories where slug='work'), array[]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('kindergeld-for-families', 'Claiming child benefit (Kindergeld) as an international family', 'If you live and work in Germany with children, you''re usually entitled to **Kindergeld** — a monthly payment per child — regardless of nationality, as long as your residence status allows it. Many families don''t know they qualify.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('lost-job-on-work-permit', 'You lost your job on a work-based residence permit', 'Losing your job doesn''t instantly end your residence permit, but it does start a clock: you must inform the Ausländerbehörde, and you typically get a limited window (often around 3–6 months) to find new employment before your status is at risk.', (select id from task_categories where slug='work'), array[(select id from tasks where slug='residence-permit'),(select id from tasks where slug='work-permit-change')]::uuid[], 'high', 'published', '2026-07-03', 'hand-written'),
  ('lost-residence-permit-eat', 'You lost your residence permit card (eAT)', 'Your electronic residence permit (eAT) card is lost or stolen. It''s your proof of legal status, so you need a replacement promptly — and to protect yourself against misuse.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit')]::uuid[], 'high', 'published', '2026-07-03', 'hand-written'),
  ('missed-official-deadline', 'You missed a deadline in an official letter', 'An official letter had a deadline (Frist) — for an objection, a payment or a document — and you missed it, maybe because the letter arrived late, went to an old address, or you couldn''t read it in time. In Germany, deadlines carry real consequences.', (select id from task_categories where slug='daily-life'), array[]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('missing-home-country-documents', 'A required document from your home country is missing or not accepted', 'An office asks for a birth certificate, marriage certificate or diploma from your home country — but you don''t have it, or the version you have isn''t accepted because it lacks an apostille or a certified German translation.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit'),(select id from tasks where slug='qualification-recognition')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('missing-wohnungsgeberbestaetigung', 'Landlord won''t provide the Wohnungsgeberbestätigung', 'Without the signed landlord confirmation you cannot register — a rental contract is not accepted. The problem is worst in sublets and shared flats (WGs), where the main tenant may not respond or may not want the sublet to be visible.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('no-anmeldung-appointments', 'No registration appointments available for weeks', 'You must register within two weeks of moving in — but the booking portal shows no free appointments for a month or more. This is the single most common frustration for newcomers in big cities, and it blocks everything downstream: tax ID, bank account, residence permit.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('no-schufa-record', 'Landlords reject you because you have no SCHUFA history', 'You''re applying for apartments but keep getting rejected because you have no **SCHUFA** credit record yet. As a newcomer this feels like a catch-22: you can''t build a credit history without living here, and you can''t get a flat without one.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='schufa')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('pension-refund-when-leaving', 'Reclaiming your pension contributions when you leave Germany', 'Little-known but valuable: if you''re a **non-EU** national and leave Germany for good, you can often get your paid-in **pension (Rentenversicherung) contributions refunded** after a waiting period. Many people leave this money behind.', (select id from task_categories where slug='money'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('permanent-residence-eligibility', 'When can you get permanent residence (Niederlassungserlaubnis)?', 'Many internationals don''t realise they qualify for **permanent residence** sooner than they think — sometimes after just 21–33 months on a Blue Card, or ~5 years otherwise, with income, pension contributions and German skills.', (select id from task_categories where slug='residence'), array[(select id from tasks where slug='residence-permit')]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('public-vs-private-insurance-trap', 'Choosing private health insurance you can''t undo', 'A private health insurance (PKV) offer looks cheaper than public (GKV) — attractive when you''re young, healthy and counting every euro. But private insurance gets much more expensive with age, and switching back to public is often difficult or outright impossible. Students in particular can get locked out of the public system for the rest of their studies by opting out early.', (select id from task_categories where slug='health'), array[(select id from tasks where slug='health-insurance')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('queue-ticket-confusion', 'Confused by queues and ticket systems even with an appointment', 'You arrive at the office and there are multiple queues, a ticket machine with German-only categories, and no clear sign of where someone with an appointment should go. It''s easy to wait in the wrong line and miss your slot.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'low', 'published', '2026-07-02', 'hand-written'),
  ('rundfunkbeitrag-confusion', 'Confusing or scary-looking broadcasting-fee letters', 'You keep getting letters from the "Beitragsservice" demanding the broadcasting fee (**Rundfunkbeitrag**), sometimes for a flat where a roommate already pays, or in threatening-looking envelopes that seem like a scam. Many newcomers either panic or ignore them — both are mistakes.', (select id from task_categories where slug='daily-life'), array[(select id from tasks where slug='rundfunkbeitrag')]::uuid[], 'low', 'published', '2026-07-02', 'hand-written'),
  ('scheinanmeldung-risk', 'Registering at an address where you don''t really live', 'You can''t find a flat, so someone offers to let you register (Anmeldung) at their address even though you won''t live there — or a "landlord" offers a paid registration. This is a **Scheinanmeldung** (sham registration), and it is illegal for everyone involved.', (select id from task_categories where slug='registration'), array[(select id from tasks where slug='anmeldung')]::uuid[], 'high', 'published', '2026-07-02', 'hand-written'),
  ('slow-qualification-recognition', 'Your qualification recognition is taking forever', 'You applied to have your foreign degree or training **recognized (Anerkennung)**, but months pass with no decision — blocking you from working in a regulated profession or from a better-paid role that requires it.', (select id from task_categories where slug='work'), array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('sperrkonto-monthly-limit', 'Your blocked-account monthly limit is too low to live on', 'Your Sperrkonto releases only a fixed monthly amount, which in an expensive city may not cover rent + living. You can''t simply withdraw more, which causes real cash-flow stress.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='blocked-account')]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('steuererklaerung-tax-return', 'Should you file a German tax return (Steuererklärung)?', 'Many internationals think a tax return is only a burden — but as an employee you''re often owed **money back** (overpaid wage tax, moving costs, commute, first-job expenses). Filing is usually voluntary for employees and frequently worth it.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='tax-id')]::uuid[], 'low', 'published', '2026-07-03', 'hand-written'),
  ('student-work-hours-limit', 'How many hours can a student actually work?', 'International students worry about breaking their visa by working too much. The rule is roughly **120 full or 240 half days per year** (non-EU) — but Werkstudent, semester breaks and self-employment all change the picture.', (select id from task_categories where slug='work'), array[]::uuid[], 'medium', 'published', '2026-07-03', 'hand-written'),
  ('tax-id-never-arrived', 'Your tax ID never arrived and your employer is taxing you at the max rate', 'Your **Steuer-ID** should arrive by post a few weeks after Anmeldung, but it hasn''t — and without it, your employer withholds tax at the highest possible rate. Your first paychecks are painfully small as a result.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='tax-id')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('uninsured-backdated-debt', 'You owe backdated health-insurance contributions', 'Health insurance is mandatory in Germany from your first day of residence. If you had a gap — you arrived, got busy, and only signed up later — the public insurer can charge you contributions for the uninsured months. Newcomers are often shocked by a bill for a period when they weren''t even insured.', (select id from task_categories where slug='health'), array[(select id from tasks where slug='health-insurance')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written'),
  ('wrong-tax-class', 'You''re on the wrong tax class and losing money each month', 'Your monthly net salary looks lower than expected because you''ve been assigned the wrong **tax class (Steuerklasse)** — common after marriage, or when a second job pushes you into Class VI. You''re effectively over-paying tax every month.', (select id from task_categories where slug='money'), array[(select id from tasks where slug='tax-id')]::uuid[], 'medium', 'published', '2026-07-02', 'hand-written')
on conflict (slug, locale) do update set title_en=excluded.title_en, description_md=excluded.description_md, category_id=excluded.category_id, related_task_ids=excluded.related_task_ids, severity=excluded.severity, status=excluded.status, last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by;

-- ---- solutions (delete + reinsert: no natural unique key) ----
delete from solutions;
insert into solutions (problem_id, city_id, title_en, body_md, effectiveness, sort_order, status) values
  ((select id from problems where slug='abmeldung-when-leaving'), null, 'File the Abmeldung with your Bürgeramt', 'Submit the deregistration form (often possible by post or online) around your move-out date — no earlier than a week before. Keep the Abmeldebestätigung; you''ll need it to stop the Rundfunkbeitrag and for tax.', 'official', 1, 'published'),
  ((select id from problems where slug='abmeldung-when-leaving'), null, 'Cancel contracts and tell the tax office', 'Use the Abmeldung to cancel your Rundfunkbeitrag and notify insurers, banks and the Finanzamt. Leaving mid-year may also mean you''re owed a tax refund — worth filing for.', 'workaround', 2, 'published'),
  ((select id from problems where slug='apartment-hunt-scams'), null, 'Never pay before an in-person viewing', 'The biggest red flag is any request for a deposit or "key transfer" fee before you''ve seen the flat and met the landlord. Legitimate landlords don''t ask for money to view.', 'official', 1, 'published'),
  ((select id from problems where slug='apartment-hunt-scams'), null, 'Watch for classic scam signs', 'Landlord "abroad", pressure to act fast, too-good-to-be-true rent, poor-German copy-paste messages, or payment via wire/crypto only — all warning signs. Use a proper deposit account (Mietkautionskonto) only after a signed contract.', 'workaround', 2, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Submit your application in writing before the visa expires', 'What protects your legal stay is a **timely application**, not the appointment date. Send your extension/conversion request by post or the official form before your visa expires, and keep dated proof you did so.', 'official', 1, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Ask for a Fiktionsbescheinigung to bridge the gap', 'Once a timely application is on file, request a Fiktionsbescheinigung — it legally bridges the period between your visa expiring and your appointment.', 'official', 2, 'published'),
  ((select id from problems where slug='appointment-after-visa-expiry'), null, 'Use the emergency counter if the visa is days away', 'If expiry is imminent and you can''t get through, go to the office''s walk-in/emergency counter with your printed application and explain the timing.', 'workaround', 3, 'published'),
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Request a Fiktionsbescheinigung to secure your stay', 'If you applied before your permit expired, your stay is legally bridged. Ask the office in writing for a **Fiktionsbescheinigung** confirming this — it lets you keep living, and usually working, in Germany while you wait.', 'official', 1, 'published'),
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Use the official contact form and go in person', 'Many offices ignore direct emails but track their online contact forms. Failing that, show up at the emergency/walk-in counter (Notfallsprechstunde) with printed proof of your pending application.', 'workaround', 2, 'published'),
  ((select id from problems where slug='auslaenderbehoerde-not-responding'), null, 'Consider an inaction lawsuit (Untätigkeitsklage) as a last resort', 'After roughly **three months** of silence on a complete application, you can file an Untätigkeitsklage at the administrative court to force a decision. This is a formal legal step — consult a lawyer (Fachanwalt für Migrationsrecht) or a migration advice service (Migrationsberatung) before doing it.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='bank-account-chicken-and-egg'), null, 'Open an account that doesn''t need Anmeldung', 'Several banks (typically mobile/online banks such as N26, Revolut or bunq) open accounts with just a passport and a foreign or hotel address. Use it to receive salary and pay rent, then switch or add a traditional bank later if you want one.', 'official', 1, 'published'),
  ((select id from problems where slug='bank-account-chicken-and-egg'), null, 'Ask the bank for an appointment without Steuer-ID', 'Traditional banks can usually open the account with your passport and rental contract, and accept the tax ID later ("Steuer-ID reiche ich nach"). Ask explicitly — counter staff sometimes ask for more than the bank actually requires.', 'workaround', 2, 'published'),
  ((select id from problems where slug='blocked-account-release-delay'), null, 'Complete the activation steps your provider requires', 'Most blocked-account providers only release monthly withdrawals once you''ve uploaded your Anmeldebestätigung (and sometimes your residence permit). Check your provider''s dashboard for a pending step.', 'official', 1, 'published'),
  ((select id from problems where slug='blocked-account-release-delay'), null, 'Escalate through the provider''s support channel', 'If activation is complete but the money still isn''t moving, contact support directly and reference your account number — delays are often a stuck verification on their side.', 'workaround', 2, 'published'),
  ((select id from problems where slug='cancelling-contracts-minimum-term'), null, 'Cancel in writing and on time', 'Note each contract''s minimum term and notice period. Since recent consumer-law changes, many contracts that auto-renew can then be cancelled monthly — check yours.', 'official', 1, 'published'),
  ((select id from problems where slug='cancelling-contracts-minimum-term'), null, 'Use special-termination rights when you move abroad', 'Leaving Germany or moving where a service isn''t available can give a Sonderkündigungsrecht (special cancellation right). Keep proof like your Abmeldung.', 'workaround', 2, 'published'),
  ((select id from problems where slug='changing-krankenkasse'), null, 'Just apply to the new insurer — they handle the switch', 'Pick a new Krankenkasse and sign up; the new insurer usually cancels the old one for you. You can generally switch after 12 months of membership, or sooner if your contribution rate rises.', 'official', 1, 'published'),
  ((select id from problems where slug='changing-krankenkasse'), null, 'Compare service and the Zusatzbeitrag', 'Coverage is legally standardized, so compare the small extra contribution rate, English-language service, and app quality — not the core benefits.', 'workaround', 2, 'published'),
  ((select id from problems where slug='citizenship-eligibility'), null, 'Check the current residence requirement and dual-citizenship rules', 'Recent reforms shortened the usual waiting time and now allow dual citizenship in more cases. Verify the current rules for your situation before assuming you must give up your old passport.', 'official', 1, 'published'),
  ((select id from problems where slug='citizenship-eligibility'), null, 'Apply at your local naturalisation office', 'Requirements include language (usually B1), a citizenship test, secure income and clean record. The Einbürgerung office in your city handles it.', 'official', 2, 'published'),
  ((select id from problems where slug='deposit-not-returned'), null, 'Know the timeline and demand it in writing', 'Landlords may hold a reasonable part briefly to await the annual utility bill, but not indefinitely. Send a written request with a deadline and your bank details.', 'official', 1, 'published'),
  ((select id from problems where slug='deposit-not-returned'), null, 'Escalate via a tenants'' association or small claims', 'A Mieterverein (tenants'' association) will pressure the landlord cheaply; unresolved cases go to the local court, which strongly protects deposits.', 'last-resort', 2, 'published'),
  ((select id from problems where slug='driving-foreign-licence-6-months'), null, 'Exchange your licence before the 6 months run out', 'Start the licence exchange (Umschreibung) at the Führerscheinstelle early — see the driving-licence guide. Whether you need a test depends on your issuing country.', 'official', 1, 'published'),
  ((select id from problems where slug='driving-foreign-licence-6-months'), null, 'Carry a certified translation meanwhile', 'While still within the valid window, carry your licence plus (if not in German/English) a certified translation or International Driving Permit to avoid roadside trouble.', 'workaround', 2, 'published'),
  ((select id from problems where slug='english-speaking-doctor'), null, 'Filter by language on doctor-search sites', 'Major doctor-booking platforms let you filter by spoken language and book online. Your Krankenkasse can also give you a list of English-speaking doctors.', 'official', 1, 'published'),
  ((select id from problems where slug='english-speaking-doctor'), null, 'Ask expat groups and use telemedicine', 'Local expat communities keep recommendations, and several English-language telemedicine services operate in Germany for non-emergencies.', 'workaround', 2, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Get it extended immediately', 'Contact the Ausländerbehörde right away to renew the certificate. As long as your original application was filed on time, the office is generally expected to bridge your stay, not let it lapse.', 'official', 1, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Do not travel outside Germany until it''s renewed', 'An expired Fiktionsbescheinigung can make re-entry difficult or impossible. Hold off on international trips until you have a valid document in hand.', 'official', 2, 'published'),
  ((select id from problems where slug='expired-fiktionsbescheinigung'), null, 'Seek legal advice if the office is unresponsive', 'If you can''t get an extension and your status is genuinely at risk, a migration lawyer or Migrationsberatung can intervene — don''t let it drift.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='family-reunion-visa'), null, 'Meet the income and housing conditions first', 'You generally must show enough income to support your family without benefits, and adequate living space. Sort these before applying — they''re the usual sticking points.', 'official', 1, 'published'),
  ((select id from problems where slug='family-reunion-visa'), null, 'Spouse applies at the German embassy back home', 'The family member usually applies for the reunion visa at the German mission in their country; a basic-German A1 certificate is often required for spouses. Book the embassy appointment early — waits can be long.', 'official', 2, 'published'),
  ((select id from problems where slug='finding-a-flat-tight-market'), null, 'Prepare a complete application folder in advance', 'Have a ready PDF: SCHUFA (or proof you have none yet), last 3 payslips, ID, Anmeldung, and a short intro. Applicants who reply instantly with a full folder win viewings.', 'official', 1, 'published'),
  ((select id from problems where slug='finding-a-flat-tight-market'), null, 'Use sublets (Zwischenmiete) and WG rooms first', 'Start with a temporary sublet or a room in a shared flat (WG) via the usual portals to get an address and build a rental history, then hunt for a permanent place from inside the city.', 'workaround', 2, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Bring a German-speaking companion', 'You''re generally allowed to bring a friend to interpret. A German-speaking helper at the counter removes the language barrier entirely.', 'official', 1, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Prepare a phrase sheet and key terms in advance', 'Write out the German words for what you need (e.g. "Ich möchte mich anmelden") and your key details. Even a printed cheat sheet keeps the appointment moving.', 'workaround', 2, 'published'),
  ((select id from problems where slug='german-only-counter-staff'), null, 'Ask to communicate in writing', 'If speaking fails, ask to write things down ("Können wir das aufschreiben?"). Numbers, dates and addresses are much easier to get right on paper.', 'workaround', 3, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Use the letter helper and translation tools', 'Photograph the letter and use a translation app for a first pass, then check our letter helper for common official documents. For anything with a deadline or legal weight, get a human to confirm your understanding.', 'official', 1, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Ask the office for English-language material', 'Larger cities increasingly offer English versions of common forms and online wizards that pre-fill the German PDF — ask, or check the city portal before assuming there''s only German.', 'workaround', 2, 'published'),
  ((select id from problems where slug='german-only-forms'), null, 'Get help from a Welcome Center or Migrationsberatung', 'Most cities have a Welcome Center or free migration advice service that will help you read and fill in official paperwork, often in your own language.', 'official', 3, 'published'),
  ((select id from problems where slug='having-a-baby-in-germany'), null, 'Register the birth at the Standesamt first', 'The hospital gives you papers to get the **Geburtsurkunde** (birth certificate) from the registry office (Standesamt). Almost everything else needs it, so do it early.', 'official', 1, 'published'),
  ((select id from problems where slug='having-a-baby-in-germany'), null, 'Add the baby to insurance and claim benefits', 'Add the newborn to your health insurance (often free family insurance), then apply for Kindergeld and Elterngeld. Non-EU parents may also need a residence permit for the child.', 'official', 2, 'published'),
  ((select id from problems where slug='integration-course-needed'), null, 'Check whether your permit obliges a course', 'Your residence-permit paperwork or the Ausländerbehörde will say if attendance is obligatory. If it is, sign up via a BAMF-approved provider — non-attendance can hurt extensions.', 'official', 1, 'published'),
  ((select id from problems where slug='integration-course-needed'), null, 'Claim it voluntarily if it helps you', 'Even when optional, integration and German courses are heavily subsidised and count toward later permanent-residency language requirements — often worth doing.', 'workaround', 2, 'published'),
  ((select id from problems where slug='kindergeld-for-families'), null, 'Apply to the Familienkasse', 'Submit the Kindergeld application to the Familienkasse (part of the employment agency) with your children''s birth certificates and your residence/work status. It can be backdated a limited number of months, so don''t delay.', 'official', 1, 'published'),
  ((select id from problems where slug='kindergeld-for-families'), null, 'Check eligibility tied to your permit', 'Entitlement depends on your residence title allowing it (most work and settlement permits do; some study/short-term ones don''t). Check your permit type before assuming.', 'workaround', 2, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Tell the Ausländerbehörde promptly', 'Inform the immigration office of the job loss. They record it and confirm how long you have to find new work — don''t let them hear it later, which looks worse.', 'official', 1, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Use the job-search window and claim benefits you''re due', 'You typically get a set period to find a comparable job. You may also be entitled to unemployment benefit (ALG I) if you paid in long enough — claim it at the Agentur für Arbeit.', 'workaround', 2, 'published'),
  ((select id from problems where slug='lost-job-on-work-permit'), null, 'Get advice before the window closes', 'If time is running short, a Migrationsberatung or immigration lawyer can advise on switching permit type (e.g. job-seeker) before your status lapses.', 'last-resort', 3, 'published'),
  ((select id from problems where slug='lost-residence-permit-eat'), null, 'Report it and book an Ausländerbehörde appointment', 'Report the loss (a police report helps if it was stolen), then contact your Ausländerbehörde to apply for a replacement eAT. Ask for interim proof of status while you wait.', 'official', 1, 'published'),
  ((select id from problems where slug='lost-residence-permit-eat'), null, 'Block the online eID function', 'The eAT has an online-ID chip — call the blocking hotline 116 116 to disable it so no one can misuse your identity.', 'official', 2, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Act immediately — contact the office the same day', 'Deadlines can sometimes still be salvaged if you respond at once. Call or write explaining why you missed it and asking what''s still possible.', 'official', 1, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Apply for reinstatement (Wiedereinsetzung) if it wasn''t your fault', 'If you missed a deadline for a reason genuinely beyond your control (e.g. the letter arrived late), German law allows a **Wiedereinsetzung in den vorigen Stand** — a request to be put back in position as if you hadn''t missed it. This is a formal legal remedy with strict timing, so get advice from a lawyer or advice center before relying on it.', 'last-resort', 2, 'published'),
  ((select id from problems where slug='missed-official-deadline'), null, 'Keep your registered address current to prevent recurrence', 'Many missed deadlines trace back to letters going to an old address. Always update your Anmeldung when you move so official post reaches you.', 'official', 3, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Get an apostille from the issuing country', 'An **apostille** certifies your document for use in Germany. It''s obtained from the relevant authority in the country that issued the document — often arrangeable remotely or via a relative with power of attorney.', 'official', 1, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Use a sworn translator for a certified translation', 'German offices require a **beglaubigte Übersetzung** (certified translation) by a sworn translator, not a casual one. Courts and the city portal list approved translators.', 'official', 2, 'published'),
  ((select id from problems where slug='missing-home-country-documents'), null, 'Ask your consulate for help replacing documents', 'Your home country''s embassy or consulate in Germany can often reissue civil documents or point you to the right procedure.', 'workaround', 3, 'published'),
  ((select id from problems where slug='missing-wohnungsgeberbestaetigung'), null, 'Point to the landlord''s legal duty (§19 BMG)', 'Landlords are legally obliged to issue the confirmation within two weeks of move-in; refusing can cost them a fine of up to €1,000. A polite written request citing **§19 Bundesmeldegesetz** usually resolves it quickly.', 'official', 1, 'published'),
  ((select id from problems where slug='missing-wohnungsgeberbestaetigung'), null, 'In a sublet, the main tenant can sign', 'For sublets, the person letting you live there (the main tenant) is the "Wohnungsgeber" and can sign the form — the owner''s signature is not required as long as the sublet itself is permitted.', 'official', 2, 'published'),
  ((select id from problems where slug='no-anmeldung-appointments'), (select id from cities where slug='berlin'), 'Berlin: book at any district''s Bürgeramt', 'Berlin lets you register at **any Bürgeramt city-wide** — search all offices, not just your district. Outlying offices (e.g. in Marzahn or Spandau) often have much earlier slots. For simple moves, check the fully online registration first.', 'official', 0, 'published'),
  ((select id from problems where slug='no-anmeldung-appointments'), null, 'Check the portal at slot-release time every morning', 'Most cities release new appointments in the early morning (often 7–9 am). Check daily right after release and also around midday, when same-week cancellations reappear.', 'official', 1, 'published'),
  ((select id from problems where slug='no-anmeldung-appointments'), null, 'Register late with proof you tried', 'The two-week deadline is rarely enforced with a fine when the delay is the office''s fault. Keep dated screenshots of the empty booking calendar as proof that you tried in time.', 'workaround', 2, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Offer alternatives landlords accept', 'A recent proof of income, an employer confirmation letter, a guarantor, or (within legal limits) a larger deposit can reassure a landlord in place of a SCHUFA history.', 'official', 1, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Get your free SCHUFA data copy to show it''s clean', 'Even an empty record, presented proactively with your free yearly Datenkopie (Art. 15 GDPR), shows a landlord you have nothing negative on file.', 'workaround', 2, 'published'),
  ((select id from problems where slug='no-schufa-record'), null, 'Look for newcomer-friendly and temporary housing first', 'Serviced apartments, sublets and student housing often skip the SCHUFA requirement — use one to establish an address and history, then apply for a standard rental later.', 'workaround', 3, 'published'),
  ((select id from problems where slug='pension-refund-when-leaving'), null, 'Check eligibility and apply to the Deutsche Rentenversicherung', 'Non-EU nationals who leave and have paid in for under 5 years (and wait ~24 months after leaving) can usually apply for a refund of their own contributions via the Deutsche Rentenversicherung.', 'official', 1, 'published'),
  ((select id from problems where slug='pension-refund-when-leaving'), null, 'Get the timing and totalisation right', 'If your home country has a social-security agreement with Germany, your contributions might count toward a pension instead — worth comparing before refunding. Advice from the DRV is free.', 'workaround', 2, 'published'),
  ((select id from problems where slug='permanent-residence-eligibility'), null, 'Check your permit''s specific fast-track', 'Blue Card holders can qualify in as little as ~21–33 months with enough pension contributions and German (B1/A1). Others typically need ~5 years. Count your qualifying time.', 'official', 1, 'published'),
  ((select id from problems where slug='permanent-residence-eligibility'), null, 'Gather proof and apply at the Ausländerbehörde', 'You''ll need proof of income, pension contributions, health insurance, adequate housing and language. Book the appointment early — processing takes time.', 'official', 2, 'published'),
  ((select id from problems where slug='public-vs-private-insurance-trap'), null, 'Default to public insurance unless you''re certain', 'For most students and employees, public insurance (GKV) is the safer choice precisely because you can''t easily reverse a move to private. Only choose private after understanding the long-term cost.', 'official', 1, 'published'),
  ((select id from problems where slug='public-vs-private-insurance-trap'), null, 'Get independent advice before signing a private contract', 'Insurance salespeople earn commission on private policies. Talk to a neutral consumer advice center (Verbraucherzentrale) or your university''s student services before committing.', 'official', 2, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Check your appointment confirmation for the counter/room', 'Appointment confirmations usually state a waiting area, room or counter number. Follow that rather than joining a general queue.', 'official', 1, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Show your confirmation to staff on arrival', 'If in doubt, show your printed or on-screen appointment confirmation to any staff member or at reception — they''ll direct you to the right place, and having an appointment usually skips the walk-in queue.', 'workaround', 2, 'published'),
  ((select id from problems where slug='queue-ticket-confusion'), null, 'Arrive 10–15 minutes early', 'Getting there a little early gives you time to find the right ticket category or queue without the stress of your slot ticking away.', 'workaround', 3, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Confirm the letters are genuine — they are', 'Letters from "ARD ZDF Deutschlandradio Beitragsservice" are official, not a scam. The fee (~€18.36/month) is mandatory and charged once per household.', 'official', 1, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Link to a flatmate''s account if someone already pays', 'The fee is per home, not per person. If a roommate already pays, reply with their **Beitragsnummer** to register your name under the existing account instead of paying twice.', 'official', 2, 'published'),
  ((select id from problems where slug='rundfunkbeitrag-confusion'), null, 'Apply for an exemption if you''re eligible', 'Students receiving BAföG, and recipients of certain social benefits, can apply for exemption or reduction at rundfunkbeitrag.de — but you must apply, it isn''t automatic.', 'workaround', 3, 'published'),
  ((select id from problems where slug='scheinanmeldung-risk'), null, 'Don''t do it — the penalties are serious', 'A Scheinanmeldung is an offence for both the person registering and the address provider, punishable by fines up to €50,000, and it can jeopardise your residence status. It is never worth the risk.', 'official', 1, 'published'),
  ((select id from problems where slug='scheinanmeldung-risk'), null, 'Register a genuine temporary address instead', 'If you''re between flats, register where you actually sleep — a sublet, a room in a shared flat, or (where the operator allows registration) longer-term accommodation. The landlord/main tenant signs a real Wohnungsgeberbestätigung.', 'official', 2, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Work in non-regulated roles while you wait', 'Recognition is only legally required for regulated professions. For many jobs you can start working immediately and use recognition to move up later.', 'official', 1, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Chase the authority and complete any Defizitbescheid', 'Follow up with the responsible body for a status update; if they issued a deficit notice (Defizitbescheid), completing the listed courses or exams is what unblocks a decision.', 'workaround', 2, 'published'),
  ((select id from problems where slug='slow-qualification-recognition'), null, 'Apply for a recognition grant to cover costs', 'The Anerkennungszuschuss can cover translation and assessment fees for those on a low income, so cost isn''t the thing holding up your application.', 'workaround', 3, 'published'),
  ((select id from problems where slug='sperrkonto-monthly-limit'), null, 'Budget around the fixed monthly release', 'The monthly amount is set by visa rules and can''t simply be raised. Plan cheaper first months (shared flat, student housing) until income or a scholarship supplements it.', 'official', 1, 'published'),
  ((select id from problems where slug='sperrkonto-monthly-limit'), null, 'Top up with allowed income', 'Part-time/Werkstudent earnings and scholarships are separate from the blocked account and can legally supplement your monthly funds within your visa''s work limits.', 'workaround', 2, 'published'),
  ((select id from problems where slug='steuererklaerung-tax-return'), null, 'File it — you''re often owed a refund', 'Employees frequently get money back. Use a low-cost tool (e.g. an English-friendly tax app) or the official ELSTER portal. You can file for up to four prior years if voluntary.', 'official', 1, 'published'),
  ((select id from problems where slug='steuererklaerung-tax-return'), null, 'Get help if your situation is complex', 'For freelancers, multiple countries, or crypto/investments, a Lohnsteuerhilfeverein (income-tax help association) or a Steuerberater is worth the fee.', 'workaround', 2, 'published'),
  ((select id from problems where slug='student-work-hours-limit'), null, 'Stick to 120 full / 240 half days as a non-EU student', 'That''s the annual limit for most non-EU students. A **Werkstudent** role (≤20h/week in term) is treated favourably, and you can work more during semester breaks — check with your Ausländerbehörde.', 'official', 1, 'published'),
  ((select id from problems where slug='student-work-hours-limit'), null, 'Watch self-employment and Minijob rules separately', 'Freelance work needs explicit permission, and a Minijob still counts toward your day limit. When unsure, confirm in writing with your immigration office before taking a role.', 'workaround', 2, 'published'),
  ((select id from problems where slug='tax-id-never-arrived'), null, 'Request your Steuer-ID in person at the Finanzamt', 'Go to your local Finanzamt with your passport and Anmeldebestätigung — they can look up or reissue your tax ID, often much faster than waiting for the post.', 'official', 1, 'published'),
  ((select id from problems where slug='tax-id-never-arrived'), null, 'Know that the max-rate tax is refundable', 'The extra tax withheld without a Steuer-ID isn''t lost — it comes back once you provide the number, and any remainder via your annual return. Give the number to your employer as soon as you have it.', 'workaround', 2, 'published'),
  ((select id from problems where slug='uninsured-backdated-debt'), null, 'Register as soon as possible to stop the clock', 'The debt grows for every uninsured month, so sign up now rather than waiting — the sooner you''re insured, the smaller the backdated amount.', 'official', 1, 'published'),
  ((select id from problems where slug='uninsured-backdated-debt'), null, 'Ask the Krankenkasse for a payment plan', 'Public insurers can spread backdated contributions over installments (Ratenzahlung). Explain your situation — they generally prefer a payment plan to an unpaid debt.', 'workaround', 2, 'published'),
  ((select id from problems where slug='wrong-tax-class'), null, 'File a tax-class change at the Finanzamt', 'Submit the tax-class-change form (Antrag auf Steuerklassenwechsel) at your local Finanzamt. Married couples can pick the combination that best fits their incomes.', 'official', 1, 'published'),
  ((select id from problems where slug='wrong-tax-class'), null, 'Recover overpaid tax through your annual return', 'Even before the class is corrected, any tax you overpaid comes back when you file your yearly tax return (Steuererklärung) — the class mainly affects monthly cash flow, not your total yearly tax.', 'official', 2, 'published');

-- ---- commuter_areas (delete + reinsert: no natural unique key) ----
delete from commuter_areas;
insert into commuter_areas (city_id, name, commute_note, cost_note, why_md, sort_order, locale, status) values
  ((select id from cities where slug='aachen'), 'Herzogenrath', 'euregiobahn ~15 min', 'Cheaper than Aachen', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='aachen'), 'Eschweiler', 'RE ~12–15 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='aachen'), 'Stolberg', 'RE / euregiobahn ~15 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='aachen'), 'Würselen', 'bus ~15–20 min', 'Cheaper; adjoins Aachen', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='aachen'), 'Düren', 'RE ~20 min', 'Cheaper; on the Cologne line', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='berlin'), 'Potsdam', 'S-Bahn / RE ~25–30 min', 'Popular but affluent — not really cheaper', 'A beautiful city in its own right.', 1, 'en', 'published'),
  ((select id from cities where slug='berlin'), 'Bernau', 'S-Bahn S2 ~25 min', 'Cheaper than central Berlin', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='berlin'), 'Oranienburg', 'S-Bahn S1 ~35–45 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='berlin'), 'Königs Wusterhausen', 'S-Bahn / RE ~30 min', 'Cheaper, to the south-east', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='berlin'), 'Strausberg', 'S-Bahn S5 ~40 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='bremen'), 'Delmenhorst', 'RE ~12–15 min', 'Cheaper than Bremen', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='bremen'), 'Achim', 'RE ~12 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='bremen'), 'Verden', 'RE ~25 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='bremen'), 'Oldenburg', 'RE ~25–35 min', 'Cheaper; a city of its own', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='bremen'), 'Osterholz-Scharmbeck', 'RB ~20 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='cologne'), 'Bonn', 'RE / S-Bahn ~20–30 min', 'A major city itself; moderate rents', 'Former West-German capital and UN city.', 1, 'en', 'published'),
  ((select id from cities where slug='cologne'), 'Leverkusen', 'S-Bahn / RB ~15 min', 'Cheaper than Cologne', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='cologne'), 'Brühl', 'S-Bahn ~15 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='cologne'), 'Bergisch Gladbach', 'S-Bahn / bus ~20–30 min', 'Suburban; moderate', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='cologne'), 'Dormagen', 'RB ~20 min', 'Cheaper, toward Düsseldorf', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='dortmund'), 'Bochum', 'S-Bahn / RE ~15 min', 'Similar, affordable Ruhr rents', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='dortmund'), 'Witten', 'S-Bahn ~20 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='dortmund'), 'Lünen', 'RB ~15 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='dortmund'), 'Hagen', 'RE ~20 min', 'Cheaper', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='dortmund'), 'Essen', 'RE / S-Bahn ~30 min', 'Similar Ruhr pricing', 'The whole Ruhr is one big, well-connected, affordable metro area.', 5, 'en', 'published'),
  ((select id from cities where slug='dresden'), 'Radebeul', 'S-Bahn S1 ~15 min', 'Cheaper than Dresden', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='dresden'), 'Freital', 'S-Bahn ~15 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='dresden'), 'Pirna', 'S-Bahn S1 ~20 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='dresden'), 'Meißen', 'S-Bahn S1 ~35–40 min', 'Cheaper; the famous porcelain town', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='dresden'), 'Coswig', 'S-Bahn ~20 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='duesseldorf'), 'Neuss', 'S-Bahn ~10–15 min', 'Cheaper than Düsseldorf', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='duesseldorf'), 'Duisburg', 'S-Bahn / RE ~20–30 min', 'Notably cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='duesseldorf'), 'Wuppertal', 'RE ~25–30 min', 'Much cheaper', 'Famous for its suspended monorail.', 3, 'en', 'published'),
  ((select id from cities where slug='duesseldorf'), 'Ratingen', 'bus / S-Bahn ~20 min', 'Suburban; moderate', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='duesseldorf'), 'Krefeld', 'RE ~25 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='essen'), 'Bochum', 'S-Bahn / RE ~15 min', 'Similar, affordable Ruhr rents', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='essen'), 'Gelsenkirchen', 'S-Bahn / RE ~15 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='essen'), 'Mülheim an der Ruhr', 'U-Bahn / S-Bahn ~15 min', 'Similar; directly adjoins Essen', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='essen'), 'Duisburg', 'S-Bahn / RE ~20 min', 'Cheaper', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='essen'), 'Bottrop', 'bus / RB ~20 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='frankfurt'), 'Offenbach', 'S-Bahn ~10–15 min', 'Cheaper than Frankfurt', 'Directly adjoins the city.', 1, 'en', 'published'),
  ((select id from cities where slug='frankfurt'), 'Hanau', 'RE / RB ~20–25 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='frankfurt'), 'Darmstadt', 'RE ~15–20 min', 'Somewhat cheaper; a lively university city', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='frankfurt'), 'Mainz', 'S-Bahn ~35–40 min', 'Cheaper-ish; across the state line in Rhineland-Palatinate', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='frankfurt'), 'Wiesbaden', 'S-Bahn / RE ~40 min', 'Affluent — not much cheaper than Frankfurt', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='hamburg'), 'Norderstedt', 'U-Bahn U1 ~25 min', 'Somewhat cheaper than Hamburg', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='hamburg'), 'Pinneberg', 'S-Bahn S3 ~20 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='hamburg'), 'Ahrensburg', 'S-Bahn / RB ~20 min', 'A moderate commuter town', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='hamburg'), 'Buxtehude', 'S-Bahn S3 ~30 min', 'Cheaper; just into Lower Saxony', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='hamburg'), 'Lüneburg', 'metronom train ~30 min', 'Cheaper; a charming student town', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='hannover'), 'Langenhagen', 'S-Bahn ~15 min', 'Moderate; near the airport', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='hannover'), 'Garbsen', 'bus / S-Bahn ~20 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='hannover'), 'Lehrte', 'S-Bahn / RE ~15 min', 'Cheaper', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='hannover'), 'Hildesheim', 'RE ~30 min', 'Cheaper; a university town', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='hannover'), 'Celle', 'RE ~40 min', 'Cheaper; a historic half-timbered town', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='leipzig'), 'Halle (Saale)', 'S-Bahn S3 ~30–40 min', 'Cheaper; a full city of its own in Saxony-Anhalt', 'A genuine cheaper alternative with its own university.', 1, 'en', 'published'),
  ((select id from cities where slug='leipzig'), 'Markkleeberg', 'S-Bahn ~15 min', 'Cheaper; on the lakes', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='leipzig'), 'Schkeuditz', 'S-Bahn ~15 min', 'Cheaper; near the airport', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='leipzig'), 'Grimma', 'RE ~30 min', 'Cheaper, small-town', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='leipzig'), 'Borna', 'S-Bahn ~30 min', 'Cheaper', NULL, 5, 'en', 'published'),
  ((select id from cities where slug='munich'), 'Augsburg', 'RE train ~30–45 min to München Hbf', 'Rents well below Munich', 'A university city in its own right.', 1, 'en', 'published'),
  ((select id from cities where slug='munich'), 'Freising', 'S-Bahn S1 ~25–40 min; near the airport', 'Cheaper than Munich, though rising', 'Home to the Weihenstephan (TUM) campus.', 2, 'en', 'published'),
  ((select id from cities where slug='munich'), 'Dachau', 'S-Bahn S2 ~20 min', 'Cheaper than the city, but still pricey for the region', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='munich'), 'Fürstenfeldbruck', 'S-Bahn S4 ~25 min', 'Noticeably cheaper than Munich', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='munich'), 'Ingolstadt', 'Train ~45–60 min', 'Much cheaper than Munich', 'Audi''s home city, with its own job market.', 5, 'en', 'published'),
  ((select id from cities where slug='nuremberg'), 'Fürth', 'U-Bahn U1 / S-Bahn ~10–15 min', 'Similar to slightly cheaper than Nuremberg', 'Effectively a twin city — fully connected.', 1, 'en', 'published'),
  ((select id from cities where slug='nuremberg'), 'Erlangen', 'S-Bahn ~20 min', 'Rents similar or higher — a Siemens & university town', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='nuremberg'), 'Schwabach', 'S-Bahn ~15–20 min', 'Cheaper than Nuremberg', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='nuremberg'), 'Roth', 'S-Bahn / RE ~25 min', 'Cheaper, small-town feel', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='stuttgart'), 'Ludwigsburg', 'S-Bahn ~15 min', 'A bit cheaper than Stuttgart', NULL, 1, 'en', 'published'),
  ((select id from cities where slug='stuttgart'), 'Esslingen', 'S-Bahn ~15 min', 'Cheaper', NULL, 2, 'en', 'published'),
  ((select id from cities where slug='stuttgart'), 'Böblingen / Sindelfingen', 'S-Bahn ~20 min', 'Moderate; a Mercedes-Benz hub', NULL, 3, 'en', 'published'),
  ((select id from cities where slug='stuttgart'), 'Waiblingen', 'S-Bahn ~15 min', 'Cheaper', NULL, 4, 'en', 'published'),
  ((select id from cities where slug='stuttgart'), 'Reutlingen', 'RE ~35–45 min', 'Cheaper; next to the university town Tübingen', NULL, 5, 'en', 'published');

-- ================================================================
-- Round 15 (2026-07-04): Verifier-approved corrections + enrichment
-- (Anmeldung + residence-permit + commuter towns). Idempotent
-- update-only pass over the Round-14 rows above, mirroring exactly
-- what was applied to the live DB. Honesty over precision: eAT-not-
-- supported caveat on every online_possible=true; residence-permit
-- fees kept as a range (fees_eur stays null); provisional facts hedged.
-- Migration 0006 adds the new commuter_areas columns; re-stated here
-- defensively so this file also applies standalone.
-- ================================================================

alter table commuter_areas
  add column if not exists commute_line text,
  add column if not exists commute_minutes text,
  add column if not exists rent_note text,
  add column if not exists has_own_office boolean,
  add column if not exists office_note text,
  add column if not exists last_verified_at date,
  add column if not exists sources jsonb not null default '[]'::jsonb;

-- ---- residence-permit: corrected §§44–45 AufenthV fees_note (all 15; fees_eur stays null) ----
update city_task_variants v
set fees_note = 'Statutory fees (§§ 44–45 AufenthV): about €100 to issue a residence permit and €93–96 to extend one; a settlement permit (Niederlassungserlaubnis) is €113 (up to €124–147 for self-employment / highly-qualified routes). Reduced rates apply for minors, students in some cases, and certain nationalities (e.g. Turkish nationals under the EEC–Turkey Association Agreement). Pay by card or cash at your appointment — confirm the current figure before you go.',
    last_verified_at = '2026-07-04'
from tasks t
where v.task_id = t.id and t.slug = 'residence-permit';

-- ---- Dortmund residence-permit: walk_in_possible true -> false (box is pickup-only) ----
update city_task_variants v
set walk_in_possible = false, last_verified_at = '2026-07-04'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id
  and c.slug = 'dortmund' and t.slug = 'residence-permit';

-- ---- Munich Anmeldung: cited source does NOT exempt primary Anmeldung -> appointment-required + verify-note ----
update city_task_variants v
set appointment_required = true,
    walk_in_possible = false,
    online_possible = false,
    typical_wait_time = 'Often days to a couple of weeks — book an appointment',
    city_notes_md = 'For your **primary residence (Hauptwohnung)**, Munich generally expects a **booked appointment** — book online via the KVR / Bürgerbüro portal and check the branch offices (Leonrodstraße, Forstenrieder Allee, Orleansplatz, Riesenfeldstraße), which often have earlier slots than the main office.

> **Verify before relying on a walk-in:** Munich''s no-appointment exemption list covers secondary residence (Nebenwohnung) and Statuswechsel, but as of 2026-07-04 it does **not** list primary Anmeldung. Don''t count on taking a queue ticket for a first registration — book an appointment to be safe.

Munich''s online registration for primary residence needs a German ID card / EU eID with the online-ID function; it is **not usable with an eAT residence-permit card**, so most non-EU arrivals register in person.',
    last_verified_at = '2026-07-04'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id
  and c.slug = 'munich' and t.slug = 'anmeldung';

-- ---- Stuttgart Anmeldung: booking_url -> konsentas (old ssc-app superseded) ----
update city_task_variants v
set booking_url = 'https://stuttgart.konsentas.de/form/29/',
    city_notes_md = 'Stuttgart registers at district **Bürgerbüros** (Mitte, Bad Cannstatt, Vaihingen, West, Ost, Süd, Zuffenhausen, Sillenbuch, Plieningen, Weilimdorf). Booking moved to the new **konsentas** system in 2026 — use the city-wide appointment search (it shows a traffic-light busyness indicator) and try a less central office for an earlier slot.',
    last_verified_at = '2026-07-04'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id
  and c.slug = 'stuttgart' and t.slug = 'anmeldung';

-- ---- Berlin Anmeldung: keep online_possible=true, add eAT caveat, drop unverified deadline-proof claim ----
update city_task_variants v
set city_notes_md = 'In Berlin you can book at **any Bürgeramt in any district** — pick whichever has the earliest slot. New appointments are released **every morning**; refreshing the booking page between 7 and 9 am gives the best chances, and cancellations free up same-week slots during the day.

Berlin offers **online residence registration (elektronische Wohnsitzanmeldung)** for straightforward moves — but service.berlin.de states plainly that **an electronic residence permit (eAT) cannot be used** for it. You need a German ID card or an EU/EEA eID card with the activated online-ID function + PIN, a BundID account and the AusweisApp. Most non-EU newcomers therefore register **in person**; if you have just arrived from abroad, expect to appear in person.',
    typical_wait_time = 'Often several weeks for an appointment',
    last_verified_at = '2026-07-04'
from cities c, tasks t
where v.city_id = c.id and v.task_id = t.id
  and c.slug = 'berlin' and t.slug = 'anmeldung';

-- ---- Bremen Anmeldung: online offered with eAT caveat + abroad-in-person path ----
update city_task_variants v set online_possible = true, last_verified_at = '2026-07-04',
  city_notes_md = 'Bremen uses **BürgerServiceCenter** offices (e.g. Mitte and Nord), booked through service.bremen.de. Slots can be scarce, so reserve as soon as you have your documents. There is a separate in-person "Zuzug aus dem Ausland" path for arrivals from abroad.

Bremen offers **online residence registration**, but it works only with a German ID card or EU/EEA eID card (online-ID + PIN) — **an eAT residence-permit card is not accepted**. If you are moving from abroad, expect to register **in person**.'
from cities c, tasks t where v.city_id = c.id and v.task_id = t.id and c.slug = 'bremen' and t.slug = 'anmeldung';

-- ---- Essen Anmeldung: early eWA adopter, but registrations from abroad all in person ----
update city_task_variants v set online_possible = true, last_verified_at = '2026-07-04',
  city_notes_md = 'Essen registers you at district **Bürgerläden / Bürgeramt** offices booked via the city''s online-Termin system. Bring your Wohnungsgeberbestätigung and passport, and book early.

Essen was an early adopter of **online residence registration (eWA)** — but it works only with a German ID card or EU/EEA eID card (online-ID + PIN); **an eAT residence-permit card is not accepted**. And for **registrations from abroad, all persons must appear in person**, so most non-EU newcomers register at the office.'
from cities c, tasks t where v.city_id = c.id and v.task_id = t.id and c.slug = 'essen' and t.slug = 'anmeldung';

-- ---- Hamburg Anmeldung: home of national eWA, online with eAT caveat ----
update city_task_variants v set online_possible = true, last_verified_at = '2026-07-04',
  city_notes_md = 'Hamburg runs Anmeldung through district **Kundenzentren** (customer centres), not one central office. Book via the Hamburg Serviceportal (DigiTermin) for any centre with a free slot — availability varies a lot between districts, so check several. Bring your Wohnungsgeberbestätigung and passport.

Hamburg is the home of Germany''s national **online residence registration (eWA)**, but it works only with a German ID card or EU/EEA eID card (online-ID + PIN) — **an eAT residence-permit card is not accepted**. Most non-EU arrivals register in person.'
from cities c, tasks t where v.city_id = c.id and v.task_id = t.id and c.slug = 'hamburg' and t.slug = 'anmeldung';

-- ---- Hannover Anmeldung: online offered with eAT caveat ----
update city_task_variants v set online_possible = true, last_verified_at = '2026-07-04',
  city_notes_md = 'In Hannover the region''s **Bürgerämter** handle Anmeldung across several district offices. Book online and check more than one location if your nearest is fully booked. Some offices allow Thursday walk-ins (see opening hours).

Hannover offers **online residence registration**, but it works only with a German ID card or EU/EEA eID card (online-ID + PIN) — **an eAT residence-permit card is not accepted**, so most non-EU newcomers register in person.'
from cities c, tasks t where v.city_id = c.id and v.task_id = t.id and c.slug = 'hannover' and t.slug = 'anmeldung';

-- ---- commuter_areas enrichment (verified fields; qualitative unless a sourced range survived) ----
update commuter_areas set has_own_office = true, last_verified_at = '2026-07-04';

update commuter_areas set commute_line = 'RB 81 / RE 8 (regional rail; future S4)', last_verified_at = '2026-07-04'
where name = 'Ahrensburg';
update commuter_areas set commute_line = 'RB / IRE (Neckar-Alb regional rail)', last_verified_at = '2026-07-04'
where name = 'Reutlingen';

-- Halle: only town with a sourced rent range that survived verification (official Mietspiegel).
update commuter_areas set
  rent_note = 'Official halle.de Mietspiegel 2026–2027 average ~€7.93/m² — roughly 15–20% below Leipzig on new-lease asking rent (Angebotsmiete), not on the Mietspiegel/ortsübliche Vergleichsmiete. Verify current listings.',
  sources = '[{"url":"https://www.halle.de/leben-in-halle/bauen-und-wohnen/mietspiegel","title":"Stadt Halle (Saale) — Mietspiegel 2026–2027","accessed_at":"2026-07-04"}]'::jsonb,
  last_verified_at = '2026-07-04'
where name = 'Halle (Saale)';

update commuter_areas set
  office_note = 'Bürgerservicecenter; first municipality in Brandenburg to offer online residence registration (eWA, since June 2025) — free and no appointment for the online path. But eWA needs a German ID card or EU eID (online-ID + PIN); an eAT residence-permit card is not accepted, so most non-EU newcomers still register in person.',
  sources = '[{"url":"https://www.potsdam.de/de/willkommen-zur-elektronischen-wohnsitzanmeldung","title":"Landeshauptstadt Potsdam — elektronische Wohnsitzanmeldung","accessed_at":"2026-07-04"}]'::jsonb,
  last_verified_at = '2026-07-04'
where name = 'Potsdam';

update commuter_areas set
  office_note = 'Own Meldebehörde; online residence registration (eWA) offered since 16 Sep 2024 — but only with a German ID card or EU eID (online-ID + PIN); an eAT residence-permit card is not accepted.',
  last_verified_at = '2026-07-04'
where name = 'Ahrensburg';


-- ================================================================
-- Cycle 2 (2026-07-05): enrich 11 national/how-to guides, add
-- per-city Finanzamt (tax-id) + Führerscheinstelle (driving-license)
-- variants, and recognition glossary terms. ABH-trio office reuse is
-- handled in lib/queries/guide.ts (no duplicate rows). Idempotent.
-- ================================================================

update guides set
  intro_md='A German current account (**Girokonto**) is the same product nationwide — banking is federal, so there are **no city-specific rules** here. You need one to receive your salary, pay rent, and set up direct debits (**SEPA-Lastschrift**) for rent, insurance and utilities.

**EU citizens** can generally open an account immediately with just a passport/ID. **Non-EU newcomers** can often start the process before Anmeldung with a digital bank, but a **registered German address is usually needed to receive the physical card** and to satisfy traditional banks.

- **Digital / mobile banks** (e.g. N26, Revolut, bunq): open in minutes via smartphone using **video identification (Video-Ident)** or Photo-Ident — you show your passport to a video agent. Basic tiers are often free.
- **Branch banks** (Sparkasse, Volksbank, Deutsche Bank, Commerzbank): usually an in-person appointment; typically ask for your **Anmeldebestätigung**.

Every account comes with an **IBAN** (your German account number). You give this IBAN to your employer, landlord and health insurer. Fees vary by bank and account tier — digital-bank basic tiers are typically free, while some accounts charge a monthly fee, so compare current terms on each bank''s own site.',
  documents_md='- Valid passport or EU ID card
- Proof of address — **Anmeldebestätigung** (required by most traditional banks; some digital banks accept a foreign or temporary address to start, but need a German address for the card)
- Your **Steuer-ID**, if you already have it (can usually be added later)
- Proof of income or student status, for some account types
- A German mobile number and, for Video-Ident, a smartphone with a working camera',
  after_md='You will receive a debit card (Girocard or Visa/Mastercard debit) either instantly (virtual) or by post within one to two weeks, along with online-banking access. Give your **IBAN** to your employer, landlord and health insurer as needed. Set up SEPA direct debits (Lastschrift) for recurring bills, and a standing order (Dauerauftrag) for rent if your landlord prefers it.',
  legal_basis=NULL,
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.verbraucherzentrale.de", "title": "Verbraucherzentrale — consumer protection guidance", "accessed_at": "2026-07-02"}, {"url": "https://n26.com/en-de/bank-account", "title": "N26 — opening a German bank account (Video-Ident)", "accessed_at": "2026-07-04"}, {"url": "https://www.monito.com/en/wiki/opening-a-bank-account-in-germany", "title": "Monito — opening a bank account in Germany", "accessed_at": "2026-07-04"}]'::jsonb
where task_id=(select id from tasks where slug='bank-account');

update guides set
  intro_md='A blocked account (**Sperrkonto**) proves you can support yourself during your studies or job search in Germany. It is a **federal requirement for the visa** — the rules are the same nationwide, set by the German mission abroad and the Auswärtiges Amt, not by any city.

You deposit a set sum, and the account is **"blocked"**: you can only withdraw a limited amount **each month** (roughly one-twelfth of the total), so it lasts the year. The account is **usually opened for one year**, unless your planned stay is shorter.

**How much:** for students, as of 2026 the figure is **roughly €992 per month (about €11,904 for a year)** — it is tied to the BAföG maximum rate and **reviewed annually**, so confirm the current amount with your German mission or provider before you transfer. Job-seeker / Chancenkarte amounts are set separately and are **higher** — check the current figure with your mission.

**Who releases the block:** the German mission (embassy/consulate) controls it before your visa is issued; after you arrive and register, the competent **Ausländerbehörde** takes over. Neither can take your money — they only lift the monthly withdrawal limit.

**If your plans change:** if the visa is refused, not used, or you leave the Schengen area before getting a residence permit, the mission can lift the block — the **rejection notice alone is enough** to release the funds.',
  documents_md='- Valid passport
- Completed account-opening form from your chosen provider
- Proof of admission / job offer, as required for your visa type
- The blocking confirmation letter (the provider issues this once funded) — you submit it with your visa application

Well-known providers include Fintiba, Expatrio, Coracle and some traditional banks. **Compare current fees and setup speed on each provider''s own site** — these change and vary by provider.',
  after_md='Once the account is funded, the provider issues a **blocking confirmation** to submit with your visa or residence-permit paperwork. After you arrive in Germany, register (Anmeldung), open a normal Girokonto, and link it so your monthly allowance transfers automatically. If your visa is refused or you do not travel, contact the provider and your mission to unblock and refund the money.',
  legal_basis=NULL,
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.auswaertiges-amt.de/en/sperrkonto-388600", "title": "Auswärtiges Amt — Blocked account (official mechanics)", "accessed_at": "2026-07-05"}, {"url": "https://managua.diplo.de", "title": "German mission — blocked-account amount corroboration (2026)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='blocked-account');

update guides set
  intro_md='Whether — and how easily — you can convert (**umschreiben**) a foreign driving licence into a German one depends on **where it was issued**. The rules are **federal (Fahrerlaubnis-Verordnung, FeV)**, applied by your local **Führerscheinstelle**.

**The 6-month rule (§29 FeV) — this is the big one.** A non-EU/EEA licence is valid for driving in Germany for only **6 months** from the day you establish your ordinary residence here. After that you need a German licence. The office **may extend** the recognition by up to **6 more months** only if you credibly show your stay will be **under 12 months** total.

- **Apply well before the 6 months run out** — processing typically takes **8–14 weeks**. Some city offices treat a **timely application** as sufficient even if processing overruns, but this is **not guaranteed by federal law**. Confirm with your own Führerscheinstelle, and **do not drive on an expired entitlement** — that is a criminal offence.

**EU / EEA licences (§28 FeV):** licences from the 27 EU states plus Iceland, Liechtenstein and Norway are valid in Germany **until their own expiry date** — no conversion needed (car/motorcycle classes; truck/bus recognised for 5 years). A probationary-period nuance applies if you have held the licence under 2 years. All EU photocard licences must be exchanged by **19 January 2033** regardless.

**Non-EU/EEA — three tiers (Anlage 11 FeV).** Countries fall into tiers depending on how much of a German test you must retake:
- **No theory or practical test** (full recognition),
- **theory only**, or
- **full theory + practical test**.

We do **not** reproduce the country list here because it changes and, for some countries, **depends on the issuing state/province** (the USA especially varies by state). Check **Anlage 11 FeV** or the ADAC country list for your case. Recent confirmed points: the **United Kingdom and Gibraltar** have been in the favourable tier since 2022; **Montenegro** is being added (2026).

**Costs and documents (as ranges — they vary by city and ADAC club):**
- A **certified translation + classification** of your licence — roughly **€50–85** via ADAC (or about **€25** for classification alone), about 10 working days.
- A biometric photo (~€10–15) and, for non-EU/EEA conversions, an **eye test (Sehtest)** — or a medical exam for truck/bus classes — plus a **first-aid course**.
- **Total cost is typically ~€35–90**, and **processing 4–14 weeks**. Fees vary slightly by city. An **International Driving Permit (IDP)** (~€15–20) can bridge the first months but does not replace conversion.',
  documents_md='- Your **original foreign driving licence** (it is retained when the German one is issued)
- A **certified translation + classification** (ADAC or a sworn translator) — unless your licence is exempt
- Valid passport / ID and your **Anmeldebestätigung**
- A **biometric passport photo**
- An **eye-test certificate (Sehtest)** — for car/motorcycle; a medical/eyesight exam for truck/bus classes
- A **first-aid course certificate** (required for non-EU/EEA conversions)
- Proof of when you established residence (to show you are inside the 6-month window)',
  after_md='You submit everything at the **Führerscheinstelle** (by appointment in most cities). If your country requires a test, you will be booked for the theory and/or practical exam; in some cities these are run via **DEKRA/TÜV** rather than an in-house examiner. Once approved, your foreign licence is **kept by the authority** and you receive a German **Führerschein**. Do not let your 6-month window lapse before you have either the German licence or a documented extension.',
  legal_basis='§29 FeV (recognition / 6-month rule; extension for stays under 12 months); §31 FeV + Anlage 11 FeV (exchange country tiers); §28 FeV (EU/EEA licences)',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.gesetze-im-internet.de/fev_2010/__29.html", "title": "§29 FeV — recognition of foreign driving licences (6-month rule)", "accessed_at": "2026-07-05"}, {"url": "https://www.adac.de/verkehr/fuehrerschein/auslaendischer-fuehrerschein/umschreibung/", "title": "ADAC — converting a foreign driving licence (country tiers, costs)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='driving-license');

update guides set
  intro_md='A **Fiktionsbescheinigung** ("fictional certificate") is a paper document your **Ausländerbehörde** issues when you have applied for a residence permit (or its extension) in time but they have not yet decided. It **bridges your legal stay** so you are not "illegal" during the wait. It is issued by the **same immigration office** that handles your residence permit.

**The key is which paragraph of §81 AufenthG is ticked** — it decides what you may do:

- **§81 Abs. 3 (Erlaubnisfiktion)** — you are here legally without a title yet and applied for your **first** permit. Work is **generally NOT allowed** unless the certificate explicitly says so.
- **§81 Abs. 4 (Fortgeltungsfiktion)** — you applied **on time to extend an existing** title. Your **previous permit''''s conditions continue**, so if you were allowed to work, you generally may **keep working**.
- **Abs. 5 / 5a** — the office''''s duty to issue the certificate, and the note about employment status.

**Read your certificate carefully** and check the ticked box before assuming you may work.

**Travelling:** whether a Fiktionsbescheinigung lets you re-enter Germany (especially with a valid visa/passport) is a matter of **administrative practice and interpretation** — §81 does not spell out travel rules. In practice it is often accepted alongside a valid passport, but **ask your caseworker before any international travel**.',
  documents_md='- Your passport
- Your residence-permit (or extension) application confirmation
- Biometric photo, if the office asks for one for the certificate
- Any fee the office charges — it is usually issued as part of your appointment; check whether your office charges for it',
  after_md='Keep the Fiktionsbescheinigung with your passport — together they document your legal status until the decision. Note its **expiry date**: if it is close and you have heard nothing, contact the Ausländerbehörde proactively; most offices extend it rather than let your legal stay lapse through no fault of yours. Once your residence permit (eAT card) is issued, the Fiktionsbescheinigung is no longer needed.',
  legal_basis='§81 Aufenthaltsgesetz (AufenthG)',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.gesetze-im-internet.de/aufenthg_2004/__81.html", "title": "§81 AufenthG — Fiktionswirkung (Abs. 3, 4, 5, 5a)", "accessed_at": "2026-07-05"}, {"url": "https://www.asyl.net", "title": "asyl.net — Fiktionsbescheinigung: legal status while an application is pending", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='fiktionsbescheinigung');

update guides set
  intro_md='Health insurance is **mandatory** for everyone living in Germany, and the framework is **federal (SGB V) — the same nationwide**, so there are no city-specific rules here. There are two systems:

- **Statutory / public (GKV — gesetzliche Krankenversicherung):** the default for most employees and all students. Contributions are income-based; family members can often be co-insured for free. Examples: TK, AOK, Barmer, DAK. **TK** is popular with internationals for its English-language app and service.
- **Private (PKV — private Krankenversicherung):** available to the self-employed, civil servants, and employees earning **above the compulsory-insurance threshold (Versicherungspflichtgrenze / JAEG)**, which for **2026 is €77,400 per year (€6,450 per month)** — up from €73,800 in 2025. Below that line, employees are in the GKV.

**About "regional" insurers:** AOK is a federation of about a dozen **independent regional (state-level) insurers**, each with its own additional contribution (Zusatzbeitrag). This is a **state-level** difference, **not** a reason to expect city-by-city variation — you can join a GKV insurer regardless of where in Germany you live.

**Students:** if you are under 30 / within the standard study period, you pay the reduced **student GKV rate — roughly €120–140 per month** (revised annually; the exact figure and each insurer''s Zusatzbeitrag change over time). Over 30 or beyond the standard period, you may need a voluntary or private plan.',
  documents_md='- Valid passport / ID and your Anmeldebestätigung
- Your **Steuer-ID** (add it as soon as you have it)
- Enrolment certificate (students) or employment contract (employees)
- German bank account (IBAN) for the contribution direct debit
- Your insurer will issue a membership confirmation for your employer/university and, later, an **electronic health card (eGK)**',
  after_md='Your insurer sends a **membership confirmation** — give it to your employer (they register you and split the contribution) or your university (needed to enrol). Your **electronic health card (elektronische Gesundheitskarte / eGK)** arrives by post within a couple of weeks; carry it to every doctor''s appointment. You can switch GKV insurers later (usually after a minimum membership period), so it is fine to start with whichever accepts you fastest.',
  legal_basis='SGB V (Sozialgesetzbuch V) — gesetzliche Krankenversicherung',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.gkv-spitzenverband.de", "title": "GKV-Spitzenverband — statutory health insurance framework", "accessed_at": "2026-07-02"}, {"url": "https://www.tk.de/en", "title": "Techniker Krankenkasse (TK) — English service", "accessed_at": "2026-07-05"}, {"url": "https://www.check24.de/gesetzliche-krankenversicherung/versicherungspflichtgrenze", "title": "Versicherungspflichtgrenze / JAEG 2026 = €77,400", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='health-insurance');

update guides set
  intro_md='Whether you **need** your foreign qualification formally recognised depends on the profession — and the framework is **federal + profession/state-based, not city-based**, so there are no per-city offices here; you go to the **responsible body** for your profession.

**The first fork — regulated vs non-regulated:**
- **Regulated professions** (doctors, nurses, teachers, lawyers, many *Meister* craft trades): recognition is **legally required** before you may work under the professional title.
- **Non-regulated professions** (most IT, engineering, business roles): recognition is **optional** — you can work without it — but it often **helps with visas and salary**.

**Where to start:** use the official **Recognition Finder** at anerkennung-in-deutschland.de (run by the federal institute **BIBB**, available in 11 languages) to find your profession''''s responsible body. For **university degrees**, the **anabin** database rates institutions/degrees (H+, H+-, H-); we keep this conceptual rather than a click-by-click walkthrough.

**Key routes and costs:**
- **ZAB Statement of Comparability** (for degrees, from the Zentralstelle für ausländisches Bildungswesen): **€208** (a duplicate is €104). Processing is roughly **3 months standard**, about **2 months** on the skilled-worker fast-track, and about **2 weeks** for an EU Blue Card. It does not expire and is valid Germany-wide.
- **Vocational qualifications:** **IHK-FOSA** is the national body for commercial/industrial/service occupations (fee **€100–600**, typically ~€350–450; **3-month** statutory processing under §6(3) BQFG). **HWK** (regional craft chambers) handle craft trades on the same legal basis.
- If your qualification is only **partially** equivalent, you may get a **Defizitbescheid** listing the gaps, which you close via an adaptation course or exam.

**Coming to Germany to get recognised — the Recognition Partnership (§16d Abs. 3 AufenthG):** you can enter to complete recognition while working. The residence title is granted for an **initial 12 months, extendable one year at a time up to 3 years total**; you generally need **A2 German** (higher for some professions), and up to **20 hours/week** of secondary employment is allowed.

**Free help:** the **IQ Network** (Integration durch Qualifizierung) runs **16 regional counselling networks** — one per Bundesland — offering free advice regardless of nationality or status. The **BAMF/BA "Working and Living in Germany" hotline** is **+49 30 1815-1111** (Mon–Thu 09:00–16:00, Fri 09:00–12:00). Some regions offer an **Anerkennungszuschuss** grant toward costs — check current eligibility.',
  documents_md='- Your **degree/diploma or vocational certificate** plus transcripts
- **Certified translations** into German (and sometimes an apostille/legalisation)
- A CV listing training and work experience
- Passport / ID
- For the Recognition Partnership route: proof of A2 German and, usually, an agreement with an employer',
  after_md='You submit to the **responsible body** for your profession (found via the Recognition Finder), not a city office. You will receive either **full recognition**, **partial recognition with a Defizitbescheid** (do the listed course/exam to close the gap), or, for non-regulated jobs, a **Statement of Comparability** you can show employers. For anything involving **state-level professions** (health, teaching), the responsible body and any fees vary by Bundesland — use the Recognition Finder rather than assuming a single national office. Free counselling from your regional **IQ Network** can guide you through each step.',
  legal_basis='Berufsqualifikationsfeststellungsgesetz (BQFG); §16d Aufenthaltsgesetz (AufenthG) — Anerkennungspartnerschaft',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.anerkennung-in-deutschland.de/html/en/redirect_220.php", "title": "Recognition Finder (BIBB) — find your responsible body", "accessed_at": "2026-07-05"}, {"url": "https://www.zab.kmk.org/en/statement-of-comparability/faq", "title": "ZAB — Statement of Comparability (€208; processing times)", "accessed_at": "2026-07-05"}, {"url": "https://www.make-it-in-germany.com/en/working-in-germany/recognition", "title": "Make it in Germany — recognition & Anerkennungspartnerschaft (§16d)", "accessed_at": "2026-07-05"}, {"url": "https://www.bamf.de", "title": "BAMF — Working and Living in Germany hotline (+49 30 1815-1111)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='qualification-recognition');

update guides set
  intro_md='The **Rundfunkbeitrag** (broadcasting licence fee) funds public radio and TV (ARD, ZDF, Deutschlandradio). It is a **federal charge under the Rundfunkbeitragsstaatsvertrag (RBStV) — the same nationwide**, with no city variation.

- **Amount: €18.36 per month per household** ("*für jede Wohnung*") — **per dwelling, not per person**. Flatmates sharing one apartment pay **one** fee between them, not one each.
- It is billed **quarterly by default: €55.08 (3 × €18.36)**.
- Liability starts on the **1st of the month you move in**, so your first bill can be larger (it may cover a back-period).

Shortly after your Anmeldung, the **Beitragsservice** (the joint collection service) posts you a letter asking you to register your dwelling and set up payment. **This letter is genuine** — it is not a scam. Register at **rundfunkbeitrag.de**.

**Exemptions and reductions** (must be **applied for, with proof**, at rundfunkbeitrag.de):
- **BAföG recipients** (and Ausbildungsgeld apprentices) **not living with their parents** are **fully exempt by statute** — a rule in force since **October 2025**.
- Other full-exemption groups: Bürgergeld / ALG II, Grundsicherung, asylum-seeker benefits (AsylbLG), and some severely disabled people with the "RF" mark on their disability card get a reduced rate.
- Exemptions can be **backdated up to three years** if you were eligible.',
  documents_md='- Your registration address (from your Anmeldung) and move-in date
- The reference number from the Beitragsservice letter, if you already have one
- For an exemption: proof of the qualifying benefit (e.g. your **BAföG Bescheid**, Bürgergeld/Grundsicherung notice, or disability card with "RF")
- German bank account (IBAN) for the direct debit',
  after_md='Once registered, the fee is normally collected by direct debit each quarter. If you qualify for an exemption, submit the application with proof — approval stops future billing and can refund up to three years back. If you move, update your address so you are not double-billed for two dwellings. If you receive a reminder (Mahnung) for a period before you were liable, respond with your actual move-in date rather than ignoring it.',
  legal_basis='Rundfunkbeitragsstaatsvertrag (RBStV)',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.rundfunkbeitrag.de", "title": "Rundfunkbeitrag — official site (€18.36/month per household; exemptions)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='rundfunkbeitrag');

update guides set
  intro_md='**SCHUFA** is Germany''s main credit bureau. Landlords routinely ask new tenants for a SCHUFA report to check creditworthiness. It is a **nationwide** private service — the same everywhere in Germany.

There are **two different products**, and it matters which you get:

- **SCHUFA-BonitätsAuskunft — €29.95 (paid).** This is the one **landlords accept**. Ordered online at meineschufa.de, you get it as an **instant PDF** (or in person at a Postbank branch). It is split: **page 1** is a clean creditworthiness summary meant to be handed to a landlord; **pages 2–3** contain your personal data and are **for your eyes only — do not hand them over**.
- **Datenkopie (free copy under Art. 15 DSGVO/GDPR).** A free, once-a-year full disclosure of your stored data. It is for **your own review**, **not** designed to be shown to landlords. Requested by post, it must be provided within a **statutory maximum of 30 days** (in practice often 2–4 weeks).

**No SCHUFA history yet?** As a newcomer you will have **no record**, which is normal and not negative. Landlords generally accept alternatives: your **employment contract and recent payslips**, a **guarantor (Bürge)**, a **reference from a previous landlord**, or a **larger deposit** — bearing in mind the deposit is legally capped.

**Deposit cap:** under **§551 BGB**, a rental security deposit may not exceed **three months'' cold rent (Kaltmiete)**.',
  documents_md='- Valid passport / ID and your registered German address
- A German bank account or card to pay the €29.95 for the BonitätsAuskunft
- For the free Datenkopie: your ID details for the postal request form at meineschufa.de',
  after_md='For a flat application, order the **BonitätsAuskunft (€29.95)** and give the landlord **page 1 only**. Keep pages 2–3 private. If you have no German credit history, lead with your employment contract, payslips, and offer a guarantor or the (capped) deposit instead. Check your free **Datenkopie** once a year to catch and correct any errors in your record.',
  legal_basis='Art. 15 DSGVO (GDPR) — right of access',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.meineschufa.de", "title": "meineSCHUFA — BonitätsAuskunft (€29.95) and free Datenkopie", "accessed_at": "2026-07-05"}, {"url": "https://www.gesetze-im-internet.de/bgb/__551.html", "title": "§551 BGB — rental deposit capped at 3 months'' cold rent", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='schufa');

update guides set
  intro_md='Germany has **two different tax numbers** — people constantly confuse them:

- **Steuer-Identifikationsnummer (Steuer-ID):** an **11-digit lifelong** number issued **once** by the federal **Bundeszentralamt für Steuern (BZSt)**. It is **permanent** (never changes, even if you move or leave and return) and is **mailed by post only** — the BZSt will **never** ask for it by phone or email. After your Anmeldung it usually arrives in a few weeks (commonly 2–4). Give it to your employer so you are not taxed at the maximum rate.
- **Steuernummer:** a separate number issued by your **local Finanzamt**, mainly relevant if you are **self-employed / freelance** or file a return. It **can change** when you move to a different Finanzamt''s area. Most employees do not need to worry about it.

**The six tax classes (Steuerklassen I–VI, §38b EStG)** decide how much wage tax is withheld from your monthly pay. They affect your **monthly net only** — not your final annual tax liability, which is settled by your tax return:

- **I** — single / unmarried, or married but permanently separated
- **II** — single parents (entitled to the relief amount)
- **III** — married, where the spouse has no or much lower income (used with class V)
- **IV** — married, both earning similar amounts (the default for newly-married couples)
- **V** — the partner of someone in class III
- **VI** — for a **second and further jobs** (highest withholding)

Married couples choose between **IV/IV** (similar incomes) and **III/V** (one much higher earner); there is also **IV/IV with factor**. The combination only shifts *when* you pay — any over- or under-withholding is reconciled in the annual return.

**Changing your tax class** is done via **ELSTER** (the online tax portal) or on paper at the **Finanzamt** (form *Antrag auf Steuerklassenwechsel*). It can **generally be changed once per calendar year**, with exceptions such as **marriage, divorce, or the death of a spouse**. Using ELSTER requires a **one-time identity verification by post**, which takes a while — set it up ahead of time.

**Deadlines:** a tax return (**Steuererklärung**) for the **2025** tax year that you are required to file is due **31 July 2026**; using a tax advisor or a Lohnsteuerhilfeverein extends this into 2027. A **voluntary** return has a **four-year window** (for 2025, until **31 December 2029**). You have **one month** to lodge an objection (**Einspruch**, §355 AO) against a tax assessment (Steuerbescheid). If you were on the wrong tax class, the excess comes back through your return.',
  documents_md='- Your **Steuer-ID** (arrives automatically by post after Anmeldung)
- Valid passport / ID and your Anmeldebestätigung
- To change tax class: the *Antrag auf Steuerklassenwechsel* (via ELSTER or from the Finanzamt), plus your marriage certificate if the change is due to marriage
- For ELSTER: an account with the one-time postal activation code',
  after_md='Once you have your **Steuer-ID**, give it to your employer immediately — this moves you off the emergency class VI / maximum withholding and any excess already deducted is refunded (via payroll or your annual return). If your tax class is wrong for your situation (e.g. after marriage), file a change via **ELSTER** or your Finanzamt. Keep your Steuer-ID somewhere safe — you will reuse it for every job, bank, and tax filing for the rest of your life in Germany.',
  legal_basis='§139b Abgabenordnung (AO); §38b Einkommensteuergesetz (EStG) — Steuerklassen; §355 AO — Einspruch',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html", "title": "BZSt — Steuerliche Identifikationsnummer (Steuer-ID)", "accessed_at": "2026-07-05"}, {"url": "https://www.elster.de", "title": "ELSTER — online tax portal (tax-class change)", "accessed_at": "2026-07-05"}, {"url": "https://www.finanzamt.nrw.de", "title": "Finanzamt NRW — filing deadlines (2025 return due 31 Jul 2026)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='tax-id');

update guides set
  intro_md='If you entered Germany on a **national D-visa** (for study, work, family, etc.), that visa is only the entry document. Before it expires you must **convert it into a residence permit (Aufenthaltstitel)** — an electronic card (eAT) — at your local **Ausländerbehörde**. This is the **same immigration office** that handles your later extensions, so the process and the office are the same across all four immigration tasks.

**The sequence:**
1. **Register your address (Anmeldung)** first — your address determines which Ausländerbehörde is responsible for you.
2. **Apply for the residence permit before your D-visa expires.** Your visa **sticker states its own expiry date** — apply before that date.
3. If you apply on time but the office cannot decide immediately, **§81 AufenthG** protects you: you typically receive a **Fiktionsbescheinigung** that bridges your legal stay until the decision.

**Timing reality:** the bottleneck is almost always **appointment backlogs**, not the paperwork. **Start looking for an appointment as soon as you register.** D-visa validity and processing times vary by consulate and office, so do not rely on a fixed lead-time — book the earliest appointment you can and apply before your visa''''s printed expiry.',
  documents_md='- Valid passport with your **D-visa**
- **Anmeldebestätigung** (proof of registered address)
- Biometric passport photo
- Proof for your specific purpose (enrolment certificate, employment contract + Blue Card/skilled-worker criteria, marriage certificate, etc.)
- Proof of health insurance
- Proof of financial means where required (e.g. blocked account for students)
- The application form (Antrag auf Erteilung eines Aufenthaltstitels)
- The fee (varies by permit type under the AufenthV)',
  after_md='If the office cannot issue the eAT card on the spot, you usually get a **Fiktionsbescheinigung** confirming your stay remains legal while they decide — check which paragraph is ticked, as it governs whether you may keep working and travelling. The **eAT card** itself is produced centrally and arrives within a few weeks; you collect it at the office. Keep an eye on your Fiktionsbescheinigung''''s expiry and contact the office proactively if a decision is running late.',
  legal_basis='§6 Abs. 3, §81 Aufenthaltsgesetz (AufenthG); Aufenthaltsverordnung (AufenthV) — fees',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.gesetze-im-internet.de/aufenthg_2004/__81.html", "title": "§81 AufenthG — application for a residence title (Fiktion protection)", "accessed_at": "2026-07-05"}, {"url": "https://www.make-it-in-germany.com/en/visa-residence/types/residence-permit", "title": "Make it in Germany — from national visa to residence permit", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='visa-conversion');

update guides set
  intro_md='Whether you can **change employers** — or take a materially different job — depends on your **residence permit type**, and the rules changed substantially with the **Skilled Immigration Act 2.0 (Fachkräfteeinwanderungsgesetz, in force 18 November 2023)**. This is handled by the **same Ausländerbehörde** as your residence permit.

**EU Blue Card holders (§18g AufenthG) — the most liberal:**
- After the reform, changing employer needs **no prior permission from the Ausländerbehörde** — the law says explicitly that, contrary to the general rule, "**keine Erlaubnis der Ausländerbehörde erforderlich**" for a Blue Card holder''''s job change.
- **During your first 12 months** in the Blue Card, the Ausländerbehörde **may suspend** the change **for up to 30 days** and, within that window, **object** if the Blue Card conditions (salary threshold, qualifying job) are no longer met. After 12 months, even that falls away.
- You must still **notify** the Ausländerbehörde of the change — this is a **notification, not an approval request**. The new job must still meet Blue Card criteria (recognised qualification + the salary threshold).

**Other skilled-worker permits (§18a / §18b — vocational / academic):**
- The wording of your permit matters. Many permits allow a change after an initial period, but the exact rule (**when a notification is enough vs. when you need the office''''s consent**) has **real regional and office-level variation**. **Confirm your own permit''''s wording with your Ausländerbehörde** before switching — do not assume a fixed year-count applies to you.
- Some older routes (e.g. **ICT Card**) may in some cases still involve the **Agentur für Arbeit**. Check your specific case.

**In short:** Blue Card = notify, don''''t ask (with a 30-day objection window in year one); other permits = **check your permit and your office first.**',
  documents_md='- Your passport and current residence permit (eAT card)
- Your **new employment contract** (showing salary and role)
- Proof your new job still meets your permit''''s criteria (qualification, and for the Blue Card the salary threshold)
- The Ausländerbehörde''''s notification / change form (varies by office)
- Any Agentur für Arbeit paperwork, if your permit type still requires it',
  after_md='For a **Blue Card**, notify the Ausländerbehörde of your new employer and job; within your first 12 months, wait out any 30-day objection window before assuming the change is final. For **other permits**, contact the office first to learn whether a notification suffices or consent is needed. Keep copies of everything you submit.

**City note — Berlin:** Berlin''''s LEA lets Blue Card holders handle an employer change **entirely online** via service.berlin.de (dienstleistung 326856); the page also states the point at which no notification is needed. Other cities differ — always use your own city''''s Ausländerbehörde process.',
  legal_basis='§18a, §18b, §18g Aufenthaltsgesetz (AufenthG); Fachkräfteeinwanderungsgesetz 2.0 (in force 18 Nov 2023)',
  last_verified_at='2026-07-05',
  sources='[{"url": "https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html", "title": "§18g AufenthG — EU Blue Card (employer change; 30-day/12-month rule)", "accessed_at": "2026-07-05"}, {"url": "https://service.berlin.de/dienstleistung/326856/en/", "title": "Berlin LEA — Blue Card employer change (online)", "accessed_at": "2026-07-05"}]'::jsonb
where task_id=(select id from tasks where slug='work-permit-change');

-- ---- Cycle 2: per-city Finanzamt (tax-id) + Führerscheinstelle (driving-license) variants ----

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='aachen'), (select id from tasks where slug='driving-license'), true, 'https://www.staedteregion-aachen.de/de/navigation/aemter/strassenverkehrsamt-a-32/', 'Straßenverkehrsamt der StädteRegion Aachen', 'Carlo-Schmid-Straße 4, 52146 Würselen', 'Aachen''''s driving-licence matters are handled by the **StädteRegion Aachen**, physically in **Würselen** (Carlo-Schmid-Straße 4), by appointment. The no-appointment counter there is only for the mandatory paper-licence exchange, **not** foreign conversions.', 'published', '[{"url": "https://www.staedteregion-aachen.de/de/navigation/aemter/strassenverkehrsamt-a-32/", "title": "StädteRegion Aachen — Straßenverkehrsamt (Würselen)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='berlin'), (select id from tasks where slug='driving-license'), true, 'https://service.berlin.de/dienstleistung/327537/', 'LABO — Fahrerlaubnisbehörde', 'Puttkamerstraße 16–18, 10969 Berlin', 'Berlin handles driving-licence conversion centrally at the **LABO** for the whole city. Appointment required — book via service.berlin.de. Fees vary slightly by case.', 'published', '[{"url": "https://service.berlin.de/dienstleistung/327537/", "title": "Berlin LABO — conversion of a foreign driving licence", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='bremen'), (select id from tasks where slug='driving-license'), true, 'https://www.service.bremen.de', 'Bürgerdienst / Führerscheinstelle Bremen', NULL, 'Bremen runs driving-licence matters through its **Bürgerdienst** (multiple locations), **by prior appointment only** ("nur nach vorheriger Terminvereinbarung") — book via service.bremen.de. Processing roughly 8–12 weeks.', 'published', '[{"url": "https://www.service.bremen.de", "title": "Bremen Bürgerdienst — driving-licence appointments", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='cologne'), (select id from tasks where slug='driving-license'), true, 'https://www.stadt-koeln.de/service/produkte/00010/', 'Straßenverkehrsamt Köln', 'Stadthaus Deutz, Willy-Brandt-Platz 3, 50679 Köln', 'Cologne handles conversions at the **Straßenverkehrsamt** in Stadthaus Deutz. Appointment required.', 'published', '[{"url": "https://www.stadt-koeln.de/service/produkte/00010/", "title": "Stadt Köln — Straßenverkehrsamt (driving licences)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='dortmund'), (select id from tasks where slug='driving-license'), true, 'https://www.dortmund.de/de/leben_in_dortmund/verkehr/fuehrerschein/index.html', 'Führerscheinstelle Dortmund', NULL, 'Dortmund handles conversions at its Führerscheinstelle, by appointment — book via dortmund.de. Dortmund''''s own page states it treats a timely application as sufficient even if processing overruns; **do not rely on this elsewhere**, and do not drive on an expired entitlement.', 'published', '[{"url": "https://www.dortmund.de/de/leben_in_dortmund/verkehr/fuehrerschein/index.html", "title": "Stadt Dortmund — Führerscheinstelle", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='dresden'), (select id from tasks where slug='driving-license'), true, 'https://www.dresden.de/de/leben/mobilitaet/verkehr/fuehrerschein.php', 'Führerscheinstelle Dresden', NULL, 'Dresden handles conversions at its Straßenverkehrsamt/Führerscheinstelle, by appointment — book via dresden.de.', 'published', '[{"url": "https://www.dresden.de/de/leben/mobilitaet/verkehr/fuehrerschein.php", "title": "Stadt Dresden — Führerscheinstelle", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='duesseldorf'), (select id from tasks where slug='driving-license'), true, 'https://www.duesseldorf.de/strassenverkehrsamt', 'Straßenverkehrsamt Düsseldorf', 'Höherweg 101, 40233 Düsseldorf', 'Düsseldorf''''s **Straßenverkehrsamt** at Höherweg 101 handles conversions, by appointment via service.duesseldorf.de.', 'published', '[{"url": "https://www.duesseldorf.de/strassenverkehrsamt", "title": "Stadt Düsseldorf — Straßenverkehrsamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='essen'), (select id from tasks where slug='driving-license'), true, 'https://www.essen.de/meintermin', 'Führerscheinstelle Essen', 'Altendorfer Str. 101, 45143 Essen', 'Essen''''s driving-licence office is at **Altendorfer Str. 101** (tel 0201 88-33888), appointment only via meintermin.essen.de. (Note: Hollestraße 3 / Technisches Rathaus is a different office.)', 'published', '[{"url": "https://www.service.essen.de", "title": "Stadt Essen — Führerscheinstelle (Altendorfer Str. 101)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='frankfurt'), (select id from tasks where slug='driving-license'), true, 'https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/strassenverkehrsamt', 'Straßenverkehrsamt Frankfurt am Main', NULL, 'Frankfurt handles conversions through the Straßenverkehrsamt/Ordnungsamt, by appointment — the booking portal is the reliable pointer.', 'published', '[{"url": "https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/strassenverkehrsamt", "title": "Stadt Frankfurt — Straßenverkehrsamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='hamburg'), (select id from tasks where slug='driving-license'), true, 'https://www.hamburg.de/lbv/', 'Landesbetrieb Verkehr (LBV)', NULL, 'Hamburg handles conversions at the **Landesbetrieb Verkehr (LBV)**. Book an appointment via lbv-termine.de / hamburg.de.', 'published', '[{"url": "https://www.hamburg.de/lbv/", "title": "Hamburg LBV — driving-licence services", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='hannover'), (select id from tasks where slug='driving-license'), true, 'https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover', 'Führerscheinstelle der Stadt Hannover', NULL, '**Important:** if you are registered in the **city of Hannover**, your office is the **Stadt Hannover** Führerscheinstelle (book via hannover.de) — **not** the Region Hannover office at Hildesheimer Str. 20, which serves only the ~20 surrounding towns (its own page says "Einwohner*innen Hannovers wenden sich bitte an die Stadt Hannover"). Appointment required.', 'published', '[{"url": "https://www.hannover.de", "title": "Landeshauptstadt Hannover — Führerscheinstelle (city residents)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='leipzig'), (select id from tasks where slug='driving-license'), true, 'https://www.leipzig.de/buergerservice-und-verwaltung/aemter-und-behoerdengaenge/dienstleistungen/fahrerlaubnis', 'Fahrerlaubnisbehörde Leipzig', NULL, 'Leipzig handles conversions at its Fahrerlaubnisbehörde, by appointment. The Drittstaat theory and practical exams are administered via **DEKRA**, not an in-house examiner.', 'published', '[{"url": "https://www.leipzig.de", "title": "Stadt Leipzig — Fahrerlaubnisbehörde", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='munich'), (select id from tasks where slug='driving-license'), true, 'https://www.muenchen.de/rathaus/terminvereinbarung.html', 'Führerscheinstelle im Kreisverwaltungsreferat (KVR)', 'Garmischer Straße 19–21, 81373 München', 'Munich''''s Führerscheinstelle (part of the KVR) is at **Garmischer Straße 19–21** — visit by appointment. Note: "Eichstätter Straße 2" is only the **postal correspondence address**, not a walk-in office.', 'published', '[{"url": "https://stadt.muenchen.de/service/info/fuehrerscheinstelle/", "title": "Stadt München — Führerscheinstelle (Garmischer Str. 19–21)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='nuremberg'), (select id from tasks where slug='driving-license'), true, 'https://www.nuernberg.de/internet/fuehrerscheinstelle/', 'Führerscheinstelle Nürnberg', NULL, 'Nuremberg handles conversions at its Führerscheinstelle, by appointment — book via nuernberg.de.', 'published', '[{"url": "https://www.nuernberg.de/internet/fuehrerscheinstelle/", "title": "Stadt Nürnberg — Führerscheinstelle", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='stuttgart'), (select id from tasks where slug='driving-license'), true, 'https://www.stuttgart.de/leben/mobilitaet/fuehrerschein/', 'Führerscheinstelle Stuttgart', 'Krailenshaldenstraße 32, 70469 Stuttgart (Feuerbach)', 'Stuttgart''''s Führerscheinstelle is in Feuerbach at **Krailenshaldenstraße 32** (tel 0711 21698-200), by appointment. The "Löwentorbogen" address belongs to the vehicle-registration office (Kfz-Zulassungsstelle), not driving licences.', 'published', '[{"url": "https://www.stuttgart.de/leben/mobilitaet/fuehrerschein/", "title": "Stadt Stuttgart — Führerscheinstelle (Krailenshaldenstr. 32)", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='aachen'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt Aachen-Stadt', 'Krefelder Str. 210, 52070 Aachen', 'If you live **in the city of Aachen**, your office is **Finanzamt Aachen-Stadt** (phone 0241 469-0). The surrounding StädteRegion is handled by a separate office (Finanzamt Aachen-Kreis) — that one is **not** yours as a city resident.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='berlin'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Berlin (district-based)', NULL, 'Berlin has **several district-based Finanzämter** — the one responsible depends on your registered address. Use the finder to identify yours. (The surrounding Brandenburg offices are separate and not yours.)', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='bremen'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt Bremen', 'Rudolf-Hilferding-Platz 1, 28195 Bremen', 'Bremen is served by a **single Finanzamt** for the whole city (Bremerhaven has its own office). Phone 0421 361-90909. Note: for most tax-ID business you need **no appointment** — your Steuer-ID arrives by post automatically, and tax-class changes are done via ELSTER or by post.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='cologne'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Köln (district-based)', NULL, 'Cologne has **several district-based Finanzämter**; the responsible one depends on your address. Use the finder rather than assuming a specific office.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='dortmund'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Dortmund (district-based)', NULL, 'Dortmund has **several district-based Finanzämter**; the responsible one depends on your address. The surrounding Kreis Unna is a separate office. Use the finder.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='dresden'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt Dresden-Nord / Dresden-Süd', 'Rabenerstraße 1, 01069 Dresden', 'Dresden splits along the Elbe into Dresden-Nord and Dresden-Süd, but **both sit at the same address**; reception routes you to the right one by your street.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='duesseldorf'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Düsseldorf (district-based)', NULL, 'Düsseldorf has **several district-based Finanzämter**; the responsible one depends on your address. The surrounding Kreis Mettmann is a separate office — not yours as a city resident. Use the finder.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='essen'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Essen (district-based)', NULL, 'Essen has **more than one Finanzamt** (Essen-NordOst / Essen-Süd); the responsible one depends on your address. Use the NRW finder to confirm yours.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='frankfurt'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Frankfurt am Main (district-based)', NULL, 'Frankfurt has **several district-based Finanzämter**; the responsible one depends on your address. Use the finder.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='hamburg'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Hamburg (district-based)', NULL, 'Hamburg has **several district-based Finanzämter**; the responsible one depends on your street. Use the finder.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='hannover'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Hannover (district-based)', NULL, 'Hannover has **several district-based Finanzämter**; the responsible one depends on your address. The surrounding Region/Landkreis has its own offices — not yours as a city resident. Use the finder.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='leipzig'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt Leipzig I / II', 'Wilhelm-Liebknecht-Platz 3–4, 04105 Leipzig', 'Leipzig I and Leipzig II **share one building and reception** at this address; which one handles your file depends on your street — the shared reception will direct you.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='munich'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt München', 'Servicezentrum, Deroystraße 12, 80335 München', '"Finanzamt München" is one legal entity spread across several buildings. For walk-in service use the central **Servicezentrum at Deroystraße 12**; use the finder to confirm which building holds your file.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='nuremberg'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzamt Nürnberg', NULL, 'As of **1 January 2026**, the former Finanzämter Nürnberg-Nord, Nürnberg-Süd and the Zentralfinanzamt were **merged into a single "Finanzamt Nürnberg"** (part of a wider Mittelfranken restructuring). The old buildings remain as service points and phone numbers/jurisdictions are unchanged for the time being. Use the finder to confirm the current contact for your street.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

insert into city_task_variants (city_id, task_id, appointment_required, booking_url, office_name, office_address, city_notes_md, status, sources, last_verified_at, generated_by, reviewed_by, locale)
values ((select id from cities where slug='stuttgart'), (select id from tasks where slug='tax-id'), null, 'https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html', 'Finanzämter Stuttgart (surname-based split)', NULL, 'Stuttgart splits its city Finanzämter (roughly I–IV) partly **by surname / district**. Use the Baden-Württemberg finder to identify the office responsible for you.', 'published', '[{"url": "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html", "title": "BZSt Finanzamtsuche — find your responsible Finanzamt", "accessed_at": "2026-07-05"}]'::jsonb, '2026-07-05', 'cycle2-builder', 'verifier-cycle2', 'en')
on conflict (city_id, task_id, locale) do update set
  appointment_required=excluded.appointment_required, booking_url=excluded.booking_url,
  office_name=excluded.office_name, office_address=excluded.office_address,
  city_notes_md=excluded.city_notes_md, status=excluded.status, sources=excluded.sources,
  last_verified_at=excluded.last_verified_at, generated_by=excluded.generated_by, reviewed_by=excluded.reviewed_by;

-- ---- Cycle 2: recognition glossary terms ----

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('anabin', 'anabin', 'Database of foreign qualifications', 'A federal database (run by the KMK) that rates foreign higher-education institutions and degrees. Universities are graded H+ (recognised), H+/- (mixed), or H- (not recognised), which helps determine whether your degree is treated as equivalent in Germany.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('anerkennungspartnerschaft', 'Anerkennungspartnerschaft', 'Recognition partnership', 'A residence route (§16d Abs. 3 AufenthG) that lets you come to Germany to complete recognition while working. Granted for an initial 12 months, extendable up to 3 years total; generally requires A2 German.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('anerkennungszuschuss', 'Anerkennungszuschuss', 'Recognition grant', 'A grant offered in some regions to help cover the costs of the recognition procedure (fees, translations, travel). Eligibility and availability vary — check the current terms for your case.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('defizitbescheid', 'Defizitbescheid', 'Notice of deficits', 'A decision issued when your qualification is only partially equivalent. It lists the gaps between your training and the German standard, which you close through an adaptation course or an examination to obtain full recognition.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('ihk-fosa', 'IHK FOSA', 'Chamber body for recognising vocational qualifications', 'The national body (Foreign Skills Approval, run by the Chambers of Industry and Commerce) that assesses foreign commercial, industrial and service vocational qualifications. Fees run roughly €100–600; statutory processing is about 3 months.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('statement-of-comparability', 'Zeugnisbewertung', 'Statement of Comparability', 'An official ZAB document comparing your foreign university degree to the German system. Useful for non-regulated jobs and visas. Costs €208 (duplicate €104); does not expire.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

insert into glossary_terms (slug, term_de, term_en, definition_md, related_task_ids, status)
values ('zab', 'ZAB (Zentralstelle für ausländisches Bildungswesen)', 'Central Office for Foreign Education', 'The national office that assesses foreign qualifications and issues the Statement of Comparability for university degrees. Part of the KMK; its assessments are valid Germany-wide.', array[(select id from tasks where slug='qualification-recognition')]::uuid[], 'published')
on conflict (slug, locale) do update set
  term_de=excluded.term_de, term_en=excluded.term_en, definition_md=excluded.definition_md,
  related_task_ids=excluded.related_task_ids, status=excluded.status;

-- ABH trio (visa-conversion, fiktionsbescheinigung, work-permit-change) reuse
-- the residence-permit city office via an app-layer fallback in
-- lib/queries/guide.ts (getVariant) — intentionally NO duplicate variant rows.
