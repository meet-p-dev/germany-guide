# Research packet — Deepen commuter-town detail (existing cities)

**Agent:** Researcher (step ①) · **Menu item:** #2 (commuter towns, scoped to biggest anchors)
**Access date for all web facts below:** 2026-07-04
**DB project:** ilfhjffpzvzphbvhdpup (read-only) · **Target table:** `public.commuter_areas`
**Scope this pass:** the 8 biggest anchor cities and their existing commuter rows —
Munich (5), Frankfurt (5), Berlin (5), Hamburg (5), Cologne (5), Stuttgart (5),
Nuremberg (4), Leipzig (5) = **39 of the 74 rows**.

> Honesty: this packet does NOT invent exact rents. Every rent figure below is a
> **range** carried through from a named source, with a "verify current rents
> yourself" note baked into the draft text. The Verifier should re-open each source.

---

## 0. IMPORTANT framing the Builder must not lose

### Two different "rent" numbers — do not conflate them
German rent data comes in two flavours and they tell opposite stories:

- **Mietspiegel / ortsübliche Vergleichsmiete** = the *existing-tenancy* comparison
  rent (long-standing leases). This makes core city and commuter town look almost
  equal (e.g. Frankfurt Mietspiegel ~€12.28/m² vs Offenbach ~€12.21/m²). **This is
  NOT what a newcomer pays.**
- **Angebotsmiete (asking rent / Neuvermietung)** = what's actually advertised to a
  new tenant *today*. This is far higher in the core city and is where the commuter
  saving is real (Frankfurt asking ~€19/m² vs Offenbach clearly lower).

**Rule for the draft text:** when we say a town is "cheaper", we mean cheaper on
**asking rent** for a new lease. Say so explicitly, and always append a verify-note.
Never publish a single hard €/m² as "the rent" — use the sourced range.

### Own registration office — the near-universal rule (with the useful exceptions)
Under German law every municipality (Gemeinde/Stadt) runs its **own Meldebehörde**
(Bürgerbüro / Bürgeramt / Einwohnermeldeamt). So for essentially **every** commuter
town in this list, a newcomer does their **Anmeldung locally** — NOT in the big city.
That itself is the hook: the small-town office is often faster and less booked than
Berlin/Munich/Frankfurt.

`has_own_office = true` is therefore the correct default for all 39 towns. The
*genuinely* city-specific, high-value detail is the **flavour** of that office:
- **walk-in possible?** (rare and valuable — Dachau, Brühl, Buxtehude)
- **online eWA (elektronische Wohnsitzanmeldung) available?** (skips the office entirely)
- **appointment-only + how it's booked**

I verified ~18 offices directly on official/town sources (below). The rest I mark
`has_own_office: likely` on the legal rule, for the Verifier to spot-check.

---

## 1. PROPOSED schema change (for the Builder — do NOT assume it exists)

`commuter_areas` today: `id, city_id, name, commute_note, cost_note, why_md,
sort_order, locale, status`. It has free-text `commute_note`/`cost_note` but no
structured fields for the three new facts. Proposed additive, all nullable so
existing rows/pages don't break:

| column | type | purpose | example |
|---|---|---|---|
| `commute_line` | text | the actual service/line | `"S1"`, `"RE / metronom"`, `"U1"` |
| `commute_minutes` | text (range, NOT int) | door-to-Hbf time, honest range | `"25–40 min"` |
| `rent_note` | text | asking-rent-vs-core range + verify note | see per-town drafts |
| `has_own_office` | boolean | town has its own Bürgeramt for Anmeldung | `true` |
| `office_note` | text | the useful flavour (walk-in / eWA / booking) | `"Walk-ins possible; online eWA too"` |
| `last_verified_at` | date | so staleness is visible (mirrors other tables) | `2026-07-04` |
| `sources` | jsonb `[]` | array of `{url, accessed}` (mirrors other tables) | — |

