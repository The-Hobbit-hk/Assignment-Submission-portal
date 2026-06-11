"use client";

import { useQuery } from "@tanstack/react-query";

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

export function useClubReports(month: number, year: number) {
  return useQuery({
    queryKey: ["reporting", "club-reports", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/reporting/club-reports?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
