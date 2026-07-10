"""Static content dataset for the Germany relocation guide.

============================================================================
WHERE ALL CONTENT LIVES  ->  THIS FILE:  /app/backend/content_data.py
============================================================================
Everything the site shows is generated from four things in this file:

  1. USER_TYPES   - the situations a person can pick (student/job/refugee/other)
  2. PHASES       - the ordered stages of the journey (before / firstweeks / ...)
  3. STEPS        - every task in the journey (visa, anmeldung, bank, ...)
  4. CITIES       - each city + its city-specific overrides (city_notes)
  5. GERMANY_BASICS - the "Germany vs other countries" cards

You (or an AI) only need to EDIT THIS ONE FILE to add/refine data. No other
backend change is required - the API rebuilds the journeys automatically.

----------------------------------------------------------------------------
HOW TO ADD A NEW CITY  (copy this block into the CITIES dict)
----------------------------------------------------------------------------
CITIES["stuttgart"] = {
    "name": "Stuttgart", "state": "Baden-Wuerttemberg", "slug": "stuttgart",
    "tagline": "One-line hook shown on city cards.",
    "image": "https://<landscape image url>",   # 1500px+ wide looks best
    "intro": "Short paragraph shown at the top of the city page.",
    "city_notes": {
        # keys MUST match the id of any step where "city_specific": True
        "anmeldung": {
            "office": "Buergeramt Stuttgart",
            "mode": "appointment",               # "walk-in" | "appointment" | "hybrid"
            "mode_label": "Appointment required", # the badge text
            "detail": "How registration works in this city.",
            "address": "Street, PLZ City",
            "booking_url": "https://official-page",
            "processing_time": "e.g. 1-3 weeks for a slot",
            "cost": "Free  (or  ~ EUR 100)",
            "local_tips": ["Tip one.", "Tip two."],
        },
        "residence_permit": { ... same shape ... },
    },
}

----------------------------------------------------------------------------
HOW TO ADD A NEW STEP  (append a dict to the STEPS list)
----------------------------------------------------------------------------
{
    "id": "driving_licence",          # unique, lowercase, used everywhere
    "phase": "settle",                # must be one of PHASES ids
    "icon": "id-card",                # a key from frontend src/lib/icons.js
    "applies_to": "all",              # "all"  OR  ["student","job",...]
    "title": "Exchange Your Driving Licence",
    "summary": "One line shown on the card.",
    "details": ["Paragraph 1.", "Paragraph 2."],
    "documents": ["Doc 1", "Doc 2"],
    "tips": ["Tip 1", "Tip 2"],
    "type_notes": {"student": "note only students see"},   # optional
    "city_specific": False,           # True => add this id under each city's city_notes
}

If a step is "city_specific": True, add a matching entry in COMPARE_STEPS
(below) if you also want it on the /compare page.
----------------------------------------------------------------------------

Journey = ordered phases -> steps. Each step declares which user types it
applies to. Some steps are "city_specific" and get merged with per-city data
(office name, walk-in vs appointment, address, cost, waiting time, tips).
"""

USER_TYPES = [
    {"id": "student", "label": "Student", "icon": "graduation-cap",
     "blurb": "University, language school or exchange programme."},
    {"id": "job", "label": "Work / Job Seeker", "icon": "briefcase",
     "blurb": "Employment, Blue Card, or looking for a job."},
    {"id": "refugee", "label": "Refugee / Asylum", "icon": "heart-handshake",
     "blurb": "Seeking protection or asylum in Germany."},
    {"id": "other", "label": "Family / Other", "icon": "users",
     "blurb": "Family reunion, freelancer, or something else."},
]

PHASES = [
    {"id": "before", "title": "Before You Arrive", "subtitle": "Paperwork to sort out before the flight"},
    {"id": "firstweeks", "title": "First Two Weeks", "subtitle": "The critical foundation once you land"},
    {"id": "essentials", "title": "Essentials", "subtitle": "Money, health and your legal stay"},
    {"id": "settle", "title": "Settling In", "subtitle": "Build your everyday life in Germany"},
]

