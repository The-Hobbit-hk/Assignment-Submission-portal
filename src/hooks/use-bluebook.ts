"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
      const res = await fetch(`/api/bluebook/tasks?${p}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (filters.summary) return data as { tasks: unknown[]; analytics: unknown };
      return data;
    },
  });
}

export function useBluebookTask(id: string) {
  return useQuery({
    queryKey: ["bluebook", "tasks", id],
    queryFn: async () => {
      const res = await fetch(`/api/bluebook/tasks/${id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useBluebookAnalytics(month: number, year: number) {
  return useQuery({
    queryKey: ["bluebook", "analytics", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/bluebook/analytics?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: false,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, clubId }: { taskId: string; clubId: string }) => {
      const res = await fetch("/api/bluebook/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, clubId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}

export function useSubmitBluebook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bluebook/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submit: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}

export async function uploadProof(submissionId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/bluebook/submissions/${submissionId}/proof`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function useReviewSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      allocatedScore: number;
      reviewerComment?: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const res = await fetch(`/api/bluebook/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook"] }),
  });
}
