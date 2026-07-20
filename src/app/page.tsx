import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyGermany } from "@/components/home/why-germany";
import { CitiesSection } from "@/components/home/cities-section";
import { PersonasSection } from "@/components/home/personas-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { LatestUpdate } from "@/components/home/latest-update";

export const revalidate = 3600;

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