# ---- Steps ---------------------------------------------------------------
# applies_to: list of user type ids, or "all"
STEPS = [
    {
        "id": "entry_permit",
        "phase": "before",
        "icon": "plane",
        "applies_to": ["student", "job", "other"],
        "title": "Visa & Entry Permit",
        "summary": "Get the correct visa at the German embassy before you travel.",
        "details": [
            "Non-EU nationals almost always need a national (D) visa to enter Germany for stays over 90 days.",
            "Book your embassy appointment early — slots can be booked out for 2-3 months in popular countries.",
            "EU/EEA/Swiss citizens do NOT need a visa and can enter freely.",
        ],
        "documents": ["Valid passport", "Proof of purpose (admission / job contract)", "Proof of finances (blocked account or sponsor)", "Health insurance confirmation", "Biometric photos"],
        "tips": ["Keep 3-4 photocopies of every document — German offices love paper.", "A 'blocked account' (Sperrkonto) is the most common proof of funds."],
        "type_notes": {
            "student": "Apply for a Student Visa / Student Applicant Visa. You'll usually need a €11,904 blocked account for one year.",
            "job": "Apply for a Work Visa or EU Blue Card. A signed job contract and recognised qualification are key.",
            "other": "Family reunion visa needs a marriage/birth certificate and A1 German for spouses in many cases.",
        },
    },
    {
        "id": "asylum_registration",
        "phase": "before",
        "icon": "shield",
        "applies_to": ["refugee"],
        "title": "Register Your Asylum Claim",
        "summary": "Report to the authorities as soon as you arrive to start your protection claim.",
        "details": [
            "You do not need a visa to seek asylum. State your wish for protection to any police officer, border official, or reception centre.",
            "You'll be sent to an initial reception centre (Erstaufnahmeeinrichtung) and receive an arrival certificate (Ankunftsnachweis).",
            "Your formal application is filed with the BAMF (Federal Office for Migration and Refugees).",
        ],
        "documents": ["Any ID / passport you have", "Travel documents", "Anything proving your route/identity"],
        "tips": ["Ask for an interpreter — it is your right.", "Keep your Ankunftsnachweis safe; it unlocks accommodation, food and medical care."],
        "type_notes": {},
    },
    {
        "id": "accommodation",
        "phase": "firstweeks",
        "icon": "home",
        "applies_to": "all",
        "title": "Find Accommodation",
        "summary": "You need a registered address before almost anything else works.",
        "details": [
            "You can't do the city registration (Anmeldung) without a permanent address and a landlord confirmation (Wohnungsgeberbestätigung).",
            "Temporary options: student dorms, WG (shared flats), serviced apartments, or a friend's place (they can sign as your landlord).",
            "The rental market is competitive — expect to provide SCHUFA (credit score), proof of income and a deposit (Kaution) of up to 3 months' rent.",
        ],
        "documents": ["Wohnungsgeberbestätigung (landlord confirmation)", "Rental contract (Mietvertrag)", "Proof of income / blocked account", "SCHUFA report (if available)"],
        "tips": ["Never transfer a deposit before viewing a flat — a very common scam.", "The Wohnungsgeberbestätigung is a specific signed form; make sure your landlord provides it."],
        "type_notes": {
            "student": "Apply to the Studierendenwerk dorms the moment you're admitted — they are cheap but fill fast.",
            "refugee": "During your procedure the state assigns your accommodation; you generally cannot choose your city freely.",
        },
    },
    {
        "id": "anmeldung",
        "phase": "firstweeks",
        "icon": "map-pin",
        "applies_to": "all",
        "city_specific": True,
        "title": "Anmeldung — City Registration",
        "summary": "Register your address at the local office within 14 days of moving in.",
        "details": [
            "The Anmeldung is the single most important step — it produces your registration certificate (Meldebescheinigung).",
            "Without it you cannot get a tax ID, open most bank accounts, sign a phone contract, or apply for your residence permit.",
            "By law you must register within 14 days of moving into your home.",
        ],
        "documents": ["Passport / ID", "Wohnungsgeberbestätigung", "Completed registration form (Anmeldeformular)", "Marriage/birth certificates (if registering family)"],
        "tips": ["Bring the ORIGINAL landlord confirmation, not a copy.", "Ask them to also apply for your tax ID at the same time — it arrives by post."],
        "type_notes": {},
    },
    {
        "id": "bank_account",
        "phase": "firstweeks",
        "icon": "landmark",
        "applies_to": "all",
        "title": "Open a Bank Account",
        "summary": "A German IBAN is needed for rent, salary, and most contracts.",
        "details": [
            "You'll need a current account (Girokonto). Options range from traditional banks (Sparkasse, Deutsche Bank) to app-based banks (N26, Revolut, Comdirect).",
            "App-based banks let you open an account with just your passport and a video call — often before your Anmeldung.",
            "Traditional banks usually require your Meldebescheinigung and sometimes your tax ID.",
        ],
        "documents": ["Passport / ID", "Meldebescheinigung (for traditional banks)", "Tax ID (sometimes)", "Proof of enrolment / employment (sometimes)"],
        "tips": ["Students should ask for a free student account.", "Keep some cash — many small shops and bakeries in Germany are still cash-only."],
        "type_notes": {
            "student": "Some universities require a blocked account (Sperrkonto) which converts to a normal account once you arrive.",
            "refugee": "You have the right to a 'basic account' (Basiskonto) even without full documents.",
        },
    },
    {
        "id": "tax_id",
        "phase": "essentials",
        "icon": "file-digit",
        "applies_to": ["student", "job", "other"],
        "title": "Tax ID (Steuer-ID)",
        "summary": "An 11-digit number sent automatically after your Anmeldung.",
        "details": [
            "The Steueridentifikationsnummer is issued automatically by the tax office once you complete your Anmeldung.",
            "It arrives by post within 2-3 weeks. Your employer needs it to pay you correctly (otherwise you're taxed at the highest rate).",
            "If it doesn't arrive, you can request it at your local Finanzamt.",
        ],
        "documents": ["Meldebescheinigung"],
        "tips": ["No action needed usually — just wait for the letter.", "Working students: give your Steuer-ID to your employer to avoid emergency tax."],
        "type_notes": {},
    },
    {
        "id": "health_insurance",
        "phase": "essentials",
        "icon": "stethoscope",
        "applies_to": "all",
        "title": "Health Insurance",
        "summary": "Health insurance is legally mandatory for everyone in Germany.",
        "details": [
            "You must choose between public (gesetzlich, e.g. TK, AOK, Barmer) and private (privat) insurance.",
            "Public insurance is the default for employees and most students under 30 — around €120/month for students.",
            "You need proof of insurance to enrol at university, sign a work contract, or get your residence permit.",
        ],
        "documents": ["Passport", "Meldebescheinigung", "Enrolment / employment proof", "Bank details"],
        "tips": ["Public insurers offer a free confirmation letter (Versicherungsbescheinigung) for your visa/enrolment.", "Compare digital service quality — TK and Barmer have good English apps."],
        "type_notes": {
            "student": "Under 30 you usually qualify for cheaper public student insurance.",
            "job": "If you earn over ~€69,300/year you may opt for private insurance.",
            "refugee": "During the asylum procedure the state covers your basic medical care via a health card.",
        },
    },
    {
        "id": "residence_permit",
        "phase": "essentials",
        "icon": "id-card",
        "applies_to": ["student", "job", "other"],
        "city_specific": True,
        "title": "Residence Permit (Aufenthaltstitel)",
        "summary": "Convert your entry visa into a residence permit at the immigration office.",
        "details": [
            "The Aufenthaltstitel is issued by the local Foreigners' Office (Ausländerbehörde) and lets you live long-term in Germany.",
            "Apply BEFORE your entry visa expires. You'll receive an electronic residence card (eAT).",
            "Processing can take weeks — book your appointment as soon as you have your Anmeldung and insurance.",
        ],
        "documents": ["Passport with visa", "Meldebescheinigung", "Health insurance proof", "Proof of finances", "Biometric photo", "Purpose proof (enrolment / contract)"],
        "tips": ["Bring the exact fee — around €100 — many offices take card or cash only.", "Get a Fiktionsbescheinigung if your visa expires before your appointment — it keeps your stay legal."],
        "type_notes": {
            "student": "You'll get a student residence permit, usually valid 1-2 years and renewable.",
            "job": "EU Blue Card holders get faster permanent residency (21-33 months).",
        },
    },
    {
        "id": "sim_card",
        "phase": "essentials",
        "icon": "smartphone",
        "applies_to": "all",
        "title": "Mobile / SIM Card",
        "summary": "Get a German number for verifications and contracts.",
        "details": [
            "Prepaid SIMs (Aldi Talk, Lidl Connect, Lebara) are cheap and need no contract — buy one at a supermarket or kiosk.",
            "Contract plans (Telekom, Vodafone, O2) are cheaper per GB but need a German bank account and address.",
            "You'll usually verify your identity (Video-Ident or PostIdent) to activate any SIM.",
        ],
        "documents": ["Passport / ID", "German address", "Bank details (for contracts)"],
        "tips": ["Prepaid first, contract later once your bank account works.", "Telekom has the best coverage; discounters run on the same networks for less."],
        "type_notes": {},
    },
    {
        "id": "enrolment",
        "phase": "settle",
        "icon": "graduation-cap",
        "applies_to": ["student"],
        "title": "Enrol at Your University",
        "summary": "Complete matriculation to become an official student.",
        "details": [
            "Enrolment (Immatrikulation) makes you an official student and unlocks your student ID, semester ticket and dorm eligibility.",
            "You'll pay the semester fee (Semesterbeitrag), which often includes public transport.",
            "Bring proof of health insurance — universities cannot enrol you without it.",
        ],
        "documents": ["Admission letter", "Passport", "Health insurance proof", "Proof of semester fee payment", "Photos"],
        "tips": ["The semester ticket often covers all regional public transport — huge savings.", "Get your student email early; many discounts (software, transport) need it."],
        "type_notes": {},
    },
    {
        "id": "employment_setup",
        "phase": "settle",
        "icon": "briefcase",
        "applies_to": ["job"],
        "title": "Start Work Correctly",
        "summary": "Hand your employer the documents they need to pay you.",
        "details": [
            "Give your employer your tax ID, social security number, health insurance details and bank account.",
            "You'll be automatically enrolled in pension, unemployment and care insurance (deducted from salary).",
            "Check your first payslip (Gehaltsabrechnung) carefully to confirm your tax class (Steuerklasse).",
        ],
        "documents": ["Tax ID", "Social security number (Sozialversicherungsnummer)", "Health insurance details", "Bank details"],
        "tips": ["Your social security number arrives by post after your first job registration.", "Register at the Agentur für Arbeit if you're still job-seeking — they offer free support."],
        "type_notes": {},
    },
    {
        "id": "integration_support",
        "phase": "settle",
        "icon": "life-buoy",
        "applies_to": ["refugee"],
        "title": "Integration & Social Support",
        "summary": "Access benefits, housing and integration courses during your procedure.",
        "details": [
            "Once recognised, you can access social benefits (Bürgergeld), the job centre, and a state-funded integration course.",
            "Integration courses combine 600 hours of German with 100 hours of orientation about life and law in Germany.",
            "Local Migrationsberatung (migration advice centres) and NGOs offer free help in many languages.",
        ],
        "documents": ["Ankunftsnachweis / residence document", "BAMF decision (once issued)"],
        "tips": ["Ask your local Caritas, Diakonie or DRK office for free counselling.", "Passing the B1 language test speeds up long-term residency."],
        "type_notes": {},
    },
    {
        "id": "language_course",
        "phase": "settle",
        "icon": "languages",
        "applies_to": "all",
        "title": "Learn German",
        "summary": "German unlocks jobs, friendships and permanent residency.",
        "details": [
            "Even basic German massively improves daily life and is required for permanent residency (usually B1).",
            "Options: Volkshochschule (VHS) affordable public courses, private schools (Goethe-Institut), and free apps.",
            "Many employers and universities offer subsidised or free courses.",
        ],
        "documents": [],
        "tips": ["VHS courses are the best value for money.", "Aim for B1 — it's the threshold for permanent residency and citizenship."],
        "type_notes": {},
    },
    {
        "id": "long_term",
        "phase": "settle",
        "icon": "flag",
        "applies_to": "all",
        "title": "Permanent Residency Outlook",
        "summary": "Understand your path to settling down for good.",
        "details": [
            "A permanent settlement permit (Niederlassungserlaubnis) is typically possible after 5 years (faster for Blue Card holders and graduates).",
            "Requirements: stable income, pension contributions, B1 German, and no serious criminal record.",
            "German citizenship is now possible after 5 years of residency (3 with exceptional integration).",
        ],
        "documents": [],
        "tips": ["Keep every payslip and insurance record — you'll need proof of contributions.", "Time spent as a student counts partially towards permanent residency."],
        "type_notes": {},
    },
]

