import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to sync your Germany journey across devices. No password needed — we email you a magic link.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