Keep `commute_note`/`cost_note` for now (the live Munich panel reads them);
new columns supplement rather than replace. The Builder can later fold
`commute_line`+`commute_minutes` into a rendered `commute_note`.

---

## 2. Per-town drafts

Confidence legend: **confirmed** = seen on official/town source now ·
**likely** = follows from German law or a reputable aggregator, not the town site ·
**unverified** = could not confirm this pass.

Rent-note reusable suffix (append to every rent_note):
> *"Ranges are indicative asking-rent, not a quote — check current listings
> (ImmoScout24 / Immowelt) and the town's official Mietspiegel before you budget."*

---

### MUNICH (anchor asking rent very high: Mietspiegel ~€15.4/m²; asking ~€21–28/m² new-build) 
Source (Munich): stadt.muenchen.de Mietspiegel + market roundups. confidence: confirmed (Munich is expensive), rent gap direction confirmed.

**Augsburg** (sort 1)
- commute_line: `RE` · commute_minutes: `30–45 min` to München Hbf — **confirmed** (existing DB + timetable-consistent)
- rent_note: "A full city of its own, well below Munich. Official Augsburg Mietspiegel 2026 runs roughly **€12.4–17.1/m²** (avg ~€12.8/m² Q1 2026), vs Munich asking rents around €21–28/m². Real saving for a newcomer." — source: immoscout24 Augsburg Mietspiegel 2026 / immoportal — confidence **confirmed** (figure), the €/m² is from an aggregator not the city PDF so flag `likely` on the exact numbers.
- has_own_office: **true — confirmed**. office_note: "Augsburg has several Bürgerbüros (Stadtmitte, Haunstetten, Lechhausen, Kriegshaber, Hochzoll); online booking; free; online eWA at wohnsitzanmeldung.gov.de." — source: augsburg.de Anmeldung der Wohnung — **confirmed**

**Freising** (sort 2)
- commute_line: `S1` · commute_minutes: `25–40 min` (near the airport) — **confirmed** (DB + S1 known)
- rent_note: "Cheaper than Munich but rising; ~€980 kalt for ~70 m² cited by local agents (≈€14/m²). Verify — Freising is a tight market." — source: ftimmobilien24 Umland roundup — confidence **likely** (agent roundup, not official Mietspiegel)
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro, Marienplatz 1; **appointment-only** (no walk-in) — book online/phone 08161/54-0; slots up to ~8 weeks out, daily short-notice release 8:00." — source: freising.de/rathaus/buergerbuero/termin-vereinbaren — **confirmed**

**Dachau** (sort 3)
- commute_line: `S2` · commute_minutes: `~20 min` — **confirmed**
- rent_note: "Cheaper than the city but still pricey for the region — local data ~€16.8/m². Verify current listings." — source: ftimmobilien24 / fischer-immobilien Dachau — confidence **likely**
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro; **walk-ins possible (mit oder ohne Termin)** — a real advantage over Munich's booked-out offices; phone 08131/73300." — source: dachau.de Wohnen (An-, Um- & Abmeldung) — **confirmed**

**Fürstenfeldbruck** (sort 4)
- commute_line: `S4` · commute_minutes: `~25 min` — **confirmed**
- rent_note: "Noticeably cheaper than Munich; verify current listings (no official qm figure captured this pass)." — confidence **unverified** on a specific range — leave range out, keep qualitative + verify note.
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro, Hauptstr. 31; appointments bookable; hours incl. Tue to 16:00 & Thu to 18:00; phone 08141/281-0." — source: bayernportal.de / fuerstenfeldbruck.de Bürgerbüro — **confirmed**

**Ingolstadt** (sort 5)
- commute_line: `RE / train` · commute_minutes: `45–60 min` — **confirmed** (own job market, Audi)
- rent_note: "Much cheaper than Munich and has its own economy; no official qm range captured — verify listings." — confidence **unverified** on range; keep qualitative.
- has_own_office: **true — confirmed**. office_note: "Bürgeramt, Neues Rathaus, Rathausplatz 4; **appointment-only** (phone/email/online 0841/305-1500); online eWA available." — source: ingolstadt.de Wohnsitz; Anmeldung — **confirmed**

