"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { DashboardData } from "@/types/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiJson<DashboardData>("/api/dashboard"),
  });
}
