import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { invalidateUserClaims, clearLoginFailLimit } from "@/lib/auth";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import {
  canResetUserPassword,
  getDefaultTemporaryPassword,
  serializeManagedUser,
} from "@/lib/admin-users";
import { validationError, handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  temporaryPassword: z.string().min(8).max(100).optional(),
});

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireRole([...DISTRICT_ROLES]);
  if (error) return error;

  const { id } = await params;
  const actorRole = session!.user.role as UserRole;

  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const temporaryPassword = body.temporaryPassword?.trim() || getDefaultTemporaryPassword();

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clubId: true,
        password: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        club: { select: { name: true } },
      },
    });

    if (!target) return notFound("User not found.");

    if (!canResetUserPassword(actorRole, target.role as UserRole)) {
      return forbidden("You cannot reset this user's password.");
    }

    const hash = await bcrypt.hash(temporaryPassword, 12);
    const updated = await prisma.user.update({
      where: { id },
      data: {
        password: hash,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clubId: true,
        password: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        club: { select: { name: true } },
      },
    });

    invalidateUserClaims(id);
    clearLoginFailLimit(updated.email);

    return NextResponse.json({
      user: serializeManagedUser({
        ...updated,
        role: updated.role as UserRole,
      }),
      temporaryPassword,
      message:
        "Password reset. Share the temporary password securely — they must change it on next login.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) return validationError(err);
    return handleRouteError(err, "Failed to reset password.");
  }
}
