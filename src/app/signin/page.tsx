import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in or create account",
  description:
    "Sign in to Germany Guide or create a free account (with email and password, or Google) to sync your journey, deadlines and records across devices.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
