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
            devices. Nothing else is collected.
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
              <strong>With an account:</strong> your name, email address, your
              journey settings and your ticked steps are stored with our
              database provider Supabase (hosted in the EU, Frankfurt region).
              You can sign in with an email and password or with Google; if you
              set a password we only ever store it in securely hashed form,
              never in plain text.
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
            The update email
          </h2>
          <p className="mt-2">
            The update email is entirely optional and separate from your
            account. Nothing is sent until you click the confirmation link we
            email you (double opt-in), and the date you confirmed is kept as the
            record of that consent (Art. 6(1)(a) GDPR).
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>What we store:</strong> your email address, when you
              subscribed and confirmed, and when we last wrote to you. If you
              subscribed while signed in, the address is linked to your account
              so the toggle on your account page reflects reality.
            </li>
            <li>
              <strong>Who sends it:</strong> Resend, our email provider, which
              processes your address in order to deliver the message.
            </li>
            <li>
              <strong>Leaving:</strong> every email carries a one-click
              unsubscribe link, and you can switch it off from your account page
              at any time. We keep the record that the address unsubscribed, which is
              how we make sure it is not written to again, and you can ask us to
              erase it completely.
            </li>
            <li>
              <strong>No tracking:</strong> we do not use open-tracking pixels
              or rewritten click-tracking links, so we do not know whether you
              opened it.
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
              No profiling. Your answers exist to render your checklist, not
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
            simply clearing your browser storage removes everything. Contact:{" "}
            <a
              href="mailto:kontakt@germanyguide.net"
              className="font-medium text-primary hover:underline"
            >
              kontakt@germanyguide.net
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
