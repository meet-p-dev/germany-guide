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