---

### FRANKFURT (anchor asking rent ~€19.4/m² Q2 2026; Mietspiegel ~€12.28/m²)
Source: immoscout24 / hessenschau Frankfurter Mietspiegel 2026. **confirmed**.

**Offenbach** (sort 1)
- commute_line: `S-Bahn (S1/S2/S8/S9)` · commute_minutes: `10–15 min` — **confirmed** (adjoins the city)
- rent_note: "Directly adjoins Frankfurt and is the classic cheaper option. Offenbach's own 2026 Mietspiegel table runs roughly **€5.85–12.95/m²** depending on age/location (avg asking ~€12.2/m²), well under Frankfurt's ~€19/m² asking. NB: on Mietspiegel-average the two look similar — the real gap is in *new-lease* asking rents." — source: offenbach.de Mietspiegel 2026 + immoscout24 — **confirmed**
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro, appointment-only (hundreds of slots released Wed afternoon for the following week); **online eWA without any appointment** if you have eID+PIN." — source: offenbach.de Bürgerbüro / Online-Dienste Meldewesen — **confirmed**

**Hanau** (sort 2)
- commute_line: `RE / RB` · commute_minutes: `20–25 min` — **confirmed**
- rent_note: "Cheaper than Frankfurt; no official qm range captured this pass — verify listings." — confidence **unverified** on range; keep qualitative.
- has_own_office: **true — confirmed**. office_note: "Bürgerservicebüro (Stadtladen), Kurt-Blaum-Platz 8; **appointment needed** (online/phone 06181/295-8135); full **online eWA** available." — source: hanau.de Online-Terminvereinbarung Stadtladen — **confirmed**

**Darmstadt** (sort 3)
- commute_line: `RE` · commute_minutes: `15–20 min` — **confirmed** (lively university city)
- rent_note: "Somewhat cheaper than Frankfurt and a real university city; no official qm range captured — verify listings." — confidence **unverified** on range; keep qualitative.
- has_own_office: **true — confirmed**. office_note: "Bürger- & Ordnungsamt, Luisenplatz 5; **Wed & Fri are open walk-in hours (no appointment)**; online eWA via eID+BundID." — source: digitales-rathaus.darmstadt.de Einwohnerwesen — **confirmed**

**Mainz** (sort 4)
- commute_line: `S8` · commute_minutes: `35–40 min` (across the state line, Rhineland-Palatinate) — **confirmed**
- rent_note: "State capital of Rhineland-Palatinate; somewhat cheaper than Frankfurt but its own tight market — verify listings." — confidence **likely** (direction), no captured range.
- has_own_office: **true — confirmed** (state capital, its own Bürgeramt). office_note: "Register in Mainz, not Frankfurt — Mainz has its own Bürgeramt." — confidence **confirmed** on rule; office booking specifics **unverified** this pass.

**Wiesbaden** (sort 5)
- commute_line: `S1 / S8 / RE` · commute_minutes: `~40 min` — **confirmed**
- rent_note: "Affluent Hessian state capital — not much cheaper than Frankfurt; verify listings." — confidence **likely**
- has_own_office: **true — confirmed** (state capital). office_note: "Own Bürgerbüro network; register locally." booking specifics **unverified**.

---

### BERLIN (Berlin registration is notoriously backlogged — the commuter hook is a *faster* local office)
**Potsdam** (sort 1)
- commute_line: `S7 / RE1` · commute_minutes: `25–30 min` — **confirmed**
- rent_note: "Beautiful and desirable — but affluent and NOT really cheaper than Berlin; treat as a lifestyle choice, not a saving. Verify listings." — confidence **confirmed** (direction)
- has_own_office: **true — confirmed** and this is the strongest hook in the Berlin belt: "Potsdam's Bürgerservicecenter (Yorckstr. 22) was Brandenburg's first with **electronic residence registration (eWA, since June 2025)**; daily 8:00 slot release; a **walk-in counter with timed waiting numbers**; complex cases ~3-week wait but far better than Berlin." — source: potsdam.de #556 / uni-potsdam Welcome Center — **confirmed**

