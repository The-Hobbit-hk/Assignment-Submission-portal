"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { SerializedMonthlyReport } from "@/lib/reporting";

interface ReportFilters {
  month: number;
  year: number;
  clubId?: string;
}

export function useAdminReport(filters: ReportFilters) {
  const p = new URLSearchParams({
    month: String(filters.month),
    year: String(filters.year),
  });
  if (filters.clubId) p.set("clubId", filters.clubId);

  return useQuery({
    queryKey: ["reporting", "admin", filters],
    queryFn: () => apiJson<SerializedMonthlyReport | null>(`/api/reporting/admin?${p}`),
  });
}

export type EventsPortalData = {
  report: {
    status: string;
    submittedAt?: string | null;
    noEventsDeclared?: boolean;
  } | null;
  clubEvents: {
    id: string;
    title: string;
    startDate: string;
    location: string | null;
    type: string;
    status: string;
  }[];
  districtEvents: {
    id: string;
    title: string;
    startDate: string;
    location: string | null;
    type: string;
    status: string;
  }[];
  clubId: string | null;
  clubName: string | null;
};

export function useEventsReportingPortal(month: number, year: number) {
  return useQuery({
    queryKey: ["reporting", "events-portal", month, year],
    queryFn: () =>
      apiJson<EventsPortalData>(`/api/reporting/events-portal?month=${month}&year=${year}`),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useEventsReport(filters: ReportFilters) {
  const p = new URLSearchParams({
    month: String(filters.month),
    year: String(filters.year),
  });
  if (filters.clubId) p.set("clubId", filters.clubId);

  return useQuery({
    queryKey: ["reporting", "events", filters],
    queryFn: () => apiJson(`/api/reporting/events?${p}`),
  });
}

export async function uploadAdminReportFile(
  file: File,
  field: "resolution" | "districtDues" | "bylaws",
  month: number,
  year: number,
  clubId?: string
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("field", field);
  fd.append("month", String(month));
  fd.append("year", String(year));
  if (clubId) fd.append("clubId", clubId);

  return apiJson<SerializedMonthlyReport>("/api/reporting/admin/upload", {
    method: "POST",
    body: fd,
  });
}

export function useSaveAdminReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson<SerializedMonthlyReport>("/api/reporting/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "admin"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}

export function useCreateReportingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiJson("/api/reporting/events/create", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSaveEventsReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson("/api/reporting/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "events"] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}
