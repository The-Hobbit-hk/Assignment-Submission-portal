"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
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
    queryFn: () =>
      apiJson<PaginatedResult<MemberListItem>>(`/api/members?${buildQueryString(filters)}`),
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => apiJson<MemberDetail>(`/api/members/${id}`),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson<{ id: string }>("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", id] });
    },
  });
}

export function useUploadMemberAvatar(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiJson<{ avatar: string | null }>(`/api/members/${id}/avatar`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiJson(`/api/members/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useImportMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, clubId }: { file: File; clubId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", clubId);
      return apiJson<{ imported: number; skipped: number }>("/api/members/import", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
