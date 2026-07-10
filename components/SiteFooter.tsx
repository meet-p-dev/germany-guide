import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { DISCLAIMER_TEXT } from "@/components/Disclaimer";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Guides",
    links: [
      { href: "/process", label: "The process" },
      { href: "/journey", label: "The journey" },
      { href: "/germany", label: "Cities" },
      { href: "/compare", label: "Compare" },
      { href: "/glossary", label: "Glossary" },
    ],
  },
  {
    heading: "Help",
    links: [
      { href: "/problems", label: "Problems & solutions" },
      { href: "/letters", label: "Letter helper" },
      { href: "/explore", label: "Build my plan" },
    ],
  },
];

/** Ankommen-style footer, carrying Germany Guide's disclaimers. */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoLockup />
            <p className="mt-3 text-sm text-muted-foreground">
              Your calm, step-by-step guide to German bureaucracy — tailored to
              your city and your situation.
            </p>
          </div>
          <div className="flex gap-12 sm:gap-16 text-sm">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {col.heading}
                </span>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 space-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>{DISCLAIMER_TEXT}</p>
          <p>
            Made for internationals in Germany. Content is community-reviewed;
            always double-check with the official source linked on each page.
          </p>
          <p>
            Some pages link to partner services marked “Partner”; if you sign up
            through them we may earn a commission, at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  );
}
