import { useNavigate } from "react-router-dom";
import { getIcon } from "@/lib/icons";
import { CityInfo } from "@/components/CityInfo";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Lightbulb, Check, MapPinned } from "lucide-react";

const VariesByCity = ({ cities }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/[0.06] p-5" data-testid="varies-by-city">
      <div className="flex items-start gap-2">
        <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-accent">This step's rules change from city to city.</p>
          <p className="mt-1 text-sm text-foreground/75">
            Offices, walk-in vs appointment, cost and waiting times differ. Pick your city to see the exact process.
          </p>
        </div>
      </div>
      <div className="mt-4 max-w-xs">
        <Select onValueChange={(slug) => navigate(`/city/${slug}`)}>
          <SelectTrigger data-testid="varies-city-select" className="rounded-full">
            <SelectValue placeholder="See differences for…" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.slug} value={c.slug} data-testid={`varies-city-${c.slug}`}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const GuideJourney = ({ phases, cityName, cities = [] }) => {
  return (
    <div className="space-y-12">
      {phases.map((phase, pi) => (
        <section key={phase.id} data-testid={`guide-phase-${phase.id}`}>
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-extrabold">
              {pi + 1}
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">{phase.title}</h2>
              <p className="text-sm text-muted-foreground">{phase.subtitle}</p>
            </div>
          </div>

          <Accordion type="multiple" className="mt-5 space-y-3">
            {phase.steps.map((step) => {
              const Icon = getIcon(step.icon);
              return (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card px-5"
                  data-testid={`guide-step-${step.id}`}
                >
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex flex-1 items-center gap-4 text-left">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-lg font-bold">{step.title}</span>
                          {step.city_specific && (
                            <Badge variant="outline" className="border-accent/40 text-[10px] uppercase tracking-wide text-accent">
                              varies by city
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{step.summary}</p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6">
                    <div className="border-t border-border pt-5">
                      <Badge variant="secondary" className="mb-3 text-[11px] font-semibold">
                        {step.applies_label}
                      </Badge>

                      <div className="space-y-2.5">
                        {step.details.map((d, i) => (
                          <p key={i} className="text-[15px] leading-relaxed text-foreground/85">{d}</p>
                        ))}
                      </div>

                      {step.city_info && (
                        <div className="mt-5">
                          <CityInfo info={step.city_info} cityName={cityName} />
                        </div>
                      )}
                      {step.city_specific && !step.city_info && (
                        <div className="mt-5">
                          <VariesByCity cities={cities} />
                        </div>
                      )}

                      <div className="mt-5 grid gap-6 sm:grid-cols-2">
                        {step.documents?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              <FileText className="h-4 w-4" /> What to bring
                            </div>
                            <ul className="mt-3 space-y-2">
                              {step.documents.map((d, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {step.tips?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              <Lightbulb className="h-4 w-4" /> Insider tips
                            </div>
                            <ul className="mt-3 space-y-2">
                              {step.tips.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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
};
