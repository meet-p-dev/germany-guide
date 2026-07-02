"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return <span className="w-14" />;

  return email ? (
    <Link href="/account" className="text-sm hover:underline">
      Account
    </Link>
  ) : (
    <Link
      href="/auth/login"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Sign in
    </Link>
  );
}
