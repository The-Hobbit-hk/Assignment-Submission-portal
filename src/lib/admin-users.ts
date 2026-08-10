import type { UserRole } from "@/types/auth";
import { canManageUsers } from "@/lib/roles";
import { COUNCIL_PASSWORD } from "@/lib/council-roster-data";

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  clubId: string | null;
  clubName: string | null;
  hasPassword: boolean;
  mustChangePassword: boolean;
  /** True when the user has completed (or never needed) the forced first-login reset. */
  passwordReady: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getDefaultTemporaryPassword() {
  return COUNCIL_PASSWORD;
}

export function formatUserRole(role: UserRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** DISTRICT_ADMIN cannot reset SUPER_ADMIN accounts. */
export function canResetUserPassword(actorRole: UserRole, targetRole: UserRole) {
  if (!canManageUsers(actorRole)) return false;
  if (targetRole === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") return false;
  return true;
}

export function serializeManagedUser(user: {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  clubId: string | null;
  password: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  club: { name: string } | null;
}): ManagedUser {
  const hasPassword = Boolean(user.password);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    clubId: user.clubId,
    clubName: user.club?.name ?? null,
    hasPassword,
    mustChangePassword: user.mustChangePassword,
    passwordReady: hasPassword && !user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