# ---- Cities --------------------------------------------------------------
CITIES = {
    "munich": {
        "name": "Munich", "state": "Bavaria", "slug": "munich",
        "tagline": "Bavaria's polished capital — beer gardens, BMW and the Alps on the horizon.",
        "image": "https://images.unsplash.com/photo-1554222413-74348b32d66e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxtdW5pY2glMjBjaXR5JTIwc2t5bGluZSUyMGRheXRpbWV8ZW58MHx8fHwxNzgzNjI3NDY1fDA&ixlib=rb-4.1.0&q=85",
        "intro": "Munich is prosperous and beautiful but has Germany's most competitive housing market. Its citizen offices (Bürgerbüro) are relatively efficient and some allow walk-ins.",
        "city_notes": {
            "anmeldung": {
                "office": "Bürgerbüro (KVR — Kreisverwaltungsreferat)",
                "mode": "walk-in",
                "mode_label": "Walk-in available",
                "detail": "Several Munich Bürgerbüro locations accept walk-ins — arrive early (before 08:00) and take a ticket. Appointments are also bookable online and recommended in peak season.",
                "address": "Ruppertstraße 19, 80337 München",
                "booking_url": "https://stadt.muenchen.de/buergerservice/",
                "processing_time": "Same day if you walk in early; certificate issued on the spot.",
                "cost": "Free",
                "local_tips": ["Multiple branches exist — the smaller suburban ones have shorter queues than the central KVR.", "Bring exact original documents; Munich staff are strict about the Wohnungsgeberbestätigung."],
            },
            "residence_permit": {
                "office": "Ausländerbehörde München",
                "mode": "appointment",
                "mode_label": "Appointment required",
                "detail": "Munich's Ausländerbehörde works strictly by appointment, booked by email or the online portal. Students are handled partly through a dedicated fast-track service.",
                "address": "Seidlstraße 27, 80335 München",
                "booking_url": "https://stadt.muenchen.de/en/service/info/auslaenderbehoerde/",
                "processing_time": "2-6 weeks depending on category.",
                "cost": "≈ €100 (student ≈ €56-100)",
                "local_tips": ["Email the office early — appointment waits can be long.", "InfoPoint at the university helps international students with the process."],
            },
        },
    },
    "berlin": {
        "name": "Berlin", "state": "Berlin", "slug": "berlin",
        "tagline": "Germany's creative, chaotic, affordable capital — startups, art and nightlife.",
        "image": "https://images.unsplash.com/photo-1549569344-5fab90429fd9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxiZXJsaW4lMjBicmFuZGVuYnVyZyUyMGdhdGUlMjBkYXl8ZW58MHx8fHwxNzgzNjI3NDY1fDA&ixlib=rb-4.1.0&q=85",
        "intro": "Berlin is diverse and comparatively affordable, but its bureaucracy is famously overloaded — appointments for everything must be booked well in advance.",
        "city_notes": {
            "anmeldung": {
                "office": "Bürgeramt",
                "mode": "appointment",
                "mode_label": "Mandatory appointment",
                "detail": "Berlin requires a booked appointment (Termin) at any Bürgeramt — walk-ins are NOT accepted. New slots are released online at midnight and disappear within minutes.",
                "address": "Any Bürgeramt in Berlin (you can register at any district office)",
                "booking_url": "https://service.berlin.de/dienstleistung/120686/",
                "processing_time": "Certificate issued at the appointment; booking a slot can take weeks.",
                "cost": "Free",
                "local_tips": ["Refresh the booking site at 00:00 and 07:00 — that's when cancellations appear.", "Use appointment-alert bots/services; Berliners rely on them heavily.", "You may register at ANY district's Bürgeramt, not just your own."],
            },
            "residence_permit": {
                "office": "Landesamt für Einwanderung (LEA)",
                "mode": "appointment",
                "mode_label": "Appointment / online request",
                "detail": "Handled by the LEA. Many categories now submit requests online and receive an appointment or postal decision. Expect long waiting times.",
                "address": "Friedrich-Krause-Ufer 24, 13353 Berlin",
                "booking_url": "https://www.berlin.de/einwanderung/",
                "processing_time": "Several weeks to a few months.",
                "cost": "≈ €100",
                "local_tips": ["Submit your request before your visa expires to auto-extend your legal stay.", "The LEA has a dedicated fast lane for skilled workers and their employers."],
            },
        },
    },
    "hamburg": {
        "name": "Hamburg", "state": "Hamburg", "slug": "hamburg",
        "tagline": "The elegant port city — canals, maritime trade and the Elbphilharmonie.",
        "image": "https://images.unsplash.com/photo-1553547274-0df401ae03c9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxoYW1idXJnJTIwcG9ydCUyMGVsYnBoaWxoYXJtb25pZXxlbnwwfHx8fDE3ODM2Mjc0NjV8MA&ixlib=rb-4.1.0&q=85",
        "intro": "Hamburg runs its citizen services through central 'Kundenzentren'. Appointments are the norm and can be booked by phone (115) or online.",
        "city_notes": {
            "anmeldung": {
                "office": "Kundenzentrum (Bezirksamt)",
                "mode": "appointment",
                "mode_label": "Appointment recommended",
                "detail": "Hamburg's Kundenzentren work by appointment, bookable online or via the 115 hotline. A limited number of walk-in spots exist but appointments are far more reliable.",
                "address": "Any Kundenzentrum (e.g. Hamburg-Mitte, Klosterwall 2)",
                "booking_url": "https://www.hamburg.de/behoerdenfinder/",
                "processing_time": "Certificate at the appointment; slots usually within 1-3 weeks.",
                "cost": "Free",
                "local_tips": ["Call 115 if the online calendar looks full — phone slots are sometimes separate.", "You can register at any Kundenzentrum in the city."],
            },
            "residence_permit": {
                "office": "Einwohner-Zentralamt (Ausländerbehörde)",
                "mode": "appointment",
                "mode_label": "Appointment required",
                "detail": "Hamburg centralises immigration matters at the Einwohner-Zentralamt. Students often use the Welcome Center for a smoother process.",
                "address": "Amsinckstraße 28-34, 20097 Hamburg",
                "booking_url": "https://www.hamburg.de/willkommensportal/",
                "processing_time": "3-6 weeks.",
                "cost": "≈ €100",
                "local_tips": ["The Hamburg Welcome Center bundles registration + permit for skilled workers.", "Book as soon as your Anmeldung is done."],
            },
        },
    },
    "frankfurt": {
        "name": "Frankfurt", "state": "Hesse", "slug": "frankfurt",
        "tagline": "Germany's finance capital — skyscrapers, the ECB and the busiest airport.",
        "image": "https://images.unsplash.com/photo-1626447637943-4c9d412fa8cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxmcmFua2Z1cnQlMjBza3lsaW5lJTIwZGF5dGltZXxlbnwwfHx8fDE3ODM2Mjc0ODF8MA&ixlib=rb-4.1.0&q=85",
        "intro": "Frankfurt is compact and international. Its Bürgeramt offers both appointments and some walk-in slots, and English is widely spoken in the business districts.",
        "city_notes": {
            "anmeldung": {
                "office": "Bürgeramt",
                "mode": "hybrid",
                "mode_label": "Appointment or walk-in",
                "detail": "Frankfurt's Bürgerämter offer online appointments and also hold a daily quota of walk-in tickets — arrive early for the walk-in queue.",
                "address": "Bürgeramt Zeil, Zeil 3, 60313 Frankfurt am Main",
                "booking_url": "https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/buergeramt",
                "processing_time": "Same day; certificate on the spot.",
                "cost": "Free",
                "local_tips": ["The Zeil branch is central but busy — Höchst and Bornheim are quieter.", "Walk-in tickets run out fast; be there by 07:30."],
            },
            "residence_permit": {
                "office": "Ausländerbehörde Frankfurt",
                "mode": "appointment",
                "mode_label": "Appointment required",
                "detail": "Frankfurt's Ausländerbehörde handles permits by appointment. The city's international profile means English service is common.",
                "address": "Kleyerstraße 86, 60326 Frankfurt am Main",
                "booking_url": "https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/auslaenderbehoerde",
                "processing_time": "3-5 weeks.",
                "cost": "≈ €100",
                "local_tips": ["Skilled-worker cases can use the accelerated procedure via the employer.", "Bring passport photos — a booth is on site but often out of order."],
            },
        },
    },
    "cologne": {
        "name": "Cologne", "state": "North Rhine-Westphalia", "slug": "cologne",
        "tagline": "The warm, easy-going Rhineland city — famous cathedral and carnival.",
        "image": "https://images.unsplash.com/photo-1608322460360-009ddc765b99?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxjb2xvZ25lJTIwY2F0aGVkcmFsJTIwZGF5dGltZXxlbnwwfHx8fDE3ODM2Mjc0NjV8MA&ixlib=rb-4.1.0&q=85",
        "intro": "Cologne is friendly and student-heavy. Registration runs through the Kundenzentren/Bürgerämter and requires an appointment booked online.",
        "city_notes": {
            "anmeldung": {
                "office": "Kundenzentrum / Bürgeramt",
                "mode": "appointment",
                "mode_label": "Appointment required",
                "detail": "Cologne requires an online appointment at one of the district Kundenzentren. Walk-ins are generally not accepted; book early as slots fill up.",
                "address": "Any Bürgeramt (e.g. Kundenzentrum Innenstadt, Laurenzplatz 4)",
                "booking_url": "https://www.stadt-koeln.de/service/produkte/anmeldung-einer-wohnung",
                "processing_time": "Certificate at the appointment; slots within 1-3 weeks.",
                "cost": "Free",
                "local_tips": ["Check several district offices — availability varies a lot between them.", "The online system is in German; use a translator browser extension."],
            },
            "residence_permit": {
                "office": "Ausländeramt Köln",
                "mode": "appointment",
                "mode_label": "Appointment / email request",
                "detail": "Cologne's Ausländeramt takes permit requests by email and issues appointments. Students go through a dedicated team.",
                "address": "Am Kölnberg / Longericher Str., 50769 Köln (Ausländeramt)",
                "booking_url": "https://www.stadt-koeln.de/leben-in-koeln/zuwanderung",
                "processing_time": "4-8 weeks.",
                "cost": "≈ €100",
                "local_tips": ["Email your documents in advance to speed up the appointment.", "The University of Cologne's International Office helps with the paperwork."],
            },
        },
    },
}


