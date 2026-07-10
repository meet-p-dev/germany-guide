import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { RoadmapView } from "@/components/RoadmapView";
import { JourneySetup } from "@/components/JourneySetup";
import { Button } from "@/components/ui/button";
import { Loader2, Settings2 } from "lucide-react";

const TYPE_LABELS = { student: "Student", job: "Work / Job", refugee: "Refugee / Asylum", other: "Family / Other" };

export default function Dashboard() {
  const { user, updateProfile, toggleStep } = useAuth();
  const [journey, setJourney] = useState(null);
  const [cityMeta, setCityMeta] = useState(null);
  const [editing, setEditing] = useState(false);

  const hasProfile = user && user.selected_city && user.user_type;

  useEffect(() => { document.title = "Dashboard — Ankommen"; }, []);

  useEffect(() => {
    if (!hasProfile) { setJourney(null); return; }
    setJourney(null);
    Promise.all([
      api.get(`/content/journey?city=${user.selected_city}&type=${user.user_type}`),
      api.get(`/content/city/${user.selected_city}`),
    ]).then(([j, c]) => {
      setJourney(j.data);
      setCityMeta(c.data);
    });
  }, [hasProfile, user?.selected_city, user?.user_type]);

  const onToggle = useCallback(async (stepId, done) => {
    await toggleStep(stepId, done);
    if (done) toast.success("Step completed — great work!");
  }, [toggleStep]);

  const saveProfile = async (type, city) => {
    await updateProfile({ user_type: type, selected_city: city });
    setEditing(false);
    toast.success("Your roadmap is ready.");
  };

  if (!user) return null;

  if (!hasProfile || editing) {
    return (
      <div className="App relative">
        <div className="grain" />
        <div className="relative z-10">
          <Navbar />
          <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {editing ? "Update your plan" : `Welcome, ${user.name || "there"}!`}
              </h1>
              <p className="mt-2 text-muted-foreground">Let's set up your personalised German relocation roadmap.</p>
            </div>
            <JourneySetup
              initialType={user.user_type}
              initialCity={user.selected_city}
              onComplete={saveProfile}
              ctaLabel="Save & view roadmap"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {user.name ? `${user.name}'s roadmap` : "Your roadmap"}
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                {cityMeta?.name || user.selected_city}
                <span className="text-muted-foreground"> · {TYPE_LABELS[user.user_type]}</span>
              </h1>
              {cityMeta && <p className="mt-2 max-w-2xl text-foreground/75">{cityMeta.intro}</p>}
            </div>
            <Button variant="outline" data-testid="edit-profile-btn" onClick={() => setEditing(true)} className="gap-2 rounded-full font-semibold">
              <Settings2 className="h-4 w-4" /> Change city / type
            </Button>
          </div>

          <div className="mt-8">
            {journey ? (
              <RoadmapView journey={journey} completedSteps={user.completed_steps || []} onToggle={onToggle} />
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