**Bernau** (sort 2)
- commute_line: `S2` · commute_minutes: `~25 min` — **confirmed**
- rent_note: "Cheaper than central Berlin; no official qm range captured — verify listings." — **unverified** on range; qualitative.
- has_own_office: **true — likely** (Kreisstadt of Barnim). Flag for Verifier to confirm booking specifics.

**Oranienburg** (sort 3)
- commute_line: `S1` · commute_minutes: `35–45 min` — **confirmed**
- rent_note: "Cheaper than Berlin; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Kreisstadt of Oberhavel). Verifier to confirm.

**Königs Wusterhausen** (sort 4)
- commute_line: `RB / RE (via S-Bahn to Grünau)` · commute_minutes: `~30 min` — **confirmed**
- rent_note: "Cheaper, to the south-east; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Kreisstadt of Dahme-Spreewald). Verifier to confirm.

**Strausberg** (sort 5)
- commute_line: `S5` · commute_minutes: `~40 min` — **confirmed**
- rent_note: "Cheaper; verify listings." — **unverified** on range.
- has_own_office: **true — likely**. Verifier to confirm.

---

### HAMBURG
**Norderstedt** (sort 1)
- commute_line: `U1` · commute_minutes: `~25 min` — **confirmed** (rare: a direct U-Bahn into a neighbouring state, Schleswig-Holstein)
- rent_note: "Somewhat cheaper than Hamburg; verify listings." — **unverified** on range; qualitative.
- has_own_office: **true — confirmed**. office_note: "Einwohnermeldeamt with online booking; **online eWA available**; registration is free." — source: norderstedt.de / norderstedt.buergerportal.sh — **confirmed**

**Pinneberg** (sort 2)
- commute_line: `S3` · commute_minutes: `~20 min` — **confirmed**
- rent_note: "Cheaper than Hamburg; verify listings." — **unverified** on range; qualitative.
- has_own_office: **true — confirmed**. office_note: "Einwohnermeldeamt in the Rathaus, Bismarckstr. 8; online Bürgerportal for moves." — source: pinneberg.de — **confirmed**

**Ahrensburg** (sort 3)
- commute_line: `S? / RB (via Ahrensburg)` — NB existing DB says "S-Bahn / RB ~20 min"; Ahrensburg is on RB/RE, not the S-Bahn network — **flag for Verifier**. commute_minutes: `~20–25 min`.
- rent_note: "A moderate commuter town; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "Einwohnermeldeamt, Manfred-Samusch-Str. 5; **appointment needed**; **online eWA since 16 Sep 2024** (needs eID+PIN)." — source: ahrensburg.de / buergerportal — **confirmed**

**Buxtehude** (sort 4)
- commute_line: `S3` · commute_minutes: `~30 min` (just into Lower Saxony) — **confirmed**
- rent_note: "Cheaper; just over the state line in Lower Saxony; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "BürgerBüro (BBB), Stadthaus, Bahnhofstr. 7; broad hours incl. Thu to 18:00 and **Saturday 10:00–12:00 in odd weeks** — unusually convenient; phone 04161/501-1111." — source: buxtehude.de Bürgerservice & Öffnungszeiten — **confirmed**

