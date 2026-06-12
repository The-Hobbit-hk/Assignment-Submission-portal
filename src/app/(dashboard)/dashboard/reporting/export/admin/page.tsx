"use client";

import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import { Download } from "lucide-react";

export default function ExportAdminPage() {
  const { month, year } = getActiveReportPeriod();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeading
        title="Export Admin Reports"
        subtitle={`Download all club admin reporting data for ${getReportingPeriodLabel(month, year)}.`}
      />
      <Button asChild className="bg-accent text-accent-foreground">
        <a href={`/api/reporting/export/admin?month=${month}&year=${year}`} download>
          <Download className="h-4 w-4" />Download Excel
        </a>
      </Button>
    </div>
  );
}
