import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6">
      <Reveal>
        <div className="rounded-[2.5rem] bg-primary px-8 py-16 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display mx-auto max-w-2xl text-4xl font-bold sm:text-[2.6rem] sm:leading-[1.15]">
            Ready to make Germany feel like home?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Build your personalised roadmap in under a minute.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/plan" variant="inverse" size="lg">
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
