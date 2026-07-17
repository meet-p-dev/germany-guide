"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import type { PhaseWithSteps } from "@/lib/content";

/**
 * The journey as a vertical storytelling timeline: a line draws itself as you
 * scroll, phases anchor along it, steps fan out as cards.
 */
export function ProcessTimeline({ phases }: { phases: PhaseWithSteps[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.7", "end 0.9"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
  });

  return (
    <div ref={containerRef} className="relative mt-14">
      {/* the track */}
      <div
        aria-hidden
        className="absolute bottom-4 left-[21px] top-1 w-0.5 rounded-full bg-border"
      />
      {/* the animated fill */}
      <motion.div
        aria-hidden
        style={{ scaleY: lineProgress }}
        className="absolute bottom-4 left-[21px] top-1 w-0.5 origin-top rounded-full bg-primary"
      />

      <ol className="space-y-12">
        {phases.map((phase, index) => (
          <li key={phase.slug} className="relative pl-16">
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="font-display absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md"
            >
              {index + 1}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {phase.title}
              </h2>
              {phase.subtitle && (
                <p className="mt-2 max-w-xl leading-relaxed text-muted">
                  {phase.subtitle}
                </p>
              )}

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {phase.steps.map((step) => (
                  <li key={step.slug}>
                    <Link
                      href={`/guide/${step.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-medium leading-snug">
                          {step.title}
                        </span>
                        {step.city_variable && (
                          <span
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
                            title="Differs by city"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </span>
                      {step.summary && (
                        <span className="mt-2 text-sm leading-relaxed text-muted">
                          {step.summary}
                        </span>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Read the guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {phase.steps.some((step) => step.applies_to !== "both") && (
                <p className="mt-3 text-xs text-muted">
                  Some steps here apply only to students or only to workers —
                  your personal plan filters them for you.
                </p>
              )}
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
