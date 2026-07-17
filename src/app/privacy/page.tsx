import type { Metadata } from "next";
import { Kicker } from "@/components/ui/kicker";

export const metadata: Metadata = {
  title: "Privacy policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Kicker>Legal</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold">Privacy policy</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-foreground/85">
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">
            The short version
          </h2>
          <p className="mt-2">
            You can use everything on Germany Guide without an account. Your
            journey settings (your situation, city and ticked steps) are stored
            in your own browser. If you choose to sign in, that same data is
            additionally stored in our database so it can sync across your
            devices — nothing else is collected.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">
            What we store, where
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Without an account:</strong> your settings and progress
              live only in your browser&apos;s local storage. They never leave
              your device and we cannot see them.
            </li>
            <li>
              <strong>With an account:</strong> your email address, your
              journey settings and your ticked steps are stored with our
              database provider Supabase (hosted in the EU, Frankfurt region).
              Sign-in works via emailed links; we never see or store a
              password.
            </li>
            <li>
              <strong>Hosting:</strong> the website is served by Vercel, which
              processes technical request data (such as IP addresses) to
              deliver the site.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">
            What we don&apos;t do
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>No advertising, no selling of data, no data brokers.</li>
            <li>No third-party tracking cookies.</li>
            <li>
              No profiling — your answers exist to render your checklist, not
              to analyse you.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">
            Your rights
          </h2>
          <p className="mt-2">
            Under the GDPR you can request access to, correction of, or
            deletion of your data at any time. Deleting your account removes
            your profile and progress from our database. Without an account,
            simply clearing your browser storage removes everything. Contact:
            [kontakt@germanyguide.net].
          </p>
        </section>
      </div>
    </div>
  );
}
