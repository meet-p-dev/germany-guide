import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ProfileProvider } from "@/lib/profile-store";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FlagStripe } from "@/components/layout/flag-stripe";
import "./globals.css";

// Self-hosted variable font (weights 100–1000) — no build-time network
// dependency. The latin subset includes German umlauts and ß.
const dmSans = localFont({
  src: "../fonts/dm-sans-latin.woff2",
  // Declare the variable axis range — without it the @font-face is pinned to
  // 400 and browsers fake every heavier weight (faux bold).
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});

const cabinetGrotesk = localFont({
  src: [
    { path: "../fonts/cabinet-grotesk-500.woff2", weight: "500" },
    { path: "../fonts/cabinet-grotesk-700.woff2", weight: "700" },
    { path: "../fonts/cabinet-grotesk-800.woff2", weight: "800" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://germanyguide.net"),
  title: {
    default: "Germany Guide — bureaucracy explained for internationals",
    template: "%s · Germany Guide",
  },
  description:
    "From your visa to your Anmeldung — a clear, personalised checklist for moving to Germany that knows how your exact city works.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Germany Guide",
    title: "Germany Guide — arrive in Germany without the chaos",
    description:
      "A clear, personalised checklist for moving to Germany that knows how your exact city works.",
    url: "https://germanyguide.net",
    images: [{ url: "/images/hero-moving-in.jpg", width: 1600, height: 1063 }],
  },
  twitter: {
    card: "summary_large_image",
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
      className={`${dmSans.variable} ${cabinetGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProfileProvider>
            <MotionProvider>
              <FlagStripe />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </MotionProvider>
          </ProfileProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
