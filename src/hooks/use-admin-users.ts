"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { ManagedUser } from "@/lib/admin-users";
import type { PaginatedResult } from "@/lib/pagination";
import type { UserRole } from "@/types/auth";

export type AdminUsersResponse = PaginatedResult<ManagedUser> & {
  summary: {
    mustChangeCount: number;
    totalUsers: number;
  };
};

export type ResetPasswordResult = {
  user: ManagedUser;
  temporaryPassword: string;
  message: string;
};

export function useAdminUsers(filters: {
  search?: string;
  role?: string;
  passwordStatus?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.passwordStatus && filters.passwordStatus !== "all") {
    params.set("passwordStatus", filters.passwordStatus);
  }
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => apiJson<AdminUsersResponse>(`/api/admin/users?${params}`),
    placeholderData: (prev) => prev,
  });
}

export function useResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; temporaryPassword?: string }) =>
      apiJson<ResetPasswordResult>(`/api/admin/users/${input.userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          input.temporaryPassword ? { temporaryPassword: input.temporaryPassword } : {}
        ),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export const ADMIN_USER_ROLE_OPTIONS: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "CLUB_PRESIDENT", label: "Club President" },
  { value: "CLUB_SECRETARY", label: "Club Secretary" },
  { value: "COUNCIL_MEMBER", label: "Council Member" },
  { value: "REPORTING_SECRETARY", label: "Reporting Secretary" },
  { value: "DISTRICT_SECRETARY", label: "District Secretary" },
  { value: "DISTRICT_ADMIN", label: "District Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "MEMBER", label: "Member" },
];
