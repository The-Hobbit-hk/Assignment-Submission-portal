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

export type DistrictDuesPaidMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  riId: string | null;
  role: string;
  status: string;
};

export type DistrictDuesPaidClubGroup = {
  club: { id: string; name: string; zone: string | null; charterNumber: string | null };
  paidCount: number;
  rosterCount: number;
  members: DistrictDuesPaidMember[];
};

export type DistrictDuesPaidMembersResponse = {
  summary: {
    clubsWithPaidMembers: number;
    totalPaidMembers: number;
    totalRosterMembers: number;
  };
  clubs: DistrictDuesPaidClubGroup[];
};

export function useDistrictDuesPaidMembers() {
  return useQuery({
    queryKey: ["reporting", "district-dues", "members"],
    queryFn: () =>
      apiJson<DistrictDuesPaidMembersResponse>(
        "/api/reporting/district-dues/members"
      ),
  });
}

export type AdminSubmissionRow = {
  club: { id: string; name: string; zone: string | null };
  status: "SUBMITTED" | "DRAFT" | "NOT SUBMITTED";
  submittedAt: string | null;
  newMembers: number | null;
  resolutionPassed: string | null;
  resolutionFileUrl: string | null;
  resolutionPassDate: string | null;
  districtDuesPaid: string | null;
  districtDuesFileUrl: string | null;
  districtDuesMembersCount: number | null;
  districtDuesAmount: number | null;
  bylawsPassed: string | null;
  bylawsFileUrl: string | null;
  bylawsPassDate: string | null;
  masterBudgetPassed: string | null;
  masterBudgetFileUrl: string | null;
  masterBudgetPassDate: string | null;
  hostClub: string | null;
  districtEventAttendance: string | null;
};

export type AdminSubmissionsResponse = {
  month: number;
  year: number;
  zoneFilter: string | null;
  summary: {
    totalClubs: number;
    submitted: number;
    draft: number;
    notSubmitted: number;
    resolutionYes: number;
    duesYes: number;
    bylawsYes: number;
    budgetYes: number;
  };
  clubs: AdminSubmissionRow[];
};

export function useAdminSubmissions(month: number, year: number, zone?: string) {
  return useQuery({
    queryKey: ["reporting", "admin-submissions", month, year, zone ?? "all"],
    queryFn: () => {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (zone) params.set("zone", zone);
      return apiJson<AdminSubmissionsResponse>(`/api/reporting/admin-submissions?${params}`);
    },
  });
}
