import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, MapPin, ListChecks, Compass, ShieldCheck, Footprints, CalendarClock,
} from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjB1bnBhY2tpbmclMjBib3hlcyUyMG1vdmluZyUyMGhvdXNlfGVufDB8fHx8MTc4MzYyNzQ2NXww&ixlib=rb-4.1.0&q=85";

const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    document.title = "Ankommen — Settle in Germany with clarity";
    api.get("/content/meta").then((r) => {
      setCities(r.data.cities);
      setTypes(r.data.user_types);
    });
  }, []);

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pt-14 md:px-8 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.span variants={rise} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> City-specific German relocation
              </motion.span>
              <motion.h1 variants={rise} className="mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Arrive in Germany <span className="text-primary">without the chaos.</span>
              </motion.h1>
              <motion.p variants={rise} className="mt-5 max-w-lg text-lg leading-relaxed text-foreground/80">
                From your visa to your Anmeldung — a clear, personalised checklist that
                knows the difference between doing it in Munich, Berlin, Hamburg,
                Frankfurt or Cologne.
              </motion.p>
              <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/explore" data-testid="hero-explore-btn">
                  <Button size="lg" className="gap-2 rounded-full text-base font-semibold">
                    Build my plan <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/process" data-testid="hero-browse-btn">
                  <Button size="lg" variant="outline" className="gap-2 rounded-full text-base font-semibold">
                    <Compass className="h-4 w-4" /> Explore the process
                  </Button>
                </Link>
              </motion.div>
              <motion.p variants={rise} className="mt-4 text-sm text-muted-foreground">
                Free to explore. No account needed to browse the full journey.
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="overflow-hidden rounded-3xl border border-border shadow-lg">
                <img src={HERO} alt="Moving into a new home in Germany" className="h-[380px] w-full object-cover md:h-[460px]" />
              </div>
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg md:-left-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Footprints className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <div className="font-display font-bold">Munich</div>
                  <div className="text-muted-foreground">Walk-in registration ok</div>
                </div>
              </div>
              <div className="absolute -right-3 top-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg md:-right-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <div className="font-display font-bold">Berlin</div>
                  <div className="text-muted-foreground">Appointment required</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</span>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
            One calm flow, from touchdown to fully settled.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Compass, title: "Tell us your story", body: "Student, worker, refugee or family — pick your situation and your German city." },
              { icon: ListChecks, title: "Get your roadmap", body: "A phase-by-phase checklist, ordered so nothing blocks the next step." },
              { icon: ShieldCheck, title: "Track & settle", body: "Tick off each task, see your progress, and know exactly what's next." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-foreground/75">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Cities */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cities covered</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Every city plays by its own rules.</h2>
            </div>
            <Link to="/cities"><Button variant="outline" className="rounded-full font-semibold gap-2">View all cities <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.slice(0, 6).map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <Link to={`/city/${c.slug}`} data-testid={`landing-city-${c.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative h-48 overflow-hidden">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <div className="font-display text-2xl font-extrabold">{c.name}</div>
                      <div className="text-sm text-white/80">{c.state}</div>
                    </div>
                  </div>
                  <p className="p-5 text-sm text-foreground/75">{c.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* User types */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="rounded-3xl border border-border bg-secondary/50 p-8 md:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">For everyone arriving</span>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
              Whoever you are, there's a path for you.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {types.map((t) => {
                const Icon = getIcon(t.icon);
                return (
                  <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold">{t.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground md:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Ready to make Germany feel like home?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Build your personalised roadmap in under a minute.
            </p>
            <Link to="/explore" data-testid="cta-start-btn" className="mt-8 inline-block">
              <Button size="lg" variant="secondary" className="gap-2 rounded-full text-base font-semibold">
                Start my plan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
