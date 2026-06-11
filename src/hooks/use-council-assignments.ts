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
  summary: CouncilBluebookSummary;
  members: CouncilMemberBluebookRow[];
  submissions: SerializedCouncilAssignment[];
};

export function useCouncilBluebookOverview(month: number, year: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["bluebook", "council-overview", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/bluebook/council-overview?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load council bluebook overview");
      return res.json() as Promise<CouncilBluebookOverviewData>;
    },
    enabled: status === "authenticated",
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

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

export function useMyCouncilTasks() {
  return useQuery({
    queryKey: ["bluebook", "my-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/bluebook/my-tasks");
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
      qc.invalidateQueries({ queryKey: ["bluebook", "assignment-portal"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "assignments"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "tasks"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks"] });
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
      qc.invalidateQueries({ queryKey: ["bluebook", "assignments"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "assignment-portal"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks"] });
    },
  });
}

export function useSubmitCouncilAssignment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bluebook/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submit: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks"] });
      qc.invalidateQueries({ queryKey: ["bluebook", "council-overview"] });
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
