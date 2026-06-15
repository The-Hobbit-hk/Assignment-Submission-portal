"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiJson } from "@/lib/api-client";
import type { SerializedJobPosting } from "@/lib/jobs";
import type { JobPostingStatus } from "@/generated/prisma/client";

export function useJobPostings(status?: JobPostingStatus | "ALL") {
  const { status: authStatus } = useSession();
  const params = status && status !== "ALL" ? `?status=${status}` : "";

  return useQuery({
    queryKey: ["jobs", status ?? "ALL"],
    queryFn: () => apiJson<SerializedJobPosting[]>(`/api/jobs${params}`),
    enabled: authStatus === "authenticated",
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiJson<SerializedJobPosting>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & Record<string, unknown>) =>
      apiJson<SerializedJobPosting>(`/api/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiJson<{ message: string }>(`/api/jobs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
