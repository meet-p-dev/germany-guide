/**
 * Persona definitions for the explore-mode path pages (Increment 2). Each
 * persona maps to a `tasks.audience` tag already in the content model; the page
 * renders the six stages filtered to tasks carrying that tag.
 *
 * GUARDRAIL (same as stage framing): `intro` describes the persona's ROLE in
 * the journey only — the *shape* of their path — never a fact about German
 * bureaucracy (no fees, timelines, rules, or legal claims). Facts come from the
 * DB. The refugee page deliberately carries NO curated service links here:
 * real official/free-service links are factual content about real organisations
 * for a vulnerable audience and must go through the content pipeline
 * (Researcher → Verifier → a proper table) with source + date, not be written
 * from model knowledge. Until then the page shows an honest "coming soon" line.
 *
 * NOTE: the spec lists five personas; the content model only tags four
 * (`student`, `worker`, `refugee`, `eu`). "Joining family" has no `family`
 * audience tag yet, so it is intentionally NOT built here — that needs a
 * content-loop task to add the tag first.
 */
export type Persona = {
  slug: string; // route segment + generateStaticParams
  tag: string; // matches a value in tasks.audience[]
  label: string; // short name for the switcher
  heading: string; // page h1
  title: string; // <title> / SEO
  description: string;
  intro: string; // one-line role-in-journey framing (no facts)
  supportive?: boolean; // refugee: supportive treatment + resources-coming-soon
};

export const PERSONAS: Persona[] = [
  {
    slug: "student",
    tag: "student",
    label: "Student",
    heading: "Your path as a student",
    title: "How to move to Germany as a student — the six stages",
    description:
      "The whole path through German bureaucracy for international students, laid out calmly in six stages. Explore it, then build a plan that shows just your next step.",
    intro:
      "Your path centres on your studies — getting settled, staying on the right footing, and setting up the essentials around them.",
  },
  {
    slug: "skilled-worker",
    tag: "worker",
    label: "Skilled worker",
    heading: "Your path as a skilled worker",
    title: "Moving to Germany as a skilled worker — the six stages",
    description:
      "The whole path through German bureaucracy for skilled workers, laid out calmly in six stages. Explore it, then build a plan that shows just your next step.",
    intro:
      "Your path is built around work — getting set up to be paid, and having what you already do recognised here.",
  },
  {
    slug: "refugee",
    tag: "refugee",
    label: "Refugee",
    heading: "Your path as a refugee",
    title: "Settling in Germany as a refugee — a calm step-by-step",
    description:
      "The everyday steps of settling in Germany, laid out gently and at your own pace. Verified local support resources are being added.",
    intro:
      "You’re not on your own with this. These are the same stages, laid out gently and at your own pace.",
    supportive: true,
  },
  {
    slug: "eu-citizen",
    tag: "eu",
    label: "EU citizen",
    heading: "Your path as an EU citizen",
    title: "Moving to Germany as an EU citizen — the six stages",
    description:
      "The path through German bureaucracy for EU citizens, laid out calmly in six stages. Shorter than most — explore it, then build a plan that shows just your next step.",
    intro:
      "One of the shorter paths — for you this is mostly about getting set up and settling in.",
  },
];

export const PERSONA_BY_SLUG: Record<string, Persona> = Object.fromEntries(
  PERSONAS.map((p) => [p.slug, p])
);
