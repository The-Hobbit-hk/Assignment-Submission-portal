import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { canManageClubs } from "@/lib/roles";
import { saveUpload, isImageFile } from "@/lib/upload";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MAX_LOGO_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  if (
    !canManageClubs(role) &&
    !canAccessClubRecord({ role, clubId: session!.user.clubId }, id)
  ) {
    return forbidden();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file provided.", 400);
    if (!isImageFile(file)) {
      return apiError("Allowed formats: JPG, PNG, WEBP.", 400);
    }

    const url = await saveUpload(file, "club-logos", MAX_LOGO_BYTES);

    const club = await prisma.club.update({
      where: { id },
      data: { logo: url },
      select: { id: true, logo: true },
    });

    const { revalidatePublicClubs } = await import("@/lib/revalidate-public-site");
    revalidatePublicClubs();

    return NextResponse.json({ logo: club.logo });
  } catch (err) {
    return handleRouteError(err, "Logo upload failed.");
  }
}
