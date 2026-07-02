import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { validationError, handleRouteError, apiError } from "@/lib/api-errors";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return apiError("Password change is not available for this account.", 400);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return apiError("Your current password is incorrect.", 400);
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return apiError("Choose a password different from your current one.", 400);
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, mustChangePassword: false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, "Failed to change password.");
  }
}
