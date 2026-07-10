import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { RoadmapView } from "@/components/RoadmapView";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Settings2 } from "lucide-react";

const TYPE_LABELS = { student: "Student", job: "Work / Job", refugee: "Refugee / Asylum", other: "Family / Other" };

export default function Roadmap() {
  const [params] = useSearchParams();
  const city = params.get("city");
  const type = params.get("type");
  const { user } = useAuth();

  const [journey, setJourney] = useState(null);
  const [cityMeta, setCityMeta] = useState(null);
  const [completed, setCompleted] = useState([]);
  const storeKey = `ankommen:progress:${type}:${city}`;

  useEffect(() => {
    document.title = "Your roadmap — Ankommen";
    if (!city || !type) return;
    setJourney(null);
    Promise.all([
      api.get(`/content/journey?city=${city}&type=${type}`),
      api.get(`/content/city/${city}`),
    ]).then(([j, c]) => {
      setJourney(j.data);
      setCityMeta(c.data);
    });
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "[]");
      setCompleted(Array.isArray(saved) ? saved : []);
    } catch { setCompleted([]); }
  }, [city, type]); // eslint-disable-line

  const onToggle = useCallback((stepId, done) => {
    setCompleted((prev) => {
      const next = done ? [...new Set([...prev, stepId])] : prev.filter((s) => s !== stepId);
      localStorage.setItem(storeKey, JSON.stringify(next));
      return next;
    });
    if (done) toast.success("Nice — one step closer.");
  }, [storeKey]);

  if (!city || !type) {
    return (
      <div className="App relative"><div className="relative z-10"><Navbar />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Let's set up your roadmap</h1>
          <Link to="/explore"><Button className="mt-6 rounded-full font-semibold">Build my plan</Button></Link>
        </div>
      </div></div>
    );
  }

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your relocation roadmap
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                {cityMeta?.name || city}
                <span className="text-muted-foreground"> · {TYPE_LABELS[type]}</span>
              </h1>
              {cityMeta && <p className="mt-2 max-w-2xl text-foreground/75">{cityMeta.intro}</p>}
            </div>
            <Link to="/explore">
              <Button variant="outline" className="gap-2 rounded-full font-semibold">
                <Settings2 className="h-4 w-4" /> Change city / type
              </Button>
            </Link>
          </div>

          {/* Save banner */}
          {!user && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground/85">
                  You're browsing as a guest. Create a free account to save your progress across devices.
                </p>
              </div>
              <Link to="/register" data-testid="roadmap-signup-btn">
                <Button size="sm" className="rounded-full font-semibold">Save my progress</Button>
              </Link>
            </div>
          )}

          <div className="mt-8">
            {journey ? (
              <RoadmapView journey={journey} completedSteps={completed} onToggle={onToggle} />
            ) : (
              <div className="grid min-h-[40vh] place-items-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
