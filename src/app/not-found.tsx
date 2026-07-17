import Link from "next/link";
import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="font-display mt-6 text-4xl font-bold">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted">
        Wrong turn — it happens in a new country. The journey overview has
        everything, or jump straight back to your plan.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/process">Browse the process</ButtonLink>
        <ButtonLink href="/journey" variant="secondary">
          My journey
        </ButtonLink>
      </div>
      <Link href="/" className="mt-6 text-sm font-medium text-primary hover:underline">
        Back to the start
      </Link>
    </div>
  );
}
