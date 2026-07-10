import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideJourney } from "@/components/GuideJourney";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, GitCompareArrows, MapPin } from "lucide-react";

export default function Process() {
  const [guide, setGuide] = useState(null);
  const [cities, setCities] = useState([]);
  const [basics, setBasics] = useState([]);

  useEffect(() => {
    document.title = "The process — Ankommen";
    Promise.all([
      api.get("/content/guide"),
      api.get("/content/cities"),
      api.get("/content/germany-basics"),
    ]).then(([g, c, b]) => {
      setGuide(g.data);
      setCities(c.data);
      setBasics(b.data.items);
    });
  }, []);

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />

        {/* Intro / story */}
        <section className="mx-auto max-w-4xl px-5 pt-14 md:px-8 md:pt-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The complete process</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Settling in Germany, <span className="text-primary">step by step.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">
              Wherever you land in Germany, the <strong>journey is the same</strong> — get your
              visa, find a home, register your address, sort out money, health insurance and
              your residence permit. What changes is the <strong>local rulebook</strong>: one
              city lets you walk in, the next demands an appointment booked weeks ahead.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80">
              Read the process below. Whenever a step's rules depend on where you live, you'll
              see a <span className="font-semibold text-accent">“varies by city”</span> tag —
              pick your city to reveal the exact office, cost and waiting time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore" data-testid="process-build-btn">
                <Button className="gap-2 rounded-full font-semibold">Build my personal plan <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/compare" data-testid="process-compare-btn">
                <Button variant="outline" className="gap-2 rounded-full font-semibold"><GitCompareArrows className="h-4 w-4" /> Compare cities</Button>
              </Link>
            </div>

            {cities.length > 0 && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Jump straight to your city
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cities.slice(0, 6).map((c) => (
                    <Link key={c.slug} to={`/city/${c.slug}`} data-testid={`process-jump-${c.slug}`}>
                      <Button variant="secondary" size="sm" className="gap-1.5 rounded-full font-semibold">
                        <MapPin className="h-3.5 w-3.5" /> {c.name}
                      </Button>
                    </Link>
                  ))}
                  {cities.length > 6 && (
                    <Link to="/cities">
                      <Button variant="ghost" size="sm" className="gap-1.5 rounded-full font-semibold">
                        +{cities.length - 6} more <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Guide */}
        <section className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          {guide ? (
            <GuideJourney phases={guide.phases} cities={cities} />
          ) : (
            <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          )}
        </section>

        {/* Germany vs other countries */}
        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Good to know</span>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
              Germany vs. what you're used to
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/75">
              A few things routinely surprise newcomers. Keep these in mind and daily life gets a lot smoother.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {basics.map((b, i) => {
                const Icon = getIcon(b.icon);
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.06 }}
                    className="rounded-2xl border border-border bg-card p-6"
                    data-testid={`basic-${b.id}`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">{b.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* City strip */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explore by city</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">See the process for your city</h2>
            </div>
            <Link to="/cities"><Button variant="outline" className="gap-2 rounded-full font-semibold">View all cities <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.slice(0, 6).map((c) => (
              <Link key={c.slug} to={`/city/${c.slug}`} data-testid={`process-city-${c.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative h-40 overflow-hidden">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                    <MapPin className="h-4 w-4" />
                    <span className="font-display text-xl font-extrabold">{c.name}</span>
                  </div>
                </div>
                <p className="p-5 text-sm text-foreground/75">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
