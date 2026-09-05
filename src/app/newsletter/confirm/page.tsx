import type { Metadata } from "next";
import { Kicker } from "@/components/ui/kicker";
import { TokenActionPanel } from "@/components/newsletter/token-action-panel";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Kicker>Updates</Kicker>
      <div className="mt-3">
        <TokenActionPanel mode="confirm" token={token ?? ""} />
      </div>
    </div>
  );
}
