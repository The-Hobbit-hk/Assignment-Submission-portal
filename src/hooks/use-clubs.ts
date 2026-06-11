"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    queryFn: async (): Promise<PaginatedResult<ClubListItem>> => {
      const res = await fetch(`/api/clubs?${buildQueryString(filters)}`);
      if (!res.ok) throw new Error("Failed to fetch clubs");
      return res.json();
    },
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: ["clubs", id],
    queryFn: async (): Promise<ClubDetail> => {
      const res = await fetch(`/api/clubs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch club");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useClubAnalytics(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "analytics"],
    queryFn: async (): Promise<ClubAnalytics> => {
      const res = await fetch(`/api/clubs/${id}/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useClubPerformance(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "performance"],
    queryFn: async (): Promise<ClubPerformance> => {
      const res = await fetch(`/api/clubs/${id}/performance`);
      if (!res.ok) throw new Error("Failed to fetch performance");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useClubEvents(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "events"],
    queryFn: async (): Promise<ClubEventItem[]> => {
      const res = await fetch(`/api/clubs/${id}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useClubMembers(id: string) {
  return useQuery({
    queryKey: ["clubs", id, "members"],
    queryFn: async (): Promise<MemberListItem[]> => {
      const res = await fetch(`/api/clubs/${id}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create club");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
