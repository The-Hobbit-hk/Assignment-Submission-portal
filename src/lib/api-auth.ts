import { auth } from "@/lib/auth";
import { forbidden, unauthorized } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      error: unauthorized(),
    };
  }

  return { session, error: null };
}

export async function requireRole(roles: UserRole[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  if (!roles.includes(session!.user.role)) {
    return {
      session: null,
      error: forbidden(),
    };
  }

  return { session, error: null };
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
