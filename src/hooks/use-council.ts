"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/lib/pagination";

interface CouncilEntry {
  id: string;
  name: string;
  email: string | null;
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
  period?: "monthly" | "yearly";
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
    queryFn: async (): Promise<{
      podium: CouncilEntry[];
      leaderboard: PaginatedResult<CouncilEntry>;
    }> => {
      const res = await fetch(`/api/council?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useCouncilPodium(
  filters: Pick<CouncilFilters, "entityType" | "month" | "year"> = {}
) {
  const p = buildCouncilParams(filters);
  return useQuery({
    queryKey: ["council", "podium", filters],
    queryFn: async () => {
      const res = await fetch(`/api/council/podium?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useCouncilLeaderboard(filters: CouncilFilters = {}) {
  const p = buildCouncilParams(filters);
  return useQuery({
    queryKey: ["council", "leaderboard", filters],
    queryFn: async (): Promise<PaginatedResult<CouncilEntry>> => {
      const res = await fetch(`/api/council/leaderboard?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
