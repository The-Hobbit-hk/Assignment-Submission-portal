"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const REPORTS = [
  { type: "members", title: "Member Reports", description: "Full member roster with club, role, and points." },
  { type: "clubs", title: "Club Reports", description: "Club directory with member and event counts." },
  { type: "events", title: "Event Reports", description: "All events with attendance and registration data." },
  { type: "bluebook", title: "Bluebook Reports", description: "Task submissions and allocated scores." },
  { type: "performance", title: "Performance Reports", description: "Council scores, ranks, and trends." },
];

const FORMATS = [
  { format: "csv", label: "CSV", icon: FileText },
  { format: "excel", label: "Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF", icon: Download },
] as const;

export function ReportsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold uppercase tracking-wide">Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate and download district reports in multiple formats.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {FORMATS.map(({ format, label, icon: Icon }) => (
                <Button key={format} variant="outline" size="sm" asChild>
                  <a href={`/api/reports/${report.type}?format=${format}`} download>
                    <Icon className="h-4 w-4" />{label}
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
