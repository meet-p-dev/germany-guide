import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin, ArrowRight } from "lucide-react";

export default function CitiesList() {
  const [cities, setCities] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "All cities — Ankommen";
    api.get("/content/cities").then((r) => setCities(r.data));
  }, []);

  const filtered = useMemo(() => {
    if (!cities) return [];
    const term = q.trim().toLowerCase();
    return cities
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.state.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, q]);

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />

        <section className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explore by city</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Pick your German city
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">
            Each city runs its own offices and rules. Choose yours to see the exact process,
            from registration to residence permit.
          </p>

          <div className="relative mt-8 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="city-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city or state…"
              className="h-12 rounded-full pl-11"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          {!cities ? (
            <div className="grid min-h-[30vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground" data-testid="city-count">
                {filtered.length} {filtered.length === 1 ? "city" : "cities"}
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  No cities match “{q}”. Try another name.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((c, i) => (
                    <motion.div
                      key={c.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    >
                      <Link
                        to={`/city/${c.slug}`}
                        data-testid={`cities-card-${c.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                          <div className="absolute bottom-3 left-4 text-white">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
                              <MapPin className="h-3.5 w-3.5" /> {c.state}
                            </div>
                            <div className="mt-0.5 font-display text-2xl font-extrabold">{c.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <p className="text-sm text-foreground/75">{c.tagline}</p>
                          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                            See the process <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
