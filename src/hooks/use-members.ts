"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@/lib/pagination";
import type { MemberDetail, MemberFilters, MemberListItem } from "@/types/member";

function buildQueryString(filters: MemberFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.clubId) params.set("clubId", filters.clubId);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useMembers(filters: MemberFilters = {}) {
  return useQuery({
    queryKey: ["members", filters],
    queryFn: async (): Promise<PaginatedResult<MemberListItem>> => {
      const res = await fetch(`/api/members?${buildQueryString(filters)}`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ["members", id],
    queryFn: async (): Promise<MemberDetail> => {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) throw new Error("Failed to fetch member");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", id] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useImportMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, clubId }: { file: File; clubId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", clubId);
      const res = await fetch("/api/members/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Import failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
