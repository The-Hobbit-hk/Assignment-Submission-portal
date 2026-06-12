"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { PaginatedResult } from "@/lib/pagination";
import type {
  ClubAnalytics,
  ClubDetail,
  ClubEventItem,
  ClubListItem,
  ClubPerformance,
} from "@/types/club";
import type { MemberListItem } from "@/types/member";

interface ClubFilters {
  search?: string;
  status?: string;
  zone?: string;
  page?: number;
  limit?: number;
}

function buildQueryString(filters: ClubFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.zone) params.set("zone", filters.zone);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useClubsList(filters: ClubFilters = { limit: 100 }) {
  return useQuery({
    queryKey: ["clubs", filters],
    queryFn: () =>
      apiJson<PaginatedResult<ClubListItem>>(`/api/clubs?${buildQueryString(filters)}`),
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: ["clubs", id],
    queryFn: () => apiJson<ClubDetail>(`/api/clubs/${id}`),
    enabled: !!id,
  });
}

export function useClubAnalytics(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "analytics"],
    queryFn: () => apiJson<ClubAnalytics>(`/api/clubs/${id}/analytics`),
    enabled: !!id,
  });
}

export function useClubPerformance(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "performance"],
    queryFn: () => apiJson<ClubPerformance>(`/api/clubs/${id}/performance`),
    enabled: !!id,
  });
}

export function useClubEvents(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "events"],
    queryFn: () => apiJson<ClubEventItem[]>(`/api/clubs/${id}/events`),
    enabled: !!id,
  });
}

export function useClubMembers(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "members"],
    queryFn: () => apiJson<MemberListItem[]>(`/api/clubs/${id}/members`),
    enabled: !!id,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson<{ id: string }>("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
