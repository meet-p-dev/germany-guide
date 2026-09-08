import type { Metadata } from "next";
import Image from "next/image";
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

const BASE_URL = "https://www.germanyguide.net";

export const metadata: Metadata = {
  title: "Why Germany? The Honest Case for Moving",
  description:
    "Free tuition, a skills-hungry job market, real healthcare, and a clear path to permanent residence, plus the hard parts, told straight. Why internationals choose Germany.",
  alternates: { canonical: `${BASE_URL}/why-germany` },
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
        body: "Germany's public universities charge no tuition fees, even for international students. You pay only a modest semester fee (often €150 to €350) that usually includes local transport.",
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
        body: "Europe's largest economy is short of skilled people in IT, engineering, healthcare and the trades, so the immigration system is designed to bring qualified workers in rather than keep them out.",
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
        body: "A statutory minimum wage (€13.90 an hour in 2026), at least 20 paid vacation days by law (commonly 28 to 30), and a culture that takes evenings and weekends seriously.",
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
        body: "Health insurance is mandatory and universal. From day one you are covered by one of the world's most reliable systems, whether public or private.",
        link: { href: "/guide/health-insurance-from-home", label: "Sort your insurance" },
      },
      {
        icon: Train,
        title: "Get everywhere for €63 a month",
        body: "The Deutschlandticket gives you nationwide regional trains, trams and buses for one flat monthly fare. Cities are dense, walkable and car-optional.",
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
        body: "Graduates get 18 months to find a job after finishing, one of Europe's most generous post-study offers, and skilled workers can bring their families.",
        link: { href: "/guide/residence-permit", label: "Your residence permit" },
      },
      {
        icon: Home,
        title: "Toward permanent residence, and a passport",
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
    body: "Appointments, forms, and letters in formal German: exactly the maze this whole site exists to walk you through, city by city.",
    link: { href: "/problems", label: "Common problems, solved" },
  },
  {
    icon: Home,
    title: "Housing is competitive",
    body: "In big cities, finding a first flat takes patience and a tidy application. Start early and learn the process.",
    link: { href: "/guide/find-housing-remotely", label: "Finding your first place" },
  },
];

export default function WhyGermanyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Reveal>
        <Kicker>The honest case</Kicker>
        <h1 className="font-display mt-4 text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
          Why Germany?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Before the forms, the appointments and the formal letters, it&apos;s
          fair to ask what you get in return. The answer starts with a story,
          because you are not the first to make this journey.
        </p>
      </Reveal>

      {/* The story: Germany as a country built, rebuilt and renewed by
          people who arrived with a suitcase and a plan. */}
      <div className="mt-20 space-y-20">
        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Kicker>1955 onwards</Kicker>
              <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
                A country rebuilt by people who arrived with a suitcase
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                After 1945, Germany rebuilt itself from rubble into Europe&apos;s
                largest economy, and it could not have done so alone. From 1955
                it signed recruitment agreements with Italy, then Greece, Spain
                and Turkey, and millions of so-called guest workers
                (Gastarbeiter) arrived by train with one bag and a work
                contract. Many planned to stay two years. They stayed for good,
                raised families, and helped build the prosperity people move
                here for today.
              </p>
            </div>
            <StoryImage
              src="/images/why-gastarbeiterinnen-1974.jpg"
              alt="Five women in headscarves at a textile mill, one showing another a spool of thread, Ebersbach, 1974"
              credit="Bundesarchiv, Bild 183-N0916-0005 / Häßler, Ulrich · CC BY-SA 3.0 DE"
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <StoryImage
              src="/images/why-berlin-reichstag.jpg"
              alt="The Reichstag's glass dome in Berlin, with the Charité hospital tower behind it"
              className="order-last lg:order-first"
            />
            <div>
              <Kicker>A nation of arrivals</Kicker>
              <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
                Today, more than one in four has an immigration story
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                Reunification, the European Union, and decades of students,
                engineers, nurses and researchers arriving from everywhere have
                made modern Germany one of the world&apos;s great immigration
                countries. More than a quarter of the people living here have
                immigration in their family story. The country you are
                considering is not a closed club. It is a place that has been
                absorbing newcomers, imperfectly but persistently, for seventy
                years.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Kicker>Now: deliberately open</Kicker>
              <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
                The door isn&apos;t ajar. It&apos;s held open.
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                An ageing workforce means Germany needs hundreds of thousands
                of skilled newcomers every year, so the rules keep bending
                toward you: the Skilled Immigration Act opened more routes, the
                EU Blue Card thresholds came down, the Chancenkarte lets
                qualified people come and search from inside the country, and
                citizenship is now possible after five years. Immigration
                isn&apos;t a loophole here; it&apos;s the plan.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                What hasn&apos;t changed since the Gastarbeiter era: the
                counters, the forms, and the letters in formal German. Every
                generation of newcomers has faced that same maze: the
                Anmeldung, the Ausländerbehörde, the Krankenkasse. That maze is
                exactly why this site exists. You walk the same road they did,
                but with a guide that knows your city.
              </p>
            </div>
            <StoryImage
              src="/images/why-munich-karlstor.jpg"
              alt="A crowded evening street scene through the medieval Karlstor gate in Munich"
            />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] border border-border bg-card-muted/50 p-8 sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              So what do you actually get?
            </h2>
            <p className="mt-2 max-w-xl leading-relaxed text-muted">
              The concrete case (study, work, daily life and the long game),
              plus the hard parts told straight.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/plan" size="lg">
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/costs" variant="secondary" size="lg">
              See what it costs
            </ButtonLink>
          </div>
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
            find hardest, and every one of them has a page here to help.
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
        2026 and can change. Verify specifics on the linked guide steps and
        their official sources.
      </p>
    </div>
  );
}

/**
 * One story photo, rounded to match the site's card language. `credit` is
 * only passed for images whose license requires visible attribution (the
 * Bundesarchiv photo) — Unsplash/Pexels photos are credited in
 * public/images/CREDITS.md instead, per the site's licensing rule.
 */
function StoryImage({
  src,
  alt,
  credit,
  className,
}: {
  src: string;
  alt: string;
  credit?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-3xl border border-border">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {credit && (
        <figcaption className="mt-2 text-xs text-muted">{credit}</figcaption>
      )}
    </figure>
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
