import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyGermany } from "@/components/home/why-germany";
import { CitiesSection } from "@/components/home/cities-section";
import { PersonasSection } from "@/components/home/personas-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { LatestUpdate } from "@/components/home/latest-update";

export const revalidate = 3600;

// Title and description come from the root layout; this only pins the
// canonical so the trailing-slash and query-string variants collapse to one URL.
export const metadata: Metadata = {
  alternates: { canonical: "https://germanyguide.net" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestUpdate />
      <HowItWorks />
      <WhyGermany />
      <CitiesSection />
      <PersonasSection />
      <CtaBanner />
    </>
  );
}
