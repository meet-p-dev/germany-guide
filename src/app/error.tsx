"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <TriangleAlert className="h-7 w-7" />
      </span>
      <h1 className="font-display mt-6 text-4xl font-bold">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted">
        Not your fault — the page hit an error. Try again; if it keeps
        happening, the start page always works.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Back to the start
        </ButtonLink>
      </div>
    </div>
  );
}
