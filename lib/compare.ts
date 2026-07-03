// Comparison / "best X" pages: commercial-intent SEO landing pages that reuse the
// affiliate PartnerOffers for the matching task slug. Static config — no DB needed.

export type CompareTopic = {
  slug: string;
  taskSlug: string; // drives getPartnerOffers()
  h1: string;
  title: string; // <title>
  description: string;
  intro: string; // markdown
  criteria: string[]; // "what to look for"
};

export const COMPARE_TOPICS: CompareTopic[] = [
  {
    slug: "blocked-account",
    taskSlug: "blocked-account",
    h1: "Best blocked account (Sperrkonto) for a German student visa",
    title: "Best Blocked Account (Sperrkonto) for a German Student Visa (2026)",
    description:
      "Compare blocked account providers for your German student visa: setup speed, fees, consulate acceptance and monthly release. Honest, no-ads guide.",
    intro:
      "A **blocked account (Sperrkonto)** proves you can support yourself and is required for most German student visas. Several providers let you open one online before you arrive — they differ mainly in **setup speed, fees, how fast your consulate accepts them, and how the monthly release works**. Below are the ones internationals use most.",
    criteria: [
      "Setup speed — can you open it fully online, and how fast is verification?",
      "Cost — one-off setup fee plus any monthly charges.",
      "Acceptance — is it recognised by your German embassy/consulate?",
      "Monthly release — how easily you can withdraw your monthly amount after arrival.",
      "Bundles — some include health insurance, which can save a separate step.",
    ],
  },
  {
    slug: "health-insurance",
    taskSlug: "health-insurance",
    h1: "Best health insurance for internationals in Germany",
    title: "Best Health Insurance for Internationals in Germany (2026)",
    description:
      "Public vs private health insurance in Germany for students, workers and freelancers — how to choose, with English-friendly providers. No-ads guide.",
    intro:
      "Health insurance is **mandatory in Germany from day one**. Most students and employees are best served by **public insurance (GKV)**; **private (PKV)** suits some high earners, freelancers and older students — but switching back to public is hard, so choose carefully. These providers offer English-language sign-up.",
    criteria: [
      "Public vs private — public is usually safer unless you have a specific reason.",
      "English support — sign-up, app and customer service in English.",
      "Cost now vs later — private is cheap when young but rises steeply with age.",
      "Acceptance — recognised by your university or employer for enrolment.",
      "Reversibility — remember you often can't easily switch private back to public.",
    ],
  },
  {
    slug: "bank-account",
    taskSlug: "bank-account",
    h1: "Best bank account for newcomers in Germany",
    title: "Best Bank Account for Newcomers in Germany (2026)",
    description:
      "Open a German bank account as a newcomer — app-based banks you can open with just a passport, plus money-transfer options. Honest, no-ads guide.",
    intro:
      "You need a German **current account (Girokonto)** for your salary, rent and direct debits. App-based banks can often open one **with just your passport — sometimes before your Anmeldung** — while traditional banks may want your registration first. For funding it from abroad, a dedicated transfer service usually beats a bank's exchange rate.",
    criteria: [
      "No-Anmeldung opening — can you open with just a passport before registering?",
      "Fees — free account vs monthly charge, and ATM/foreign-use costs.",
      "English app + support.",
      "IBAN acceptance — a German IBAN your employer and landlord will accept.",
      "Transfers — a cheap way to move money in from your home country.",
    ],
  },
];

export function getCompareTopic(slug: string) {
  return COMPARE_TOPICS.find((t) => t.slug === slug) ?? null;
}
