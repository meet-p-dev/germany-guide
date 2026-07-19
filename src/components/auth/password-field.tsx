"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "case",
    label: "Upper and lower case letters",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "At least one number",
    test: (value: string) => /\d/.test(value),
  },
] as const;

export function passwordMeetsRules(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  showChecklist = false,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  showChecklist?: boolean;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-2">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={autoComplete === "new-password" ? 8 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            autoComplete === "new-password" ? "Create a password" : "Your password"
          }
          className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-12 text-[15px] outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-muted hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showChecklist && (
        <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(value);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passed ? "font-medium text-success" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    passed
                      ? "border-success bg-success text-white"
                      : "border-border bg-card",
                  )}
                >
                  {passed && <Check className="h-3 w-3" />}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </label>
  );
}
