"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { PaginatedResult } from "@/lib/pagination";

interface CouncilEntry {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  clubName: string | null;
  score: number;
  rank: number | null;
  badge: string | null;
  trend: number;
  trendDirection: string;
}

interface CouncilFilters {
  entityType?: "CLUB" | "MEMBER";
  month?: number;
  year?: number;
  period?: "monthly" | "quarterly" | "yearly";
  search?: string;
  page?: number;
  limit?: number;
}

function buildCouncilParams(filters: CouncilFilters) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v != null && p.set(k, String(v)));
  return p;
}

export function useCouncilData(filters: CouncilFilters = {}) {
  const p = buildCouncilParams({
    entityType: "MEMBER",
    ...filters,
  });

  return useQuery({
    queryKey: ["council", filters],
    queryFn: () =>
      apiJson<{
        podium: CouncilEntry[];
        leaderboard: PaginatedResult<CouncilEntry>;
      }>(`/api/council?${p}`),
  });
}

export function useCouncilPodium(
  filters: Pick<CouncilFilters, "entityType" | "month" | "year"> = {}
) {
  const p = buildCouncilParams(filters);
  return useQuery({
    queryKey: ["council", "podium", filters],
    queryFn: () => apiJson(`/api/council/podium?${p}`),
  });
}

export function useCouncilLeaderboard(filters: CouncilFilters = {}) {
  const p = buildCouncilParams(filters);
  return useQuery({
    queryKey: ["council", "leaderboard", filters],
    queryFn: () =>
      apiJson<PaginatedResult<CouncilEntry>>(`/api/council/leaderboard?${p}`),
  });
}
