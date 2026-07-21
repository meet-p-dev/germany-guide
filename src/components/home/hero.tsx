"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Compass,
  Globe,
  MapPin,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Float } from "@/components/motion/reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20">
      <motion.div initial="hidden" animate="visible" variants={container}>
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            From first thought to fully settled
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display mt-6 text-5xl font-extrabold leading-[1.05] sm:text-6xl"
        >
          Arrive in Germany{" "}
          <span className="text-primary">without the chaos.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          From your visa to your Anmeldung — a clear, personalised checklist
          that knows the difference between doing it in{" "}
          <HeroCityLink slug="munich">Munich</HeroCityLink>,{" "}
          <HeroCityLink slug="berlin">Berlin</HeroCityLink> or{" "}
          <HeroCityLink slug="frankfurt">Frankfurt</HeroCityLink>.
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/plan" size="lg">
            Build my plan
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/process" variant="secondary" size="lg">
            <Compass className="h-4 w-4" />
            Explore the process
          </ButtonLink>
        </motion.div>

        <motion.p variants={item} className="mt-5 text-sm text-muted">
          Free to explore. No account needed to browse the full journey.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="relative"
      >
        <div className="overflow-hidden rounded-3xl">
          <Image
            src="/images/hero-moving-in.jpg"
            alt="Moving boxes and plants in a bright new apartment"
            width={760}
            height={560}
            priority
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="h-[420px] w-full object-cover sm:h-[480px]"
          />
        </div>

        <Float className="absolute -left-3 bottom-10 sm:-left-8" duration={5.5}>
          <Link
            href="/cities/munich"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pr-5 shadow-lg transition-shadow hover:shadow-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <CalendarClock className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">Munich</span>
              <span className="block text-sm text-muted">
                Appointment only — no walk-ins
              </span>
            </span>
          </Link>
        </Float>

        <Float className="absolute -right-2 top-8 sm:-right-6" duration={6.5} delay={0.8}>
          <Link
            href="/cities/berlin"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pr-5 shadow-lg transition-shadow hover:shadow-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success">
              <Globe className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">Berlin</span>
              <span className="block text-sm text-muted">
                Online with BundID works
              </span>
            </span>
          </Link>
        </Float>
      </motion.div>
    </section>
  );
}

/** City names in the hero copy link straight to that city's own page. */
function HeroCityLink({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/cities/${slug}`}
      className="font-semibold text-foreground underline decoration-primary/50 decoration-2 underline-offset-4 transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}
