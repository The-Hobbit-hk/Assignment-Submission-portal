"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { ClubReportingRow, ClubReportingSummary } from "@/lib/reporting-club-status";

export type ReportingWindowState = {
  open: boolean;
  message: string | null;
  reportMonth: number;
  reportYear: number;
  reportLabel: string;
  opensAt: string | null;
  closesAt: string | null;
};

export function useReportingWindow(month: number, year: number) {
  return useQuery({
    queryKey: ["reporting", "window", month, year],
    queryFn: () =>
      apiJson<ReportingWindowState>(`/api/reporting/window?month=${month}&year=${year}`),
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
    queryFn: () => {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (zone) params.set("zone", zone);

      return apiJson<ClubReportsResponse>(`/api/reporting/club-reports?${params}`);
    },
  });
}

export type DistrictDuesRow = {
  club: { id: string; name: string; zone: string | null };
  districtDuesPaid: string | null;
  membersCount: number | null;
  amount: number | null;
  fileUrl: string | null;
  status: string;
  submittedAt: string | null;
};

export type DistrictDuesResponse = {
  month: number;
  year: number;
  summary: {
    totalClubs: number;
    clubsPaid: number;
    clubsUnpaid: number;
    clubsPending: number;
    totalMembers: number;
    totalAmount: number;
  };
  clubs: DistrictDuesRow[];
};

export function useDistrictDues(month: number, year: number) {
  return useQuery({
    queryKey: ["reporting", "district-dues", month, year],
    queryFn: () =>
      apiJson<DistrictDuesResponse>(
        `/api/reporting/district-dues?month=${month}&year=${year}`
      ),
  });
}
