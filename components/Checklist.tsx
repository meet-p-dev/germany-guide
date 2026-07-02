"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/Markdown";
import type { MergedStep } from "@/lib/queries/guide";

/**
 * Interactive checklist. Progress always lives in localStorage under
 * `progress:{city}:{task}`. When the visitor is signed in AND the checklist
 * belongs to a concrete city/task, progress is additionally synced to
 * user_task_progress — merged on load as the union of local and remote keys,
 * then upserted (debounced) on every change.
 */
export function Checklist({
  steps,
  storageKey,
  cityId,
  taskId,
}: {
  steps: MergedStep[];
  storageKey: string;
  cityId?: string;
  taskId?: string;
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let local = new Set<string>();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) local = new Set(JSON.parse(raw) as string[]);
    } catch {
      // corrupted storage — start fresh
    }
    setDone(local);
    setLoaded(true);

    if (!cityId || !taskId) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      userIdRef.current = user.id;
      const { data: row } = await supabase
        .from("user_task_progress")
        .select("completed_step_ids, completed_override_ids")
        .eq("user_id", user.id)
        .eq("city_id", cityId)
        .eq("task_id", taskId)
        .maybeSingle();

      const remote = new Set([
        ...(row?.completed_step_ids ?? []),
        ...(row?.completed_override_ids ?? []),
      ]);
      const union = new Set([...local, ...remote]);
      setDone(union);
      localStorage.setItem(storageKey, JSON.stringify([...union]));
      setSynced(true);
      // Push the union back if local had keys the server didn't know about.
      if ([...local].some((k) => !remote.has(k))) {
        void persist(union, user.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, cityId, taskId]);

  async function persist(keys: Set<string>, userId: string) {
    if (!cityId || !taskId) return;
    const supabase = createClient();
    const stepKeys = steps
      .filter((s) => s.keyKind === "step" && keys.has(s.key))
      .map((s) => s.key);
    const overrideKeys = steps
      .filter((s) => s.keyKind === "override" && keys.has(s.key))
      .map((s) => s.key);
    await supabase.from("user_task_progress").upsert(
      {
        user_id: userId,
        city_id: cityId,
        task_id: taskId,
        completed_step_ids: stepKeys,
        completed_override_ids: overrideKeys,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,city_id,task_id" }
    );
  }

  function toggle(key: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      if (userIdRef.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(
          () => persist(next, userIdRef.current!),
          600
        );
      }
      return next;
    });
  }

  const completed = steps.filter((s) => done.has(s.key)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Step-by-step checklist</h2>
        <span className="text-sm text-muted-foreground">
          {loaded && `${completed}/${steps.length} done`}
          {synced && " · synced"}
        </span>
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className="flex gap-3 rounded-lg border bg-card p-4"
          >
            <Checkbox
              id={`step-${step.key}`}
              checked={done.has(step.key)}
              onCheckedChange={() => toggle(step.key)}
              className="mt-1"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <label
                htmlFor={`step-${step.key}`}
                className={`block cursor-pointer font-medium ${
                  done.has(step.key) ? "text-muted-foreground line-through" : ""
                }`}
              >
                {i + 1}. {step.title}
              </label>
              <div className="flex flex-wrap gap-1">
                {step.isCitySpecific && (
                  <Badge variant="secondary">city-specific</Badge>
                )}
                {step.isOptional && <Badge variant="outline">optional</Badge>}
                {step.docNames.map((doc) => (
                  <Badge key={doc} variant="outline">
                    {doc}
                  </Badge>
                ))}
              </div>
              {step.body && (
                <div className="text-sm text-muted-foreground">
                  <Markdown>{step.body}</Markdown>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
