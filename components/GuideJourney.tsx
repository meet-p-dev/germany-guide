"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CityFactsBox } from "@/components/CityFactsBox";
import { Markdown } from "@/components/Markdown";
import type { JourneyPhase } from "@/lib/queries/journey";
import {
  Plane,
  Banknote,
  Stethoscope,
  Home,
  MapPin,
  MapPinned,
  Landmark,
  FileDigit,
  IdCard,
  Tv,
  Smartphone,
  Shield,
  Car,
  GraduationCap,
  Languages,
  Store,
  Flag,
  ArrowRight,
  Check,
  FileText,
  Lightbulb,
  Clock,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  plane: Plane,
  banknote: Banknote,
  stethoscope: Stethoscope,
  home: Home,
  "map-pin": MapPin,
  landmark: Landmark,
  "file-digit": FileDigit,
  "id-card": IdCard,
  tv: Tv,
  smartphone: Smartphone,
  shield: Shield,
  car: Car,
  "graduation-cap": GraduationCap,
  languages: Languages,
  store: Store,
  flag: Flag,
};

function VariesByCity({ cities }: { cities: { slug: string; name: string }[] }) {
  const router = useRouter();
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/[0.06] p-5">
      <div className="flex items-start gap-2">
        <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-accent">
            This step&apos;s rules change from city to city.
          </p>
          <p className="mt-1 text-sm text-foreground/75">
            Offices, walk-in vs appointment, cost and waiting times differ. Pick
            your city to see the exact process.
          </p>
        </div>
      </div>
      <select
        defaultValue=""
        onChange={(e) => e.target.value && router.push(`/germany/${e.target.value}`)}
        className="mt-4 w-full max-w-xs rounded-full border border-input bg-background px-4 py-2 text-sm"
        aria-label="See differences for your city"
      >
        <option value="" disabled>
          See differences for…
        </option>
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * The Emergent "GuideJourney": numbered phase sections with expandable step
 * cards. On a city page each city-specific step shows the real office box
 * (CityFactsBox); on the generic /process page it shows a "varies by city"
 * picker. Verified task content fills the card; life-step skeletons say so.
 */
export function GuideJourney({
  phases,
  cityName,
  cities = [],
}: {
  phases: JourneyPhase[];
  cityName?: string;
  cities?: { slug: string; name: string }[];
}) {
  return (
    <div className="space-y-12">
      {phases.map((phase, pi) => (
        <section key={phase.slug}>
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground">
              {pi + 1}
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{phase.title}</h2>
              {phase.subtitle && (
                <p className="text-sm text-muted-foreground">{phase.subtitle}</p>
              )}
            </div>
          </div>

          <Accordion type="multiple" className="mt-5 space-y-3">
            {phase.steps.map((step) => {
              const Icon = step.icon ? (ICONS[step.icon] ?? CircleDot) : CircleDot;
              return (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card px-5"
                >
                  <AccordionTrigger className="py-5">
                    <div className="flex flex-1 items-center gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold">{step.title}</span>
                          {step.titleDe && (
                            <span className="text-sm text-muted-foreground">
                              {step.titleDe}
                            </span>
                          )}
                          {step.citySpecific && (
                            <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                              varies by city
                            </span>
                          )}
                        </div>
                        {step.summary && (
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {step.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6">
                    <div className="space-y-5 border-t border-border pt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                          {step.appliesLabel}
                        </span>
                        {step.isSkeleton && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2.5 py-1 text-[11px] font-semibold text-accent">
                            <Clock className="h-3 w-3" /> Detailed guide coming soon
                          </span>
                        )}
                      </div>

                      {step.noteMd && (
                        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4 text-sm text-foreground/85">
                          <Markdown>{step.noteMd}</Markdown>
                        </div>
                      )}

                      {step.detailsMd ? (
                        <div className="text-[15px] leading-relaxed text-foreground/85">
                          <Markdown>{step.detailsMd}</Markdown>
                        </div>
                      ) : (
                        step.isSkeleton && (
                          <p className="text-[15px] leading-relaxed text-foreground/75">
                            {step.summary} A full step-by-step guide for this is on
                            the way — the essentials above still apply.
                          </p>
                        )
                      )}

                      {step.cityInfo ? (
                        <CityFactsBox
                          cityName={cityName ?? "your city"}
                          variant={step.cityInfo}
                        />
                      ) : (
                        step.citySpecific &&
                        cities.length > 0 && <VariesByCity cities={cities} />
                      )}

                      {(step.documents.length > 0 || step.tips.length > 0) && (
                        <div className="grid gap-6 sm:grid-cols-2">
                          {step.documents.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                <FileText className="h-4 w-4" /> What to bring
                              </div>
                              <ul className="mt-3 space-y-2">
                                {step.documents.map((d, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{" "}
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.tips.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                <Lightbulb className="h-4 w-4" /> Insider tips
                              </div>
                              <ul className="mt-3 space-y-2">
                                {step.tips.map((t, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-foreground/85"
                                  >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{" "}
                                    {t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {step.fullGuideHref && (
                        <Link
                          href={step.fullGuideHref}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          See the full guide <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