_APPLIES_LABELS = {"student": "Students", "job": "Workers",
                   "refugee": "Refugees", "other": "Family / Other"}


def _step_applies(step, user_type):
    a = step["applies_to"]
    return a == "all" or user_type in a


def _applies_label(step):
    a = step["applies_to"]
    if a == "all":
        return "Everyone"
    return " · ".join(_APPLIES_LABELS[x] for x in a)


def build_journey(city_slug=None, user_type=None):
    """Return phases with steps merged with city-specific data.

    - user_type given -> only steps that apply to that type.
    - user_type None   -> general guide with ALL steps (each labelled).
    - city_slug given  -> city-specific steps merged with that city's data.
    """
    city = CITIES.get(city_slug)
    result = []
    for phase in PHASES:
        phase_steps = []
        for step in STEPS:
            if step["phase"] != phase["id"]:
                continue
            if user_type is not None and not _step_applies(step, user_type):
                continue
            item = {
                "id": step["id"],
                "title": step["title"],
                "icon": step["icon"],
                "summary": step["summary"],
                "details": step["details"],
                "documents": step["documents"],
                "tips": step["tips"],
                "applies_label": _applies_label(step),
                "type_note": step.get("type_notes", {}).get(user_type) if user_type else None,
                "city_specific": step.get("city_specific", False),
                "city_info": None,
            }
            if step.get("city_specific") and city:
                item["city_info"] = city["city_notes"].get(step["id"])
            phase_steps.append(item)
        if phase_steps:
            result.append({
                "id": phase["id"],
                "title": phase["title"],
                "subtitle": phase["subtitle"],
                "steps": phase_steps,
            })
    return result