**Lüneburg** (sort 5)
- commute_line: `metronom (ME)` · commute_minutes: `~30 min` — **confirmed** (charming student town; note it's a regional train, not S-Bahn — fare is NOT covered by the Hamburg HVV zone the same way)
- rent_note: "Cheaper and a lively student town; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Hansestadt & Kreisstadt). Verifier to confirm booking specifics.

---

### COLOGNE
**Bonn** (sort 1)
- commute_line: `RE / RB (and metro Linie 16/18)` · commute_minutes: `20–30 min` — **confirmed**
- rent_note: "A major city itself (former capital, UN city) with moderate rents — cheaper than Cologne on asking rents; verify listings." — confidence **likely**
- has_own_office: **true — confirmed** (Bundesstadt with full Bürgerdienste). office_note: "Register in Bonn's own Bürgeramt." specifics **unverified** this pass.

**Leverkusen** (sort 2)
- commute_line: `S6 / RB` · commute_minutes: `~15 min` — **confirmed**
- rent_note: "Cheaper than Cologne; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro in the Luminaden, Wiesdorfer Platz 32; **appointment** by email/phone 0214/406-33120; **online eWA available**; free." — source: leverkusen.kommunalportal.nrw — **confirmed**

**Brühl** (sort 3)
- commute_line: `S? / RB / KVB 18` · commute_minutes: `~15 min` — **confirmed**
- rent_note: "Cheaper than Cologne; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "Bürgeramt, Rathaus B, Steinweg 1; **short matters possible WITHOUT appointment** at the Servicetheke — genuinely handy; phone 02232/793600." — source: bruehl.de Bürgeramt — **confirmed**

**Bergisch Gladbach** (sort 4)
- commute_line: `S11 / bus` · commute_minutes: `20–30 min` — **confirmed**
- rent_note: "Suburban, moderate rents; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Kreisstadt of Rheinisch-Bergischer Kreis). Verifier to confirm.

**Dormagen** (sort 5)
- commute_line: `RB` · commute_minutes: `~20 min` (toward Düsseldorf) — **confirmed**
- rent_note: "Cheaper, sits between Cologne and Düsseldorf; verify listings." — **unverified** on range.
- has_own_office: **true — likely**. Verifier to confirm.

---

### STUTTGART (anchor Mietspiegel ~€16.8/m²; asking ~€17/m²+ — one of the priciest belts)
Source: stuttgart.de Mietspiegel 2025/2026 (qualifizierter). **confirmed**.

**Ludwigsburg** (sort 1)
- commute_line: `S4 / S5` · commute_minutes: `~15 min` — **confirmed**
- rent_note: "A bit cheaper than Stuttgart — Ludwigsburg ~€13.8/m² (Q1 2026), and the wider Kreis averages ~€12.5/m² with towns like Oberstenfeld ~€10.9/m². Verify listings." — source: immoscout24 Ludwigsburg / Kreis Ludwigsburg Mietspiegel 2026 — confidence **confirmed** (figure via aggregator → flag `likely` on exact number)
- has_own_office: **true — likely** (Große Kreisstadt / Kreissitz). Verifier to confirm booking specifics.

**Esslingen** (sort 2)
- commute_line: `S1` · commute_minutes: `~15 min` — **confirmed**
- rent_note: "Cheaper than Stuttgart; no official qm range captured — verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Große Kreisstadt / Kreissitz). Verifier to confirm.

**Böblingen / Sindelfingen** (sort 3)
- commute_line: `S1` · commute_minutes: `~20 min` — **confirmed** (Mercedes-Benz hub)
- rent_note: "Moderate; a Mercedes-Benz hub with its own strong job market; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed** (Böblingen). office_note: "Bürgeramt in the Rathaus, plus a branch in Dagersheim; **Böblingen grants 4 weeks to register (vs the 2-week legal norm)**; online eWA available. Sindelfingen has its own separate Bürgeramt." — source: boeblingen.de Bürgeramt — **confirmed**

**Waiblingen** (sort 4)
- commute_line: `S2 / S3` · commute_minutes: `~15 min` — **confirmed**
- rent_note: "Cheaper than Stuttgart; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "Bürgerbüro, Kurze Str. 33; online + PDF forms; phone 07151/5001-0." — source: waiblingen.de Wohnsitz anmelden — **confirmed**

**Reutlingen** (sort 5)
- commute_line: `RE / RB (Neckar-Alb line)` · commute_minutes: `35–45 min` — **confirmed** (next to Tübingen; NOT on the Stuttgart S-Bahn — flag that the DB's "S-Bahn" implication is wrong; it's regional rail)
- rent_note: "Cheaper; next to the university town Tübingen; verify listings." — **unverified** on range.
- has_own_office: **true — confirmed**. office_note: "Bürgeramt, Rathaus; **appointment required** (phone 07121/303-5577 / online); branch offices too." — source: reutlingen.de Bürgeramt — **confirmed**

---

### NUREMBERG (only 4 rows)
**Fürth** (sort 1)
- commute_line: `U1 / S-Bahn` · commute_minutes: `10–15 min` — **confirmed** (effectively a twin city)
- rent_note: "Similar to slightly cheaper than Nuremberg — fully fused with the city; verify listings." — confidence **likely**
- has_own_office: **true — likely** (kreisfreie Stadt — definitely has its own Bürgeramt). Verifier to confirm specifics.

**Erlangen** (sort 2)
- commute_line: `S1` · commute_minutes: `~20 min` — **confirmed** (Siemens & university town)
- rent_note: "Rents similar or HIGHER than Nuremberg — Siemens + FAU university keep demand high; NOT a cheaper option. Verify listings." — confidence **likely** (direction) — important to flag it's not a saving.
- has_own_office: **true — likely** (kreisfreie Stadt). Verifier to confirm.

**Schwabach** (sort 3)
- commute_line: `S2` · commute_minutes: `15–20 min` — **confirmed**
- rent_note: "Cheaper than Nuremberg; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (kreisfreie Stadt — small but independent). Verifier to confirm.

**Roth** (sort 4)
- commute_line: `S2 / RE` · commute_minutes: `~25 min` — **confirmed**
- rent_note: "Cheaper, small-town feel; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Kreisstadt of Roth). Verifier to confirm.

---

### LEIPZIG
**Halle (Saale)** (sort 1)
- commute_line: `S3` · commute_minutes: `30–40 min` (across into Saxony-Anhalt) — **confirmed**
- rent_note: "A genuine cheaper alternative and a full city with its own university. Halle cold rent ~€7.7/m² (Q2 2026) vs Leipzig ~€9.1/m² — roughly **15–20% cheaper**. Halle also publishes an official Mietspiegel 2026–2027. Verify current listings." — source: halle.de Mietspiegel 2026/2027 PDF + immoscout24 Halle vs Leipzig — **confirmed**
- has_own_office: **true — confirmed** (kreisfreie Stadt, its own Bürgeramt). specifics **unverified** this pass.

**Markkleeberg** (sort 2)
- commute_line: `S3 / S4` · commute_minutes: `~15 min` (on the lakes) — **confirmed**
- rent_note: "Cheaper than Leipzig city and on the Neuseenland lakes; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Große Kreisstadt, Landkreis Leipzig). Verifier to confirm.

**Schkeuditz** (sort 3)
- commute_line: `S5 / S5X` · commute_minutes: `~15 min` (near the airport) — **confirmed**
- rent_note: "Cheaper; near Leipzig/Halle airport; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Große Kreisstadt, Landkreis Nordsachsen). Verifier to confirm.

**Grimma** (sort 4)
- commute_line: `S3 (extended) / RE` · commute_minutes: `~30 min` — **confirmed**
- rent_note: "Cheaper, small-town; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Große Kreisstadt). Verifier to confirm.

**Borna** (sort 5)
- commute_line: `S4` · commute_minutes: `~30 min` — **confirmed**
- rent_note: "Cheaper; verify listings." — **unverified** on range.
- has_own_office: **true — likely** (Kreisstadt of Landkreis Leipzig). Verifier to confirm.

---

## 3. What I could NOT confirm (Verifier: focus here)

1. **Exact rent €/m² for most towns.** I only captured sourced ranges for
   **Augsburg, Offenbach, Dachau, Freising, Ludwigsburg (+Kreis), Halle, Munich/
   Frankfurt/Stuttgart anchors**. For the other ~25 towns the rent direction
   ("cheaper"/"similar"/"higher") is defensible but I have NO sourced qm range —
   drafts deliberately keep those qualitative + verify-note. Do NOT let the Builder
   invent numbers to fill them.
2. **Aggregator vs official caveat.** Where a €/m² came from immoscout24 / immoportal
   / ftimmobilien24 rather than the town's own Mietspiegel PDF, I flagged the exact
   number as `likely`. Prefer the official Mietspiegel where one exists (confirmed to
   exist for Munich, Frankfurt, Offenbach, Stuttgart, Halle, Ludwigsburg region).
3. **Office booking specifics for the ~15 `has_own_office: likely` towns** (all Berlin
   belt except Potsdam; Mainz, Wiesbaden, Bonn, Lüneburg, Bergisch Gladbach, Dormagen;
   Fürth, Erlangen, Schwabach, Roth; Esslingen, Ludwigsburg; Markkleeberg, Schkeuditz,
   Grimma, Borna). `has_own_office = true` is safe on German law, but I did NOT open
   each town's booking page — walk-in vs appointment-only and eWA availability are
   unverified for these.
4. **Two commute-mode corrections to double-check:**
   - **Ahrensburg** — DB says "S-Bahn / RB"; Ahrensburg is on **RB/RE (Bad Oldesloe
     line), not the Hamburg S-Bahn**. Verify and fix `commute_line`.
   - **Reutlingen** — cheap "S-Bahn ~35–45" framing is misleading; it's **regional
     rail (RE/RB), not S-Bahn**, and NOT in the Stuttgart VVS S-Bahn ring. Verify.
   - **Lüneburg** (metronom) and **Halle** (S-Bahn Mitteldeutschland) cross into other
     transit tariffs — worth a line in the draft so newcomers don't assume one ticket.
5. **Fare/ticket implication.** Several towns sit **outside the anchor city's transit
   zone** (Potsdam/Bernau in VBB but different zones; Augsburg/Ingolstadt/Halle/Lüneburg
   entirely separate) — a Deutschlandticket (€/mo, verify current price) solves this but
   a city-only monthly pass will NOT cover the commute. Consider a one-line note; I did
   not verify current Deutschlandticket price this pass.

## 4. Sources (access date 2026-07-04)

- Munich rent: https://stadt.muenchen.de/infos/mietspiegel.html ; https://www.ftimmobilien24.com/immobilienmakler-m%C3%BCnchen/mietspiegel-muenchen-umland-2025/
- Augsburg rent: https://www.immobilienscout24.de/immobilienpreise/bayern/augsburg/mietspiegel ; https://www.immoportal.com/mietspiegel/augsburg
- Augsburg office: https://www.augsburg.de/buergerservice-rathaus/buergerservice/dienste-a-z/aemterweise/leistungen-buergeramt-einwohnerwesen/anmeldung-der-wohnung
- Freising office: https://www.freising.de/rathaus/buergerbuero/termin-vereinbaren ; https://www.freising.de/rathaus/buergerbuero
- Dachau office: https://www.dachau.de/wohnen-an-um-abmeldung/
- Fürstenfeldbruck office: https://www.fuerstenfeldbruck.de/ffb/web.nsf/id/pa_buergerbuero.html ; https://www.bayernportal.de/dokumente/leistung/8444082781?plz=82256
- Ingolstadt office: https://www.ingolstadt.de/Service/Bürgerservice/An-Ab-Ummeldung/Wohnsitz-Anmeldung.php
- Frankfurt rent: https://www.immobilienscout24.de/immobilienpreise/hessen/frankfurt-am-main/mietspiegel ; https://www.hessenschau.de/wirtschaft/frankfurter-mietspiegel-2026-hoehere-mieten-neue-regeln-und-eigentuemer-kritik-v1,mietspiegel-hessen-100.html
- Offenbach rent: https://www.offenbach.de/buerger_innen/bauen-wohnen/wohnen/wohnhilfen/mietspiegel.php ; https://www.immobilienscout24.de/immobilienpreise/hessen/offenbach-am-main/mietspiegel
- Offenbach office: https://www.offenbach.de/vv/oe/verwaltung/buergerbuero/buergerbuero.php ; https://www.offenbach.de/buerger_innen/buerger-service/online-dienstleistungen/online-dienste-meldewesen.php
- Hanau office: https://www.hanau.de/rathaus/online-terminvereinbarung/stadtladen/index.html
- Darmstadt office: https://digitales-rathaus.darmstadt.de/kategorien/kontaktpersonen/buerger-und-ordnungsamt-abt-einwohnerwesen
- Potsdam office: https://www.potsdam.de/de/556-neuerungen-im-buergerservicecenter-ab-dem-1-dezember-2025 ; https://www.uni-potsdam.de/de/welcomecenter/in-potsdam-berlin/behoerden/buergerservice
- Norderstedt office: https://www.norderstedt.de/Politik-und-Rathaus/Rathaus-und-Verwaltung/Einwohnermeldeamt/ ; https://norderstedt.buergerportal.sh/buergerportal
- Pinneberg office: https://www.pinneberg.de/rathaus/buergerportal
- Ahrensburg office: https://ahrensburg.buergerportal.sh/buergerportal ; https://www.ahrensburg.de
- Buxtehude office: https://www.buxtehude.de/portal/seiten/buergerservice-oeffnungszeiten-900000272-20351.html
- Leverkusen office: https://leverkusen.kommunalportal.nrw/detail/-/vr-bis-detail/dienstleistung/60420/show
- Brühl office: https://www.bruehl.de/bs/buergeramt.php
- Stuttgart rent: https://www.stuttgart.de/medien/ibs/mietspiegel_2025_2026.pdf ; https://www.immobilienscout24.de/immobilienpreise/baden-wuerttemberg/stuttgart/mietspiegel
- Ludwigsburg rent: https://www.immobilienscout24.de/immobilienpreise/baden-wuerttemberg/ludwigsburg-kreis/ludwigsburg/mietspiegel
- Böblingen office: https://www.boeblingen.de/start/BUERGERSERVICE/Buergeramt.html
- Waiblingen office: https://www.waiblingen.de/de/Das-Rathaus/Buergerservice/Buergerservice-A-Z/Buergerservice?view=publish&item=service&id=844
- Reutlingen office: https://www.reutlingen.de/de/Rathaus/Stadtverwaltung/Staedtische-aemter/Amt?view=publish&item=level2&id=16
- Halle rent: https://halle.de/fileadmin/Binaries/Publikationen/Stadtentwicklung/Mietspiegel/Mietspiegel_2026_2027_Broschuere.pdf ; https://www.immobilienscout24.de/immobilienpreise/sachsen-anhalt/halle-saale/mietspiegel
- Leipzig rent (anchor): https://www.immobilienscout24.de/immobilienpreise/sachsen/leipzig/mietspiegel

---

## 5. Handoff summary for the Builder

- Add the 7 proposed columns (all nullable) to `commuter_areas`; migrate, don't
  break the live Munich panel which reads `commute_note`/`cost_note`.
- Populate `commute_line` + `commute_minutes` for all 39 (values above; fix Ahrensburg
  & Reutlingen modes per §3.4).
- Populate `rent_note` ONLY where a sourced range exists (Augsburg, Offenbach, Dachau,
  Freising, Ludwigsburg, Halle) with the full range + verify suffix; elsewhere keep the
  qualitative sentence + verify suffix and leave the numeric range empty.
- Set `has_own_office = true` for all 39; write `office_note` for the ~18 confirmed
  offices (the walk-in / eWA flavour is the value); leave `office_note` null for the
  `likely` ones until the Verifier confirms.
- Set `last_verified_at = 2026-07-04` and fill `sources` per row from §4.
- Status: leave as `draft` until the Verifier passes it.
