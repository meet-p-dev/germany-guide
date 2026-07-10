import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getIcon } from "@/lib/icons";
import { CityInfo } from "@/components/CityInfo";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, CheckCircle2, Circle, FileText, Lightbulb, Info,
} from "lucide-react";

const StepDetail = ({ step, done, onToggle }) => {
  const Icon = getIcon(step.icon);
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-6 md:p-8"
      data-testid="step-detail"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-1 text-muted-foreground">{step.summary}</p>
          </div>
        </div>
      </div>

      {step.type_note && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 text-sm" data-testid="type-note">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-foreground/85">{step.type_note}</span>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        {step.details.map((d, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/85">{d}</p>
        ))}
      </div>

      {step.city_info && (
        <div className="mt-6">
          <CityInfo info={step.city_info} />
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
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

      <Button
        onClick={() => onToggle(step.id, !done)}
        data-testid="toggle-step-done"
        variant={done ? "secondary" : "default"}
        className="mt-8 gap-2 rounded-full font-semibold"
      >
        {done ? <><CheckCircle2 className="h-4 w-4" /> Completed — undo</> : <><Circle className="h-4 w-4" /> Mark as done</>}
      </Button>
    </motion.div>
  );
};

export const RoadmapView = ({ journey, completedSteps, onToggle }) => {
  const allSteps = useMemo(
    () => journey.phases.flatMap((p) => p.steps),
    [journey]
  );
  const [activeId, setActiveId] = useState(allSteps[0]?.id);
  const active = allSteps.find((s) => s.id === activeId) || allSteps[0];

  const completedSet = new Set(completedSteps);
  const total = allSteps.length;
  const doneCount = allSteps.filter((s) => completedSet.has(s.id)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Overall progress
            </span>
            <span className="font-display text-2xl font-extrabold text-primary" data-testid="progress-pct">
              {pct}%
            </span>
          </div>
          <Progress value={pct} className="mt-3 h-2" data-testid="progress-bar" />
          <p className="mt-2 text-sm text-muted-foreground">
            {doneCount} of {total} steps complete
          </p>
        </div>

        <nav className="mt-4 space-y-5" data-testid="roadmap-nav">
          {journey.phases.map((phase) => (
            <div key={phase.id}>
              <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {phase.title}
              </div>
              <div className="mt-2 space-y-1">
                {phase.steps.map((step) => {
                  const done = completedSet.has(step.id);
                  const isActive = step.id === activeId;
                  const Icon = getIcon(step.icon);
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveId(step.id)}
                      data-testid={`step-nav-${step.id}`}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-primary/40 bg-primary/[0.07]"
                          : "border-transparent hover:bg-secondary"
                      }`}
                    >
                      <span
                        onClick={(e) => { e.stopPropagation(); onToggle(step.id, !done); }}
                        data-testid={`step-check-${step.id}`}
                        className={`grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors ${
                          done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium leading-tight ${done ? "text-muted-foreground line-through" : ""}`}>
                        {step.title}
                      </span>
                      {step.city_specific && (
                        <Badge variant="outline" className="ml-auto border-accent/40 text-[10px] text-accent">
                          city
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Detail */}
      <div>
        <AnimatePresence mode="wait">
          {active && (
            <StepDetail
              step={active}
              done={completedSet.has(active.id)}
              onToggle={onToggle}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
