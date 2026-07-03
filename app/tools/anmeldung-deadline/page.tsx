import Link from "next/link";
import type { Metadata } from "next";
import { AnmeldungDeadline } from "@/components/AnmeldungDeadline";

export const metadata: Metadata = {
  title: "Anmeldung Deadline Calculator — when must you register in Germany?",
  description:
    "Free calculator: enter your move-in date and see the exact date by which you must register your address (Anmeldung) in Germany — the 14-day rule.",
  alternates: { canonical: "/tools/anmeldung-deadline" },
};

export default function AnmeldungDeadlinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / Tools
        </p>
        <h1 className="text-3xl font-bold">Anmeldung deadline calculator</h1>
        <p className="text-muted-foreground">
          In Germany you must register your address (<strong>Anmeldung</strong>)
          within <strong>14 days</strong> of moving in. Enter your move-in date
          to see your exact deadline.
        </p>
      </div>

      <AnmeldungDeadline />

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p>
          Missed it or can&apos;t get an appointment in time?{" "}
          <Link href="/tasks/anmeldung" className="font-medium underline">
            Read the full Anmeldung guide →
          </Link>{" "}
          — including what to do when no slots are available.
        </p>
      </div>
    </div>
  );
}
