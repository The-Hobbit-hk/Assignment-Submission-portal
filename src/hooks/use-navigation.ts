"use client";

import { useSession } from "next-auth/react";
import { getNavigationForRole } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export function useRoleNavigation() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  return getNavigationForRole(role);
}
