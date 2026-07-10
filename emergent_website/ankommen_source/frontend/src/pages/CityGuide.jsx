import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideJourney } from "@/components/GuideJourney";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, GitCompareArrows } from "lucide-react";

export default function CityGuide() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    api.get(`/content/city-guide/${slug}`)
      .then((r) => {
        setData(r.data);
        document.title = `${r.data.name} — Ankommen`;
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="App relative"><div className="relative z-10"><Navbar />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">City not found</h1>
          <Link to="/process"><Button className="mt-6 rounded-full font-semibold">Back to the guide</Button></Link>
        </div>
      </div></div>
    );
  }

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />

        {!data ? (
          <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Hero */}
            <section className="relative">
              <div className="relative h-[300px] overflow-hidden md:h-[380px]">
                <img src={data.image} alt={data.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                <div className="absolute inset-0 flex items-end">
                  <div className="mx-auto w-full max-w-5xl px-5 pb-8 md:px-8 md:pb-10">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                      <Link to="/process" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
                        <ArrowLeft className="h-4 w-4" /> All cities
                      </Link>
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{data.state}</div>
                      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                        Settling in {data.name}
                      </h1>
                      <p className="mt-3 max-w-2xl text-white/85">{data.tagline}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
                <p className="text-[15px] leading-relaxed text-foreground/85">{data.intro}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/explore`} data-testid="cityguide-build-btn">
                    <Button className="gap-2 rounded-full font-semibold">Build my {data.name} plan <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                  <Link to="/compare" data-testid="cityguide-compare-btn">
                    <Button variant="outline" className="gap-2 rounded-full font-semibold"><GitCompareArrows className="h-4 w-4" /> Compare with other cities</Button>
                  </Link>
                </div>
              </div>

              <div className="mt-12">
                <GuideJourney phases={data.phases} cityName={data.name} />
              </div>
            </section>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
