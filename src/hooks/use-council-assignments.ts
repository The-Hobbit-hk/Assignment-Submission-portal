"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type {
  CouncilBluebookSummary,
  CouncilMemberBluebookRow,
  SerializedCouncilAssignment,
} from "@/lib/council-bluebook-status";

export type AssignmentPortalData = {
  assignments: {
    id: string;
    assigneeName: string;
    task?: { title: string; dueDate: string };
    status: string;
  }[];
  members: { id: string; name: string | null; email: string }[];
  tasks: { id: string; title: string }[];
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
    periodLabel: string;
  };
  report: {
    id: string;
    submissionNotes: string | null;
    proofUrls: string[];
    status: string;
    submittedAt: string | null;
  } | null;
  assignments: SerializedCouncilAssignment[];
  stats: {
    totalTasks: number;
    totalPossiblePoints: number;
    totalAwardedPoints: number;
    submissionDeadline: string;
    submissionOpen: boolean;
    submissionClosed: boolean;
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
    pointsPossible: number;
    pointsAwarded: number;
    percentageScore: number | null;
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
    queryFn: async () => {
      const res = await fetch(`/api/bluebook/council-overview?${params}`);
      if (!res.ok) throw new Error("Failed to load council bluebook overview");
      return res.json() as Promise<CouncilBluebookOverviewData>;
    },
    enabled: status === "authenticated",
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useMyCouncilTasks(month: number, year: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["bluebook", "my-tasks", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/bluebook/my-tasks?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<MyCouncilTasksData>;
    },
    enabled: status === "authenticated",
  });
}

export function useCouncilMemberReview(memberId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bluebook", "council-review", memberId, month, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/bluebook/council-review/${memberId}?month=${month}&year=${year}`
      );
      if (!res.ok) throw new Error("Failed to load review");
      return res.json() as Promise<CouncilReviewData>;
    },
    enabled: Boolean(memberId),
  });
}

export function useReviewCouncilMember(memberId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      scores: { assignmentId: string; allocatedScore: number }[];
      reviewerComment?: string;
      markReviewed?: boolean;
    }) => {
      const res = await fetch(`/api/bluebook/council-review/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Review failed");
      }
      return res.json() as Promise<CouncilReviewData>;
    },
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
    mutationFn: async (submissionNotes: string) => {
      const res = await fetch("/api/bluebook/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, submissionNotes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Submit failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks", month, year] });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
    },
  });
}

export async function uploadCouncilReportProof(month: number, year: number, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/bluebook/reports/upload?month=${month}&year=${year}`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Upload failed");
  }
  return res.json();
}

export function useReopenCouncilReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { memberId: string; month: number; year: number }) => {
      const res = await fetch("/api/bluebook/reports/reopen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Reopen failed");
      }
      return res.json();
    },
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

export function useCreateBluebookCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      month: number;
      year: number;
      opensAt: string;
      closesAt: string;
    }) => {
      const res = await fetch("/api/bluebook/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bluebook", "cycles"] }),
  });
}

// --- existing hooks below ---

export function useAssignmentPortal(month: number, year: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["bluebook", "assignment-portal", month, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/bluebook/assignment-portal?month=${month}&year=${year}`
      );
      if (!res.ok) throw new Error("Failed to load assignment portal");
      return res.json() as Promise<AssignmentPortalData>;
    },
    enabled: status === "authenticated",
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useCouncilAssignments() {
  return useQuery({
    queryKey: ["bluebook", "assignments"],
    queryFn: async () => {
      const res = await fetch("/api/bluebook/assignments");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useCouncilMembers() {
  return useQuery({
    queryKey: ["users", "council-members"],
    queryFn: async () => {
      const res = await fetch("/api/users/council-members");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ id: string; name: string | null; email: string }[]>;
    },
  });
}

export type CreateAndAssignInput = {
  title: string;
  description?: string;
  category: string;
  maxScore: number;
  dueDate: string;
  month: number;
  year: number;
  assigneeIds: string[];
  notes?: string;
};

export function useCreateAndAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAndAssignInput) => {
      const res = await fetch("/api/bluebook/assignment-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export function useAssignTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { taskId: string; assigneeIds: string[]; notes?: string }) => {
      const res = await fetch("/api/bluebook/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook"] });
    },
  });
}

export async function uploadCouncilProof(assignmentId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/bluebook/assignments/${assignmentId}/proof`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
