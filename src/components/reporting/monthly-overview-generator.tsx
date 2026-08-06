"use client";

import { useState } from "react";
import { Download, Presentation } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";

export function MonthlyOverviewGenerator() {
  const active = getActiveReportPeriod();
  const optionOpts = { long: true, withYear: true } as const;
  const monthOptions = withMonthOption(
    rotaryMonthOptions(getCurrentRotaryYear().startYear, optionOpts),
    active.month,
    active.year,
    optionOpts
  );
  const [period, setPeriod] = useState(() => `${active.month}-${active.year}`);
  const [month, year] = period.split("-").map(Number);
  const periodLabel = getReportingPeriodLabel(month, year);
  const exportParams = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading
        title="Monthly Reporting Deck"
        subtitle="Generate the district PowerPoint overview used after each reporting window closes. Admin only."
      />

      <div className="depth-card space-y-5 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Presentation className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">What this includes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Cover + district completion stats</li>
              <li>Zone-wise reporting bar chart and table</li>
              <li>Avenue-wise event breakdown</li>
              <li>New members and district dues by zone</li>
              <li>Per-zone list of clubs that completed reporting</li>
              <li>Appreciation board for 100% zones</li>
            </ul>
          </div>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Report period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="depth-card block w-full max-w-xs rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" className="bg-accent text-accent-foreground" asChild>
            <a href={`/api/reporting/export/monthly-overview?${exportParams}`} download>
              <Download className="h-4 w-4" />
              Download PowerPoint
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Generating for <span className="font-medium text-foreground">{periodLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
