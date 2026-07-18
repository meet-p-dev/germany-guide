import type { Metadata } from "next";
import { getCities, getPhasesWithSteps } from "@/lib/content";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Your personal command center for the move to Germany — deadlines, costs, documents, and the reference numbers you must never lose.",
};

export const revalidate = 3600;

export default async function AccountPage() {
  const [phases, cities] = await Promise.all([
    getPhasesWithSteps(),
    getCities(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <AccountDashboard phases={phases} cities={cities} />
    </div>
  );
}
