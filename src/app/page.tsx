import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyGermany } from "@/components/home/why-germany";
import { CitiesSection } from "@/components/home/cities-section";
import { PersonasSection } from "@/components/home/personas-section";
import { CtaBanner } from "@/components/home/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhyGermany />
      <CitiesSection />
      <PersonasSection />
      <CtaBanner />
    </>
  );
}
