import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { DISCLAIMER_TEXT } from "@/components/Disclaimer";
import { AuthButton } from "@/components/AuthButton";
import { LogoLockup } from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Germany Guide — bureaucracy explained for internationals",
    template: "%s | Germany Guide",
  },
  description:
    "City-by-city guides to German bureaucracy for internationals: Anmeldung, residence permits, health insurance, tax ID and more — with checklists and official links.",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const NAV = [
  { href: "/germany", label: "Cities" },
  { href: "/problems", label: "Problems & solutions" },
  { href: "/letters", label: "Letter helper" },
  { href: "/glossary", label: "Glossary" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" aria-label="Germany Guide home">
              <LogoLockup />
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto">
              <AuthButton />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t">
          <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs text-muted-foreground">
            <p>{DISCLAIMER_TEXT}</p>
            <p>
              Made for internationals in Germany. Content is community-reviewed;
              always double-check with the official source linked on each page.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
