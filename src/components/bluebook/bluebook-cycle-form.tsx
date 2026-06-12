"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBluebookCycle } from "@/hooks/use-council-assignments";
import { getReportingPeriodLabel } from "@/lib/reporting";

export function BluebookCycleForm({ month, year }: { month: number; year: number }) {
  const create = useCreateBluebookCycle();
  const [title, setTitle] = useState(`Blue Book — ${getReportingPeriodLabel(month, year)}`);
  const opensAt = new Date(year, month - 1, 1, 0, 0, 0);
  const closesAt = new Date(year, month - 1, 10, 23, 59, 59);

  return (
    <div className="depth-card space-y-3 rounded-xl border border-border/50 p-5">
      <h2 className="text-sm font-semibold">Submission cycle</h2>
      <p className="text-xs text-muted-foreground">
        Set the Blue Book submission window for council members. Tasks use the same month/year.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Cycle title</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Closes at</span>
          <Input
            type="datetime-local"
            defaultValue={closesAt.toISOString().slice(0, 16)}
            id="cycle-closes"
          />
        </label>
      </div>
      <Button
        size="sm"
        className="bg-accent text-accent-foreground"
        disabled={create.isPending}
        onClick={() => {
          const closesInput = document.getElementById("cycle-closes") as HTMLInputElement | null;
          const closes = closesInput?.value
            ? new Date(closesInput.value).toISOString()
            : closesAt.toISOString();
          create.mutate({
            title,
            month,
            year,
            opensAt: opensAt.toISOString(),
            closesAt: closes,
          });
        }}
      >
        {create.isPending ? "Saving…" : "Save submission cycle"}
      </Button>
    </div>
  );
}
