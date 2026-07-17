"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // true after hydration, false during SSR — without a setState-in-effect.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Render a stable placeholder until mounted to avoid hydration mismatch.
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
