import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Languages,
  ShieldCheck,
  Sprout,
  TriangleAlert,
  Train,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Why Germany? The honest case for making the move",
  description:
    "Free tuition, a skills-hungry job market, real healthcare, and a clear path to permanent residence — plus the hard parts, told straight. Why internationals choose Germany.",
};

interface Reason {
  icon: LucideIcon;
  title: string;
  body: string;
  link?: { href: string; label: string };
}

const PILLARS: { kicker: string; heading: string; reasons: Reason[] }[] = [
  {
    kicker: "Study",
    heading: "A degree that costs less and counts more",
    reasons: [
      {
        icon: GraduationCap,
        title: "No tuition at public universities",
        body: "Germany's public universities charge no tuition fees, even for international students — you pay only a modest semester fee (often €150–350) that usually includes local transport.",
        link: { href: "/guide/choose-university-or-job", label: "Find your programme" },
      },
      {
        icon: ShieldCheck,
        title: "A qualification the world respects",
        body: "German engineering, science and research degrees carry weight globally, and the system is built around real, employable skills.",
        link: { href: "/guide/university-admission", label: "How admission works" },
      },
    ],
  },
  {
    kicker: "Work",
    heading: "An economy that actually needs you",
    reasons: [
      {
        icon: Briefcase,
        title: "A genuine skills shortage",
        body: "Europe's largest economy is short of skilled people in IT, engineering, healthcare and the trades — so the immigration system is designed to bring qualified workers in, not keep them out.",
        link: { href: "/guide/understand-your-paths", label: "Understand the work routes" },
      },
      {
        icon: Landmark,
        title: "The EU Blue Card and Chancenkarte",
        body: "The Blue Card fast-tracks residence for graduates earning from €50,700 (€45,934.20 in shortage fields), and the points-based Chancenkarte lets qualified people come and job-hunt from inside Germany.",
        link: { href: "/guide/understand-your-paths", label: "See which fits you" },
      },
      {
        icon: ShieldCheck,
        title: "Strong worker protections",
        body: "A statutory minimum wage (€13.90/hour in 2026), at least 20 paid vacation days by law — commonly 28–30 — and a culture that takes evenings and weekends seriously.",
      },
    ],
  },
  {
    kicker: "Life",
    heading: "A daily life that works",
    reasons: [
      {
        icon: HeartPulse,
        title: "Healthcare that has your back",
        body: "Health insurance is mandatory and universal — from day one you're covered by one of the world's most reliable systems, whether public or private.",
        link: { href: "/guide/health-insurance-from-home", label: "Sort your insurance" },
      },
      {
        icon: Train,
        title: "Get everywhere for €63 a month",
        body: "The Deutschlandticket gives you nationwide regional trains, trams and buses for one flat monthly fare — cities are dense, walkable and genuinely car-optional.",
        link: { href: "/guide/public-transport", label: "Sort your transport" },
      },
      {
        icon: ShieldCheck,
        title: "Safe, stable, and central",
        body: "Low crime, strong institutions, and a location that puts most of Europe within a short train or budget flight.",
      },
    ],
  },
  {
    kicker: "The long game",
    heading: "A path that leads somewhere",
    reasons: [
      {
        icon: Sprout,
        title: "Room to stay and grow",
        body: "Graduates get 18 months to find a job after finishing — one of Europe's most generous post-study offers — and skilled workers can bring their families.",
        link: { href: "/guide/residence-permit", label: "Your residence permit" },
      },
      {
        icon: Home,
        title: "Toward permanent residence — and a passport",
        body: "Time in Germany counts toward permanent residence, and naturalisation is now possible after as few as five years (three with exceptional integration).",
        link: { href: "/guide/visa-extension", label: "Staying long-term" },
      },
    ],
  },
];

const HARD_PARTS: Reason[] = [
  {
    icon: Languages,
    title: "The language is real",
    body: "You can start in English, but life, paperwork and deeper friendships open up with German. Be honest with yourself about learning it.",
    link: { href: "/guide/language-reality", label: "An honest look at the language" },
  },
  {
    icon: TriangleAlert,
    title: "The bureaucracy is a lot",
    body: "Appointments, forms, and letters in formal German — exactly the maze this whole site exists to walk you through, city by city.",
    link: { href: "/problems", label: "Common problems, solved" },
  },
  {
    icon: Home,
    title: "Housing is competitive",
    body: "In big cities, finding a first flat takes patience and a tidy application — start early and know the process.",
    link: { href: "/guide/find-housing-remotely", label: "Finding your first place" },
  },
];

export default function WhyGermanyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Reveal>
        <Kicker>Why Germany?</Kicker>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-5xl">
          Worth the paperwork — and here&apos;s the honest reason why.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Every step on this site is a bit of German bureaucracy. Before you take
          it on, it&apos;s fair to ask what you get in return. Here&apos;s the
          case — the genuinely great parts, and the hard parts told straight.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/plan" size="lg">
            Build my plan
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/costs" variant="secondary" size="lg">
            See what it costs
          </ButtonLink>
        </div>
      </Reveal>

      <div className="mt-16 space-y-14">
        {PILLARS.map((pillar) => (
          <Reveal key={pillar.kicker}>
            <Kicker>{pillar.kicker}</Kicker>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              {pillar.heading}
            </h2>
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
              {pillar.reasons.map((reason) => (
                <StaggerItem key={reason.title} className="h-full">
                  <ReasonCard reason={reason} />
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        ))}
      </div>

      {/* Honesty is the brand — name the hard parts too. */}
      <Reveal className="mt-16">
        <div className="rounded-[2.5rem] border border-border bg-card-muted/50 p-8 sm:p-12">
          <Kicker>The honest bit</Kicker>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
            It&apos;s not all easy. Go in with eyes open.
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            Germany rewards patience and preparation. These are the parts people
            find hardest — and every one of them has a page here to help.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {HARD_PARTS.map((reason) => (
              <ReasonCard key={reason.title} reason={reason} muted />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <div className="rounded-[2.5rem] bg-primary px-8 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold sm:text-4xl sm:leading-[1.15]">
            Convinced? Let&apos;s make it happen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Answer a few quick questions and get the exact steps for your path
            and your city.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/plan" variant="inverse" size="lg">
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <Link
              href="/process"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary-foreground/40 px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Explore the process
            </Link>
          </div>
        </div>
      </Reveal>

      <p className="mt-10 text-xs leading-relaxed text-muted">
        General information, not legal or immigration advice. Figures reflect
        2026 and can change — verify specifics on the linked guide steps and
        their official sources.
      </p>
    </div>
  );
}

function ReasonCard({ reason, muted = false }: { reason: Reason; muted?: boolean }) {
  const Icon = reason.icon;
  return (
    <div className="flex h-full items-start gap-4 rounded-3xl border border-border bg-card p-6">
      <span
        className={
          muted
            ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold"
            : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold">{reason.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{reason.body}</p>
        {reason.link && (
          <Link
            href={reason.link.href}
            className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            {reason.link.label}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
