import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

export const JourneySetup = ({ initialType, initialCity, onComplete, ctaLabel = "See my roadmap" }) => {
  const [meta, setMeta] = useState(null);
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [type, setType] = useState(initialType || null);
  const [city, setCity] = useState(initialCity || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/content/meta").then((r) => setMeta(r.data));
  }, []);

  if (!meta) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const finish = async () => {
    setSubmitting(true);
    await onComplete(type, city);
    setSubmitting(false);
  };

  return (
    <div>
      {/* stepper */}
      <div className="mb-8 flex items-center gap-3">
        {["Your situation", "Your city"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${
                step >= i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > i ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-sm font-semibold ${step >= i ? "" : "text-muted-foreground"}`}>{label}</span>
            {i === 0 && <span className="hidden h-px w-10 bg-border sm:block" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Why are you coming to Germany?
          </h2>
          <p className="mt-2 text-muted-foreground">We'll tailor every step to your situation.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {meta.user_types.map((t) => {
              const Icon = getIcon(t.icon);
              const selected = type === t.id;
              return (
                <button
                  key={t.id}
                  data-testid={`type-option-${t.id}`}
                  onClick={() => setType(t.id)}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors ${
                    selected ? "border-primary bg-primary/[0.06]" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold">{t.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{t.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end">
            <Button data-testid="setup-next" disabled={!type} onClick={() => setStep(1)} className="gap-2 rounded-full font-semibold">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Which city are you moving to?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Rules differ by city — registration, offices and waiting times all change.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meta.cities.map((c) => {
              const selected = city === c.slug;
              return (
                <button
                  key={c.slug}
                  data-testid={`city-option-${c.slug}`}
                  onClick={() => setCity(c.slug)}
                  className={`group overflow-hidden rounded-2xl border text-left transition-colors ${
                    selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {selected && (
                      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-display text-lg font-bold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.state}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)} className="gap-2 rounded-full font-semibold">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button data-testid="setup-finish" disabled={!city || submitting} onClick={finish} className="gap-2 rounded-full font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {ctaLabel}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
