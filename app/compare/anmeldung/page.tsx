import Link from "next/link";
import type { Metadata } from "next";
import { Check, Minus, X } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { getVariantsForTask } from "@/lib/queries/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Anmeldung by City: Appointment vs Walk-in Compared (2026)",
  description:
    "Honest city-by-city comparison of German address registration (Anmeldung): which cities allow walk-ins, which need an appointment, and where online registration exists — with the eAT caveat for non-EU internationals.",
  alternates: { canonical: "/compare/anmeldung" },
};

function Cell({ value }: { value: boolean | null }) {
  if (value === true)
    return (
      <span className="inline-flex items-center gap-1 text-gg-progress-text">
        <Check className="h-4 w-4" aria-hidden="true" /> Yes
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <X className="h-4 w-4" aria-hidden="true" /> No
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="h-4 w-4" aria-hidden="true" /> Not verified
    </span>
  );
}

export default async function CompareAnmeldungPage() {
  const rows = await getVariantsForTask("anmeldung");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / Compare
        </p>
        <h1 className="text-3xl font-bold">
          Anmeldung by city: appointment, walk-in or online?
        </h1>
      </div>

      <Disclaimer />

      <section className="space-y-3 text-sm">
        <p>
          <strong>Anmeldung</strong> (registering your address) is one of the
          few German tasks that genuinely differs by city — some Bürgerämter
          take walk-ins, most need a booked appointment, and a growing number
          offer online registration. This table compares what we&apos;ve been
          able to verify per city. Where a value is{" "}
          <em>&quot;Not verified&quot;</em> we leave it blank rather than guess —
          always confirm on the city&apos;s own portal.
        </p>
        <p className="rounded-md border bg-muted/40 p-3">
          <strong>Important for non-EU internationals:</strong> an{" "}
          <em>&quot;Online&quot;</em> yes below means the city offers electronic
          registration (eWA) — but it works only with a German ID card or an
          EU/EEA eID card (online-ID function + PIN). An{" "}
          <strong>eAT residence-permit card is not accepted</strong>, so most
          newcomers arriving from abroad still register in person.
        </p>
      </section>

      <section className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold">City</th>
              <th className="py-2 pr-4 font-semibold">Appointment required</th>
              <th className="py-2 pr-4 font-semibold">Walk-in possible</th>
              <th className="py-2 pr-4 font-semibold">Online (eWA)</th>
              <th className="py-2 pr-4 font-semibold">Typical wait</th>
              <th className="py-2 font-semibold">Guide</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.city.slug} className="border-b align-top">
                <td className="py-2 pr-4 font-medium">{r.city.name_en}</td>
                <td className="py-2 pr-4">
                  <Cell value={r.appointment_required} />
                </td>
                <td className="py-2 pr-4">
                  <Cell value={r.walk_in_possible} />
                </td>
                <td className="py-2 pr-4">
                  <Cell value={r.online_possible} />
                </td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {r.typical_wait_time ?? "—"}
                </td>
                <td className="py-2">
                  <Link
                    href={`/germany/${r.city.slug}/anmeldung`}
                    className="underline"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p>
          Want the full step-by-step, including documents and city-specific
          office details?{" "}
          <Link href="/tasks/anmeldung" className="font-medium underline">
            Read the complete Anmeldung guide →
          </Link>
        </p>
      </section>
    </div>
  );
}
