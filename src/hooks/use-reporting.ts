"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiJson } from "@/lib/api-client";
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
  field: "resolution" | "districtDues" | "bylaws" | "masterBudget",
  month: number,
  year: number,
  clubId?: string
) {
  // Prefer signed direct-to-Supabase upload so ~5 MB files bypass Vercel's ~4.5 MB body limit.
  try {
    const signed = await apiJson<{
      path: string;
      token: string;
      signedUrl: string;
      publicUrl: string;
    }>("/api/reporting/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        field,
        month,
        year,
        clubId: clubId ?? null,
      }),
    });

    const put = await fetch(signed.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
    });

    if (!put.ok) {
      const detail = await put.text().catch(() => "");
      throw new ApiError(
        detail.trim() || "Could not upload file to storage. Please try again.",
        put.status || 500
      );
    }

    return apiJson<SerializedMonthlyReport>("/api/reporting/admin/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: signed.path,
        field,
        month,
        year,
        clubId: clubId ?? null,
      }),
    });
  } catch (err) {
    // Local/dev without Supabase: fall back to multipart for smaller files.
    if (err instanceof ApiError && err.status === 500 && file.size <= 4 * 1024 * 1024) {
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

export function useCreateReportingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const raw = formData.get("data");
      if (typeof raw !== "string") {
        throw new ApiError("Invalid event data.", 400);
      }

      const payload = JSON.parse(raw) as Record<string, unknown>;
      const minutes = formData.get("minutes");
      const image = formData.get("image");

      async function uploadDirect(file: File, kind: "minutes" | "image") {
        const signed = await apiJson<{
          path: string;
          signedUrl: string;
        }>("/api/reporting/events/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            kind,
            clubId: typeof payload.clubId === "string" ? payload.clubId : null,
          }),
        });

        const put = await fetch(signed.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "x-upsert": "false",
          },
          body: file,
        });

        if (!put.ok) {
          const detail = await put.text().catch(() => "");
          throw new ApiError(
            detail.trim() || "Could not upload file to storage. Please try again.",
            put.status || 500
          );
        }

        return signed.path;
      }

      // Prefer signed direct-to-Supabase uploads so minutes + image never hit
      // Vercel's ~4.5 MB request body limit (common cause of "Failed to fetch").
      try {
        if (minutes instanceof File && minutes.size > 0) {
          payload.minutesPath = await uploadDirect(minutes, "minutes");
        }
        if (image instanceof File && image.size > 0) {
          payload.bannerPath = await uploadDirect(image, "image");
        }

        return apiJson("/api/reporting/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // Local/dev without Supabase: fall back to multipart for smaller payloads.
        const combined =
          (minutes instanceof File ? minutes.size : 0) +
          (image instanceof File ? image.size : 0);
        if (err instanceof ApiError && err.status === 500 && combined <= 4 * 1024 * 1024) {
          return apiJson("/api/reporting/events/create", {
            method: "POST",
            body: formData,
          });
        }
        throw err;
      }
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
