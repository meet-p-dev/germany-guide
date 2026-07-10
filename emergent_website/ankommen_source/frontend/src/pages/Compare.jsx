import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { modeStyles } from "@/components/CityInfo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Clock, Euro, ExternalLink, ArrowRight } from "lucide-react";

const CityCompareCard = ({ city, stepId }) => {
  const info = city.notes[stepId];
  if (!info) return null;
  const ms = modeStyles[info.mode] || modeStyles.hybrid;
  const ModeIcon = ms.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
      data-testid={`compare-card-${city.slug}`}
    >
      <div className="relative h-28 overflow-hidden">
        <img src={city.image} alt={city.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-4 text-white">
          <div className="font-display text-xl font-extrabold">{city.name}</div>
          <div className="text-xs text-white/80">{city.state}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${ms.cls}`} data-testid={`compare-mode-${city.slug}`}>
          <ModeIcon className="h-3.5 w-3.5" /> {info.mode_label}
        </span>
        <h4 className="mt-3 font-display text-base font-bold">{info.office}</h4>
        <p className="mt-1 text-sm text-foreground/75">{info.detail}</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {info.address}</div>
          <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {info.processing_time}</div>
          <div className="flex items-start gap-2"><Euro className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {info.cost}</div>
        </div>

        <div className="mt-auto flex items-center gap-4 pt-5">
          {info.booking_url && (
            <a href={info.booking_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Official page <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Link to={`/city/${city.slug}`} className="ml-auto text-sm font-semibold text-foreground/70 hover:text-primary">
            Full guide →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function Compare() {
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = "Compare cities — Ankommen";
    api.get("/content/compare").then((r) => setData(r.data));
  }, []);

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />
        <section className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">City comparison</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Same task, <span className="text-primary">five different rulebooks.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/80">
            The steps that trip people up most are the ones the local authorities control.
            Compare them side by side across Munich, Berlin, Hamburg, Frankfurt and Cologne.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
          {!data ? (
            <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue={data.steps[0].id}>
              <TabsList data-testid="compare-tabs" className="h-auto flex-wrap rounded-full">
                {data.steps.map((s) => (
                  <TabsTrigger key={s.id} value={s.id} data-testid={`compare-tab-${s.id}`} className="rounded-full">
                    {s.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {data.steps.map((s) => (
                <TabsContent key={s.id} value={s.id} className="mt-8">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {data.cities.map((c) => (
                      <CityCompareCard key={c.slug} city={c} stepId={s.id} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
          <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Know your city. Now make it personal.
            </h2>
            <Link to="/explore" data-testid="compare-build-btn" className="mt-8 inline-block">
              <Button size="lg" variant="secondary" className="gap-2 rounded-full text-base font-semibold">Build my plan <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
