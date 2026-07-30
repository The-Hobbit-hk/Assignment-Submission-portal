"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBluebookCycle } from "@/hooks/use-council-assignments";
import { getBluebookCycleWindow } from "@/lib/bluebook-cycle";
import { getReportingPeriodLabel } from "@/lib/reporting";

export function BluebookCycleForm({ month, year }: { month: number; year: number }) {
  const create = useCreateBluebookCycle();
  const [title, setTitle] = useState(`Blue Book — ${getReportingPeriodLabel(month, year)}`);
  const { opensAt, closesAt } = getBluebookCycleWindow(month, year);

  return (
    <div className="depth-card space-y-3 rounded-xl border border-border/50 p-5">
      <h2 className="text-sm font-semibold">Submission cycle</h2>
      <p className="text-xs text-muted-foreground">
        Blue Book submissions open on the 1st and close on the last day of the month. No
        submissions are accepted after the deadline.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Cycle title</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Closes at (end of month)</span>
          <Input
            type="datetime-local"
            defaultValue={closesAt.toISOString().slice(0, 16)}
            id="cycle-closes"
            disabled
            className="bg-zinc-50"
          />
        </label>
      </div>
      <Button
        size="sm"
        className="bg-accent text-accent-foreground"
        disabled={create.isPending}
        onClick={() => {
          create.mutate({
            title,
            month,
            year,
            opensAt: opensAt.toISOString(),
            closesAt: closesAt.toISOString(),
          });
        }}
      >
        {create.isPending ? "Saving…" : "Save submission cycle"}
      </Button>
    </div>
  );
}
