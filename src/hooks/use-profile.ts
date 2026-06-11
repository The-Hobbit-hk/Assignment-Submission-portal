"use client";

import { useQuery } from "@tanstack/react-query";
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
    queryFn: async (): Promise<ProfileResponse> => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });
}
