"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch(`/api/reporting/admin?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export type EventsPortalData = {
  report: { status: string; submittedAt?: string | null } | null;
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
    queryFn: async () => {
      const res = await fetch(`/api/reporting/events-portal?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load event reporting");
      return res.json() as Promise<EventsPortalData>;
    },
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
    queryFn: async () => {
      const res = await fetch(`/api/reporting/events?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
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

  const res = await fetch("/api/reporting/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Upload failed");
  }
  return res.json();
}

export function useSaveAdminReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/reporting/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "admin"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}

export function useCreateReportingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/reporting/events/create", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create event");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSaveEventsReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/reporting/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reporting", "events"] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}
