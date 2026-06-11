"use client";

import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportEventsPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeading title="Export Event Reports" subtitle="Download all club event reporting data as Excel." />
      <Button asChild className="bg-accent text-accent-foreground">
        <a href={`/api/reporting/export/events?month=${month}&year=${year}`}>
          <Download className="h-4 w-4" />Download Excel
        </a>
      </Button>
    </div>
  );
}
