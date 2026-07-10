import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { MobileNav } from "@/components/MobileNav";
import { AuthButton } from "@/components/AuthButton";
import { LogoLockup } from "@/components/Logo";
import { NAV } from "@/lib/nav";

// Primary funnel entry — the situation+city wizard.
const BUILD_PLAN_HREF = "/explore";

/**
 * Ankommen-style global header: frosted glass, black/red/gold flag stripe,
 * pill nav, dark-mode toggle, and a primary "Build my plan" CTA. Keeps the
 * Germany Guide brand + signpost mark.
 */
export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border/60">
      <div className="flag-stripe" aria-hidden="true">
        <span className="bg-foreground" />
        <span className="bg-primary" />
        <span className="bg-accent" />
      </div>
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <Link href="/" aria-label="Germany Guide home" className="shrink-0">
          <LogoLockup />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              asChild
              variant="ghost"
              className="gap-2 rounded-full font-semibold"
            >
              <Link href={href}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <ModeToggle />
          <div className="hidden items-center gap-2 md:flex">
            <AuthButton />
            <Button asChild className="rounded-full font-semibold">
              <Link href={BUILD_PLAN_HREF}>Build my plan</Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
