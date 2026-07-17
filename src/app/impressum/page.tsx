import type { Metadata } from "next";
import { Kicker } from "@/components/ui/kicker";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

// TODO(meet): German law (§5 TMG/DDG) requires the site operator's real name,
// address and contact here before public launch. Replace the placeholders.
export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Kicker>Legal</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold">Impressum</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-bold">
            Angaben gemäß § 5 DDG
          </h2>
          <p className="mt-2 text-muted">
            [Vollständiger Name]
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ und Ort]
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Kontakt</h2>
          <p className="mt-2 text-muted">E-Mail: [kontakt@germanyguide.net]</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">
            Haftung für Inhalte
          </h2>
          <p className="mt-2 text-muted">
            Die Inhalte dieser Website dienen der allgemeinen Information und
            stellen keine Rechtsberatung dar. Trotz sorgfältiger Prüfung
            übernehmen wir keine Gewähr für die Richtigkeit, Vollständigkeit
            und Aktualität der Inhalte. Maßgeblich sind stets die Angaben der
            zuständigen Behörden.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Haftung für Links</h2>
          <p className="mt-2 text-muted">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter verantwortlich.
          </p>
        </section>
      </div>
    </div>
  );
}
