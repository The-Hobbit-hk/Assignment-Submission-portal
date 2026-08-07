"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApiError, apiJson } from "@/lib/api-client";
import type {
  CitationStandingEntry,
  SerializedCitationAssignment,
  SerializedCitationDefinition,
} from "@/lib/citations-shared";
import type { CitationCadence } from "@/generated/prisma/client";

export type CitationStandingsPeriodHint = {
  cadence: CitationCadence;
  periodKey: string;
  periodLabel: string;
  year: number;
  month: number | null;
  quarter: number | null;
  rotaryYearLabel: string | null;
  totalPoints: number;
  approvedCount: number;
};

export type CitationStandingsData = {
  cadence: CitationCadence;
  periodKey: string;
  periodLabel: string;
  standings: CitationStandingEntry[];
  approvedPeriods: CitationStandingsPeriodHint[];
};

export function useCitationDefinitions() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["citations", "definitions"],
    queryFn: () => apiJson<SerializedCitationDefinition[]>("/api/citations/definitions"),
    enabled: status === "authenticated",
  });
}

export function useCitationAssignments(filters?: {
  status?: string;
  cadence?: CitationCadence;
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
}) {
  const { status } = useSession();
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.cadence) params.set("cadence", filters.cadence);
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.month) params.set("month", String(filters.month));
  if (filters?.quarter) params.set("quarter", String(filters.quarter));
  if (filters?.rotaryYearLabel) params.set("rotaryYearLabel", filters.rotaryYearLabel);

  const qs = params.toString();

  return useQuery({
    queryKey: ["citations", "assignments", filters],
    queryFn: () =>
      apiJson<SerializedCitationAssignment[]>(
        `/api/citations/assignments${qs ? `?${qs}` : ""}`
      ),
    enabled: status === "authenticated",
  });
}

export function useCitationAssignment(id: string) {
  return useQuery({
    queryKey: ["citations", "assignment", id],
    queryFn: () => apiJson<SerializedCitationAssignment>(`/api/citations/assignments/${id}`),
    enabled: Boolean(id),
  });
}

export function useCitationStandings(filters?: {
  cadence?: CitationCadence;
  year?: number;
  month?: number;
  quarter?: number;
  rotaryYearLabel?: string;
  limit?: number;
}) {
  const { status } = useSession();
  const params = new URLSearchParams();
  if (filters?.cadence) params.set("cadence", filters.cadence);
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.month) params.set("month", String(filters.month));
  if (filters?.quarter) params.set("quarter", String(filters.quarter));
  if (filters?.rotaryYearLabel) params.set("rotaryYearLabel", filters.rotaryYearLabel);
  if (filters?.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();

  return useQuery({
    queryKey: ["citations", "standings", filters],
    queryFn: () =>
      apiJson<CitationStandingsData>(`/api/citations/standings${qs ? `?${qs}` : ""}`),
    enabled: status === "authenticated",
    staleTime: 15_000,
    refetchOnMount: "always",
  });
}

export function useCreateCitationDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      points: number;
      cadence: CitationCadence;
    }) =>
      apiJson<SerializedCitationDefinition>("/api/citations/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["citations", "definitions"] }),
  });
}

export function useUpdateCitationDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      title?: string;
      description?: string;
      points?: number;
      isActive?: boolean;
    }) => {
      const { id, ...data } = input;
      return apiJson<SerializedCitationDefinition>(`/api/citations/definitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["citations"] }),
  });
}

export type AssignCitationsResult = {
  assignedCount: number;
  createdCount: number;
  alreadyAssignedCount: number;
};

export function useAssignCitations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      definitionId: string;
      assignAllClubs?: boolean;
      clubIds?: string[];
      dueDate?: string;
      year?: number;
      month?: number;
      quarter?: number;
      rotaryYearLabel?: string;
    }) =>
      apiJson<AssignCitationsResult>("/api/citations/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["citations"] }),
  });
}

export function useUpdateCitationAssignment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      clubNotes?: string;
      completedAt?: string | null;
      submit?: boolean;
      saveDraft?: boolean;
    }) =>
      apiJson<SerializedCitationAssignment>(`/api/citations/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citations", "assignment", id] });
      qc.invalidateQueries({ queryKey: ["citations", "assignments"] });
    },
  });
}

export function useReviewCitation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { status: "APPROVED" | "REJECTED"; reviewerComment?: string }) =>
      apiJson<SerializedCitationAssignment>(`/api/citations/assignments/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citations"] });
    },
  });
}

export async function uploadCitationProof(assignmentId: string, file: File) {
  // Prefer signed direct-to-Supabase upload so ~5 MB files bypass Vercel's ~4.5 MB body limit.
  try {
    const signed = await apiJson<{
      path: string;
      token: string;
      signedUrl: string;
      publicUrl: string;
    }>(`/api/citations/assignments/${assignmentId}/proof/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
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

    return apiJson<SerializedCitationAssignment>(
      `/api/citations/assignments/${assignmentId}/proof/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: signed.path }),
      }
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 500 && file.size <= 4 * 1024 * 1024) {
      const fd = new FormData();
      fd.append("file", file);
      return apiJson<SerializedCitationAssignment>(
        `/api/citations/assignments/${assignmentId}/proof`,
        { method: "POST", body: fd }
      );
    }
    throw err;
  }
}

/** Patch a citation assignment across list/detail caches after upload or local edit. */
export function patchCitationAssignmentCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: SerializedCitationAssignment
) {
  qc.setQueryData<SerializedCitationAssignment>(
    ["citations", "assignment", updated.id],
    updated
  );
  qc.setQueriesData<SerializedCitationAssignment[]>(
    { queryKey: ["citations", "assignments"] },
    (prev) =>
      prev
        ? prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
        : prev
  );
}
