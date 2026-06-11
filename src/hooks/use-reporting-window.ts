"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClubReportingRow, ClubReportingSummary } from "@/lib/reporting-club-status";

export function useReportingWindow(month: number, year: number) {
  return useQuery({
    queryKey: ["reporting", "window", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/reporting/window?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{
        open: boolean;
        message: string | null;
        opensAt: string | null;
        closesAt: string | null;
      }>;
    },
  });
}

export type ClubReportsResponse = {
  month: number;
  year: number;
  scope: "district" | "zone";
  zones: string[] | null;
  zoneFilter: string | null;
  summary: ClubReportingSummary;
  clubs: ClubReportingRow[];
};

export function useClubReports(month: number, year: number, zone?: string) {
  return useQuery({
    queryKey: ["reporting", "club-reports", month, year, zone ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (zone) params.set("zone", zone);

      const res = await fetch(`/api/reporting/club-reports?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<ClubReportsResponse>;
    },
  });
}
