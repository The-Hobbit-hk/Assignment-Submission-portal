"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiJson } from "@/lib/api-client";
import {
  guessContentType,
  isStorageNotConfiguredError,
  putFileToSignedUrl,
  shouldAvoidMultipartFallback,
  withRetries,
} from "@/lib/direct-storage-upload";
import { uploadEventFile } from "@/hooks/use-events";
import type { SerializedMonthlyReport } from "@/lib/reporting";

interface ReportFilters {
  month: number;
  year: number;
  clubId?: string;
}

export type CreateReportingEventResult = {
  id: string;
  fileWarnings?: string[];
};

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
  field: "resolution" | "districtDues" | "bylaws" | "masterBudget",
  month: number,
  year: number,
  clubId?: string
) {
  const contentType = guessContentType(file.name, file.type);

  try {
    const signed = await withRetries(
      () =>
        apiJson<{
          path: string;
          token: string;
          signedUrl: string;
          publicUrl: string;
        }>("/api/reporting/admin/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType,
            size: file.size,
            field,
            month,
            year,
            clubId: clubId ?? null,
          }),
        }),
      3,
      "Prepare upload"
    );

    await putFileToSignedUrl(file, signed.signedUrl, contentType);

    return withRetries(
      () =>
        apiJson<SerializedMonthlyReport>("/api/reporting/admin/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: signed.path,
            field,
            month,
            year,
            clubId: clubId ?? null,
          }),
        }),
      3,
      "Save upload"
    );
  } catch (err) {
    if (isStorageNotConfiguredError(err) && !shouldAvoidMultipartFallback(file.size)) {
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
    throw err;
  }
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

/**
 * Hardened create path for reporting deadline:
 * 1) Create the event as small JSON (always survives Vercel limits)
 * 2) Attach minutes/image via signed direct-to-storage uploads with retries
 * Never posts multipart create with both files through Vercel.
 */
export function useCreateReportingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData): Promise<CreateReportingEventResult> => {
      const raw = formData.get("data");
      if (typeof raw !== "string") {
        throw new ApiError("Invalid event data.", 400);
      }

      const payload = JSON.parse(raw) as Record<string, unknown>;
      delete payload.minutesPath;
      delete payload.bannerPath;

      const minutes = formData.get("minutes");
      const image = formData.get("image");

      const event = await withRetries(
        () =>
          apiJson<{ id: string }>("/api/reporting/events/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        3,
        "Create event"
      );

      const fileWarnings: string[] = [];

      if (minutes instanceof File && minutes.size > 0) {
        try {
          await uploadEventFile(event.id, "minutes", minutes);
        } catch {
          fileWarnings.push("minutes (PDF)");
        }
      }

      if (image instanceof File && image.size > 0) {
        try {
          await uploadEventFile(event.id, "banner", image);
        } catch {
          fileWarnings.push("image");
        }
      }

      return { id: event.id, fileWarnings: fileWarnings.length ? fileWarnings : undefined };
    },
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
      apiJson<SerializedMonthlyReport>("/api/reporting/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (report) => {
      qc.setQueriesData<EventsPortalData>(
        { queryKey: ["reporting", "events-portal"] },
        (prev) =>
          prev
            ? {
                ...prev,
                report: {
                  status: report.status,
                  submittedAt: report.submittedAt,
                  noEventsDeclared: report.noEventsDeclared,
                },
              }
            : prev
      );
      qc.invalidateQueries({ queryKey: ["reporting", "events"] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}
