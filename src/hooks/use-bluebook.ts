"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import { serializeTask } from "@/lib/bluebook";

type BluebookTaskDetail = Omit<ReturnType<typeof serializeTask>, "submissions"> & {
  submissions?: {
    id: string;
    proofUrl?: string | null;
    reviewerComment?: string | null;
    allocatedScore: number;
    status?: string;
    clubId?: string;
    club?: { id: string; name: string };
  }[];
};

export function useBluebookTasks(
  filters: {
    month?: number;
    year?: number;
    expired?: boolean;
    clubId?: string;
    summary?: boolean;
  } = {}
) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v == null) return;
    if (k === "summary") {
      if (v) p.set("summary", "true");
      return;
    }
    p.set(k, String(v));
  });

  return useQuery({
    queryKey: ["bluebook", "tasks", filters],
    queryFn: async () => {
      const data = await apiJson<unknown>(`/api/bluebook/tasks?${p}`);
      if (filters.summary) return data as { tasks: unknown[]; analytics: unknown };
      return data;
    },
  });
}

export function useBluebookTask(id: string) {
  return useQuery({
    queryKey: ["bluebook", "tasks", id],
    queryFn: () => apiJson<BluebookTaskDetail>(`/api/bluebook/tasks/${id}`),
    enabled: !!id,
  });
}

export function useBluebookAnalytics(month: number, year: number) {
  return useQuery({
    queryKey: ["bluebook", "analytics", month, year],
    queryFn: () => apiJson(`/api/bluebook/analytics?month=${month}&year=${year}`),
    enabled: false,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, clubId }: { taskId: string; clubId: string }) =>
      apiJson<{ id: string }>("/api/bluebook/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, clubId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}

export function useSubmitBluebook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiJson(`/api/bluebook/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submit: true }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}

export async function uploadProof(submissionId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiJson(`/api/bluebook/submissions/${submissionId}/proof`, {
    method: "POST",
    body: fd,
  });
}

export function useReviewSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      allocatedScore: number;
      reviewerComment?: string;
      status: "APPROVED" | "REJECTED";
    }) =>
      apiJson(`/api/bluebook/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}
