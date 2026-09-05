"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { SubscribeForm } from "@/components/newsletter/subscribe-form";
import { cn } from "@/lib/utils";

const GUIDE_LINKS = [
  { href: "/process", label: "The process" },
  { href: "/journey", label: "My journey" },
  { href: "/cities", label: "Cities" },
  { href: "/costs", label: "What it costs" },
  { href: "/why-germany", label: "Why Germany" },
];

const HELP_LINKS = [
  { href: "/problems", label: "Problems & solutions" },
  { href: "/letters", label: "Letter helper" },
  { href: "/updates", label: "Updates" },
  { href: "/glossary", label: "Glossary" },
];

const LEGAL_LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Your calm, step-by-step guide to German bureaucracy — tailored to
              your city and your situation.
            </p>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              When the rules change
            </p>
            <SubscribeForm source="footer" compact className="mt-4" />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn title="Guides" links={GUIDE_LINKS} />
            <FooterColumn title="Help" links={HELP_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>
        <div className="mt-12 space-y-1.5 border-t border-border pt-6 text-xs leading-relaxed text-muted">
          <p>
            This is general information, not legal advice. Rules and procedures
            change — always verify with the linked official source before
            acting.
          </p>
          <p>
            Made for internationals in Germany. Every city-specific detail
            carries a last-verified date; double-check with the official source
            linked on each page.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "font-semibold text-foreground"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
