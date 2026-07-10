import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { JourneySetup } from "@/components/JourneySetup";

export default function Explore() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Build your plan — Ankommen";
  }, []);

  const handleComplete = async (type, city) => {
    navigate(`/roadmap?city=${city}&type=${type}`);
  };

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
          <JourneySetup onComplete={handleComplete} ctaLabel="See my roadmap" />
        </div>
      </div>
    </div>
  );
}
