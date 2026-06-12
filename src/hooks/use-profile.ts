"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { MemberListItem } from "@/types/member";

interface ProfileResponse {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  member: MemberListItem | null;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiJson<ProfileResponse>("/api/profile"),
  });
}
