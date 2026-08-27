"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiJson } from "@/lib/api-client";
import {
  guessContentType,
  isStorageNotConfiguredError,
  putFileToSignedUrl,
  shouldAvoidMultipartFallback,
  withRetries,
} from "@/lib/direct-storage-upload";
import type {
  CouncilBluebookSummary,
  CouncilMemberBluebookRow,
  SerializedCouncilAssignment,
} from "@/lib/council-bluebook-status";

export type AssignmentPortalData = {
  assignments: SerializedCouncilAssignment[];
  members: { id: string; name: string | null; email: string }[];
  tasks: { id: string; title: string; description?: string | null }[];
};

export type CouncilBluebookOverviewData = {
  month: number;
  year: number;
  cycle?: { id: string; title: string; closesAt: string; opensAt: string };
  summary: CouncilBluebookSummary;
  members: CouncilMemberBluebookRow[];
  submissions: SerializedCouncilAssignment[];
};

export type MyCouncilTasksData = {
  month: number;
  year: number;
  cycle: {
    id: string;
    title: string;
    closesAt: string;
    opensAt: string;
    isOpen: boolean;
    windowState?: "open" | "upcoming" | "closed";
    periodLabel: string;
  };
  report: {
    id: string;
    submissionNotes: string | null;
    proofUrls: string[];
    status: string;
    submittedAt: string | null;
    reviewedAt?: string | null;
    reviewerComment?: string | null;
  } | null;
  assignments: (SerializedCouncilAssignment & {
    statusLabel?: string;
    outcomeLabel?: string;
  })[];
  stats: {
    totalTasks: number;
    tasksCompleted: number;
    tasksIncomplete?: number;
    tasksUnderReview?: number;
    tasksPending?: number;
    reviewedCount?: number;
    reviewDone?: boolean;
    completionPercent: number | null;
    totalPossiblePoints: number;
    totalAwardedPoints: number;
    submissionDeadline: string;
    submissionOpensAt?: string;
    windowState?: "open" | "upcoming" | "closed";
    submissionOpen: boolean;
    submissionClosed: boolean;
    submissionUpcoming?: boolean;
    submissionStatus: string;
    testingMode?: boolean;
  };
};

export type CouncilReviewData = {
  month: number;
  year: number;
  member: { id: string; name: string | null; email: string };
  cycle: { closesAt: string; title: string };
  report: {
    submissionNotes: string | null;
    proofUrls: string[];
    status: string;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewerComment: string | null;
  } | null;
  assignments: SerializedCouncilAssignment[];
  totals: {
    tasksAssigned: number;
    tasksCompleted: number;
    percentageScore: number | null;
    pointsPossible?: number;
    pointsAwarded?: number;
  };
};

export function useCouncilBluebookOverview(
  month: number,
  year: number,
  filters?: {
    status?: string;
    memberId?: string;
    category?: string;
    reviewStatus?: string;
  }
) {
  const { status } = useSession();
  const params = new URLSearchParams({ month: String(month), year: String(year) });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.memberId) params.set("memberId", filters.memberId);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.reviewStatus) params.set("reviewStatus", filters.reviewStatus);

  return useQuery({
    queryKey: ["bluebook", "council-overview", month, year, filters],
    queryFn: () =>
      apiJson<CouncilBluebookOverviewData>(`/api/bluebook/council-overview?${params}`),
    enabled: status === "authenticated",
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useMyCouncilTasks(month: number, year: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["bluebook", "my-tasks", month, year],
    queryFn: () =>
      apiJson<MyCouncilTasksData>(`/api/bluebook/my-tasks?month=${month}&year=${year}`),
    enabled: status === "authenticated",
  });
}

export function useCouncilMemberReview(memberId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bluebook", "council-review", memberId, month, year],
    queryFn: () =>
      apiJson<CouncilReviewData>(
        `/api/bluebook/council-review/${memberId}?month=${month}&year=${year}`
      ),
    enabled: Boolean(memberId),
  });
}

