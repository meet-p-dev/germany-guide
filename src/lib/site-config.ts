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
   * see the image-licensing rule. Old stock photos of unknown provenance were
   * removed on 2026-07-18.
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
    image: null,
    status: "live",
  },
  {
    slug: "ingolstadt",
    name: "Ingolstadt",
    state: "Bavaria",
    tagline: "The Danube city of Audi and students.",
    image: null,
    status: "live",
  },
  {
    slug: "nuremberg",
    name: "Nuremberg",
    state: "Bavaria",
    tagline: "Franconia's historic metropolis.",
    image: null,
    status: "live",
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
