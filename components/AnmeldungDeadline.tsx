"use client";

import { useState } from "react";
import { CalendarClock, TriangleAlert } from "lucide-react";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AnmeldungDeadline() {
  const [moveIn, setMoveIn] = useState("");

  let deadline: Date | null = null;
  let daysLeft: number | null = null;
  if (moveIn) {
    const d = new Date(moveIn + "T00:00:00");
    if (!isNaN(d.getTime())) {
      deadline = new Date(d);
      deadline.setDate(deadline.getDate() + 14);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      daysLeft = Math.round(
        (deadline.getTime() - today.getTime()) / 86400000
      );
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-5">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          When did you move into your German home?
        </span>
        <input
          type="date"
          value={moveIn}
          onChange={(e) => setMoveIn(e.target.value)}
          className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      {deadline && (
        <div className="space-y-2 rounded-md bg-muted/50 p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Register (Anmeldung) by:
          </p>
          <p className="text-lg font-semibold">{fmt(deadline)}</p>
          {daysLeft !== null && (
            <p
              className={
                daysLeft < 0
                  ? "flex items-center gap-1.5 text-sm font-medium text-red-600"
                  : daysLeft <= 3
                    ? "flex items-center gap-1.5 text-sm font-medium text-amber-600"
                    : "text-sm text-muted-foreground"
              }
            >
              {daysLeft < 0 ? (
                <>
                  <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  {`Your 14-day window passed ${Math.abs(daysLeft)} day${
                    Math.abs(daysLeft) === 1 ? "" : "s"
                  } ago — book the earliest appointment you can and go anyway; the confirmation of a timely booking usually protects you.`}
                </>
              ) : daysLeft === 0 ? (
                "That's today — go or book now."
              ) : (
                `${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`
              )}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        The law (§17 Bundesmeldegesetz) gives you 14 days from moving in. This is
        general guidance, not legal advice — always check your city&apos;s rules.
      </p>
    </div>
  );
}
