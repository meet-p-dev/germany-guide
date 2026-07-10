import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Ankommen body face. Cabinet Grotesk (display) loads via Fontshare @import in
// globals.css — it isn't on Google Fonts so it can't go through next/font.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
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
  // Google Search Console ownership verification (search.google.com/search-console).
  // One token per property: the first verifies the old vercel.app property, the
  // second verifies the germanyguide.net property. Both render as meta tags.
  verification: {
    google: [
      "qvxYXosopUWV3M41ODV1n5sI01fKjzq1JG6hg5ld1LY",
      "Myho0KxbQnqqsAdexq_lAO0WsQTdyTyomBxIg5e5Lr4",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <div className="grain" aria-hidden="true" />
          <SiteHeader />
          <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
