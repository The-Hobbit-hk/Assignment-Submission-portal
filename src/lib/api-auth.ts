import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
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
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
