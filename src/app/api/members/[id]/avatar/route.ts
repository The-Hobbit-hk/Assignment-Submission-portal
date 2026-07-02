import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessMemberRecord } from "@/lib/club-access";
import { saveUpload, isImageFile } from "@/lib/upload";
import { handleRouteError, apiError, forbidden, notFound } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  const existing = await prisma.member.findUnique({
    where: { id },
    select: { id: true, clubId: true, userId: true, email: true },
  });
  if (!existing) return notFound("Member not found.");

  const isManager = canAccessMemberRecord(
    { role, clubId: session!.user.clubId },
    existing.clubId
  );
  const isSelf =
    (existing.userId && session!.user.id && existing.userId === session!.user.id) ||
    (!!session!.user.email &&
      existing.email.toLowerCase() === session!.user.email.toLowerCase());

  if (!isManager && !isSelf) {
    return forbidden();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file provided.", 400);
    if (!isImageFile(file)) {
      return apiError("Allowed formats: JPG, PNG, WEBP.", 400);
    }

    const url = await saveUpload(file, "member-avatars", MAX_AVATAR_BYTES);

    const member = await prisma.member.update({
      where: { id },
      data: { avatar: url },
      select: { id: true, avatar: true },
    });

    return NextResponse.json({ avatar: member.avatar });
  } catch (err) {
    return handleRouteError(err, "Avatar upload failed.");
  }
}
