/**
 * Static site configuration: launch cities and personas.
 * Process content (steps, city specifics) lives in Supabase; this file only
 * holds routing, imagery, and card copy for the small, stable city/persona set.
 */

export type CityStatus = "live" | "coming_soon";

export interface CityCard {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  /**
   * Path to a verifiably-licensed city photo, or null to render the branded
   * placeholder. Keep null until a photo's license + source is confirmed —
   * see the image-licensing rule and public/images/CREDITS.md.
   */
  image: string | null;
  status: CityStatus;
}

export const CITIES: CityCard[] = [
  {
    slug: "munich",
    name: "Munich",
    state: "Bavaria",
    tagline: "Bavaria's orderly heart on the Isar.",
    image: "/images/city-munich.jpg",
    status: "live",
  },
  {
    slug: "ingolstadt",
    name: "Ingolstadt",
    state: "Bavaria",
    tagline: "The Danube city of Audi and students.",
    image: "/images/city-ingolstadt.jpg",
    status: "live",
  },
  {
    slug: "nuremberg",
    name: "Nuremberg",
    state: "Bavaria",
    tagline: "Franconia's historic metropolis.",
    image: "/images/city-nuremberg.jpg",
    status: "live",
  },
  {
    slug: "berlin",
    name: "Berlin",
    state: "Berlin",
    tagline: "The capital, forever reinventing itself.",
    image: "/images/city-berlin.jpg",
    status: "live",
  },
  {
    slug: "frankfurt",
    name: "Frankfurt",
    state: "Hesse",
    tagline: "Germany's skyline and banking heart.",
    image: "/images/city-frankfurt.jpg",
    status: "live",
  },
  {
    slug: "cologne",
    name: "Cologne",
    state: "North Rhine-Westphalia",
    tagline: "The Rhineland's easygoing cathedral city.",
    image: "/images/city-cologne.jpg",
    status: "live",
  },
  {
    slug: "heidelberg",
    name: "Heidelberg",
    state: "Baden-Württemberg",
    tagline: "The romantic university town on the Neckar.",
    image: null,
    status: "live",
  },
  {
    slug: "freiburg",
    name: "Freiburg",
    state: "Baden-Württemberg",
    tagline: "The sunny gateway to the Black Forest.",
    image: null,
    status: "live",
  },
  {
    slug: "aachen",
    name: "Aachen",
    state: "North Rhine-Westphalia",
    tagline: "Charlemagne's spa city at the three-border corner.",
    image: "/images/city-aachen.jpg",
    status: "live",
  },
  {
    slug: "munster",
    name: "Münster",
    state: "North Rhine-Westphalia",
    tagline: "Westphalia's bicycle-friendly student town.",
    image: null,
    status: "live",
  },
  {
    slug: "bonn",
    name: "Bonn",
    state: "North Rhine-Westphalia",
    tagline: "The Rhine's former capital, quietly grand.",
    image: "/images/city-bonn.jpg",
    status: "live",
  },
  {
    slug: "mannheim",
    name: "Mannheim",
    state: "Baden-Württemberg",
    tagline: "The grid-planned city where two rivers meet.",
    image: null,
    status: "live",
  },

  // Coming soon — cards are live, but the city-specific step data (Anmeldung,
  // residence permit, extension) is verified and added in batches. Until a
  // city's procedures are confirmed first-hand, it stays coming_soon and keeps
  // the branded placeholder (image: null). Never ship an unverified photo or
  // an unverified city claim — see the image-licensing rule and CLAUDE.md.
  {
    slug: "hamburg",
    name: "Hamburg",
    state: "Hamburg",
    tagline: "Germany's harbour gateway to the world.",
    image: null,
    status: "coming_soon",
  },
  {
    slug: "stuttgart",
    name: "Stuttgart",
    state: "Baden-Württemberg",
    tagline: "Swabia's carmaking city in the vineyards.",
    image: null,
    status: "coming_soon",
  },
  {
    slug: "dusseldorf",
    name: "Düsseldorf",
    state: "North Rhine-Westphalia",
    tagline: "The Rhine's stylish state capital.",
    image: "/images/city-dusseldorf.jpg",
    status: "coming_soon",
  },
  {
    slug: "leipzig",
    name: "Leipzig",
    state: "Saxony",
    tagline: "Saxony's fast-rising creative hub.",
    image: null,
    status: "coming_soon",
  },
  {
    slug: "dresden",
    name: "Dresden",
    state: "Saxony",
    tagline: "Baroque splendour on the Elbe.",
    image: "/images/city-dresden.jpg",
    status: "coming_soon",
  },
  {
    slug: "hanover",
    name: "Hanover",
    state: "Lower Saxony",
    tagline: "The trade-fair crossroads of the north.",
    image: null,
    status: "coming_soon",
  },
  {
    slug: "bremen",
    name: "Bremen",
    state: "Bremen",
    tagline: "A Hanseatic city-state on the Weser.",
    image: "/images/city-bremen.jpg",
    status: "coming_soon",
  },
  {
    slug: "dortmund",
    name: "Dortmund",
    state: "North Rhine-Westphalia",
    tagline: "The Ruhr's reinvented industrial heart.",
    image: "/images/city-dortmund.jpg",
    status: "coming_soon",
  },
  {
    slug: "essen",
    name: "Essen",
    state: "North Rhine-Westphalia",
    tagline: "Green heart of the changing Ruhr.",
    image: null,
    status: "coming_soon",
  },
];

export type PersonaStatus = "live" | "coming_soon";

export interface PersonaCard {
  slug: string;
  title: string;
  description: string;
  status: PersonaStatus;
}

export const PERSONAS: PersonaCard[] = [
  {
    slug: "student",
    title: "Student",
    description:
      "Enrolment, the essentials, and staying on the right footing.",
    status: "live",
  },
  {
    slug: "worker",
    title: "Skilled worker",
    description:
      "Get set up to be paid and have your qualifications recognised.",
    status: "live",
  },
  {
    slug: "refugee",
    title: "Refugee",
    description: "The same steps, laid out gently and at your own pace.",
    status: "coming_soon",
  },
  {
    slug: "eu-citizen",
    title: "EU citizen",
    description:
      "One of the shortest paths — mostly getting set up and settling in.",
    status: "coming_soon",
  },
  {
    slug: "family",
    title: "Joining family",
    description:
      "Settle your own status, then the essentials of daily life.",
    status: "coming_soon",
  },
];
