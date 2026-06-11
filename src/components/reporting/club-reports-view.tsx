"use client";

import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubReports } from "@/hooks/use-reporting-window";
import { Download } from "lucide-react";

export function ClubReportsView() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { data, isLoading } = useClubReports(month, year);

  if (isLoading) return <Skeleton className="h-64" />;

  const clubs = (data as { clubs: {
    club: { id: string; name: string };
    admin: { status: string; newMembers: number | null } | null;
    events: { status: string } | null;
  }[] } | undefined)?.clubs ?? [];

  return (
    <div className="space-y-4">
      <PageHeading
        title="Club Reporting Overview"
        subtitle="View admin and event reports submitted by all clubs."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/reporting/export/admin?month=${month}&year=${year}`}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Excel</span>
                <span className="sm:hidden">Admin</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/reporting/export/events?month=${month}&year=${year}`}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Events Excel</span>
                <span className="sm:hidden">Events</span>
              </a>
            </Button>
          </div>
        }
      />

      <div className="table-scroll rounded-lg border border-border/40">
        <Table className="ref-table min-w-[480px]">
          <TableHeader>
            <TableRow>
              <TableHead>Club</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead className="hidden sm:table-cell">New Members</TableHead>
              <TableHead>Events Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((row) => (
              <TableRow key={row.club.id}>
                <TableCell className="font-medium">{row.club.name}</TableCell>
                <TableCell>{row.admin?.status ?? "NOT SUBMITTED"}</TableCell>
                <TableCell className="hidden sm:table-cell">{row.admin?.newMembers ?? "—"}</TableCell>
                <TableCell>{row.events?.status ?? "NOT SUBMITTED"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