export function useReviewCouncilMember(memberId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      month: number;
      year: number;
      scores: { assignmentId: string; completed: boolean }[];
      reviewerComment?: string;
      markReviewed?: boolean;
    }) =>
      apiJson<CouncilReviewData>(`/api/bluebook/council-review/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["bluebook", "council-review", memberId, variables.month, variables.year],
      });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
      qc.invalidateQueries({ queryKey: ["council"] });
    },
  });
}

export function useSubmitCouncilReport(month: number, year: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionNotes: string) =>
      apiJson("/api/bluebook/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, submissionNotes }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks", month, year] });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
    },
  });
}

export async function uploadCouncilReportProof(month: number, year: number, file: File) {
  const contentType = guessContentType(file.name, file.type);

  try {
    const signed = await withRetries(
      () =>
        apiJson<{
          path: string;
          token: string;
          signedUrl: string;
          publicUrl: string;
        }>(`/api/bluebook/reports/upload/sign?month=${month}&year=${year}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType,
            size: file.size,
          }),
        }),
      3,
      "Prepare upload"
    );

    await putFileToSignedUrl(file, signed.signedUrl, contentType);

    return withRetries(
      () =>
        apiJson(`/api/bluebook/reports/upload/complete?month=${month}&year=${year}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: signed.path }),
        }),
      3,
      "Save upload"
    );
  } catch (err) {
    if (isStorageNotConfiguredError(err) && !shouldAvoidMultipartFallback(file.size)) {
      const fd = new FormData();
      fd.append("file", file);
      return apiJson(`/api/bluebook/reports/upload?month=${month}&year=${year}`, {
        method: "POST",
        body: fd,
      });
    }
    throw err;
  }
}

export function useReopenCouncilReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: string; month: number; year: number }) =>
      apiJson("/api/bluebook/reports/reopen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["bluebook", "council-review", variables.memberId, variables.month, variables.year],
      });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
      qc.invalidateQueries({
        queryKey: ["bluebook", "my-tasks", variables.month, variables.year],
      });
      qc.invalidateQueries({ queryKey: ["council"] });
    },
  });
}

export function useReevaluateCouncilReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: string; month: number; year: number }) =>
      apiJson("/api/bluebook/reports/reevaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["bluebook", "council-review", variables.memberId, variables.month, variables.year],
      });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
      qc.invalidateQueries({ queryKey: ["council"] });
    },
  });
}

export function useCreateBluebookCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      month: number;
      year: number;
      opensAt: string;
      closesAt: string;
    }) =>
      apiJson("/api/bluebook/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook", "cycles"] }),
  });
}

// --- existing hooks below ---

export function useAssignmentPortal(month: number, year: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["bluebook", "assignment-portal", month, year],
    queryFn: () =>
      apiJson<AssignmentPortalData>(
        `/api/bluebook/assignment-portal?month=${month}&year=${year}`
      ),
    enabled: status === "authenticated",
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useCouncilAssignments() {
  return useQuery({
    queryKey: ["bluebook", "assignments"],
    queryFn: () => apiJson("/api/bluebook/assignments"),
  });
}

export function useCouncilMembers() {
  return useQuery({
    queryKey: ["users", "council-members"],
    queryFn: () =>
      apiJson<{ id: string; name: string | null; email: string }[]>("/api/users/council-members"),
  });
}

export type CreateAndAssignInput = {
  title: string;
  description?: string;
  category?: string;
  maxScore?: number;
  dueDate: string;
  month: number;
  year: number;
  assigneeIds: string[];
  notes?: string;
};

export function useCreateAndAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAndAssignInput) =>
      apiJson("/api/bluebook/assignment-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string | null;
  category?: string;
  maxScore?: number;
  dueDate?: string;
};

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTaskInput) =>
      apiJson(`/api/bluebook/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export function useAssignTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { taskId: string; assigneeIds: string[]; notes?: string }) =>
      apiJson("/api/bluebook/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export async function uploadCouncilProof(assignmentId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiJson(`/api/bluebook/assignments/${assignmentId}/proof`, {
    method: "POST",
    body: fd,
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiJson(`/api/bluebook/assignments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export function useBatchDeleteAssignments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiJson(`/api/bluebook/assignments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}