def city_summaries():
    return [
        {"slug": c["slug"], "name": c["name"], "state": c["state"],
         "tagline": c["tagline"], "image": c["image"]}
        for c in CITIES.values()
    ]


# Steps whose rules meaningfully change from city to city.
COMPARE_STEPS = [
    {"id": "anmeldung", "title": "Anmeldung — City Registration"},
    {"id": "residence_permit", "title": "Residence Permit (Aufenthaltstitel)"},
]


def compare_data():
    return {
        "steps": COMPARE_STEPS,
        "cities": [
            {"slug": c["slug"], "name": c["name"], "state": c["state"],
             "image": c["image"], "notes": c["city_notes"]}
            for c in CITIES.values()
        ],
    }


# "Germany vs. what you're used to" — cultural / systemic differences.
GERMANY_BASICS = [
    {"id": "cash", "icon": "banknote", "title": "Cash is still king",
     "body": "Many restaurants, bakeries and small shops are cash-only. Always carry euros — card acceptance is growing but far from universal."},
    {"id": "anmeldung", "icon": "map-pin", "title": "You must register your address",
     "body": "The Anmeldung has no equivalent in most countries. It's legally required within 14 days and unlocks your tax ID, bank, phone and residence permit."},
    {"id": "termin", "icon": "calendar-check", "title": "Appointment culture (Termin)",
     "body": "Offices, doctors and many services run strictly by appointment. Book early — walk-ins are the exception, not the rule."},
    {"id": "ruhezeit", "icon": "volume-x", "title": "Quiet hours (Ruhezeit)",
     "body": "No loud noise on Sundays, public holidays, or after 22:00. Neighbours take this seriously — no drilling, loud music or laundry spinning."},
    {"id": "sunday", "icon": "store", "title": "Sundays everything closes",
     "body": "Supermarkets and shops shut on Sundays and public holidays. Stock up on Saturday; only bakeries, petrol stations and station shops stay open."},
    {"id": "pfand", "icon": "recycle", "title": "Recycling & bottle deposit (Pfand)",
     "body": "Waste is strictly separated. Most bottles and cans carry a deposit (Pfand) you get back at supermarket machines."},
    {"id": "insurance", "icon": "stethoscope", "title": "Health insurance is mandatory",
     "body": "You cannot legally live, work or study in Germany without health insurance. It's the first thing offices and universities check."},
    {"id": "directness", "icon": "message-square", "title": "Direct communication",
     "body": "Germans value directness, punctuality and following rules. Blunt feedback isn't rudeness — being on time is a sign of respect."},
    {"id": "rundfunk", "icon": "tv", "title": "TV/radio licence (Rundfunkbeitrag)",
     "body": "Every household pays ~€18.36/month for public broadcasting, whether or not you own a TV. You'll get a letter after your Anmeldung."},
    {"id": "schufa", "icon": "shield-alert", "title": "SCHUFA credit score",
     "body": "Landlords and providers check your SCHUFA credit record. As a newcomer you start with none — build it early with a bank account and paid bills."},
]
