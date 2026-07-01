import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { canManageClubs } from "@/lib/roles";
import { clubListInclude, serializeClubDetail } from "@/lib/club";
import { updateClubSchema } from "@/lib/validators/club";
import { validationError, handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  if (!canAccessClubRecord({ role, clubId: session!.user.clubId }, id)) {
    return forbidden();
  }

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: clubListInclude,
    });

    if (!club) {
      return notFound("Club not found.");
    }

    return NextResponse.json(serializeClubDetail(club));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch club.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canManageClubs(session!.user.role as UserRole)) {
    return forbidden();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateClubSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;
    const updateData = {
      ...data,
      foundedAt: data.foundedAt ? new Date(data.foundedAt) : undefined,
    };

    const club = await prisma.club.update({
      where: { id },
      data: updateData,
      include: clubListInclude,
    });

    const { revalidatePublicClubs } = await import("@/lib/revalidate-public-site");
    revalidatePublicClubs();

    return NextResponse.json(serializeClubDetail(club));
  } catch (err) {
    return handleRouteError(err, "Failed to update club.");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canManageClubs(session!.user.role as UserRole)) {
    return forbidden();
  }

  const { id } = await params;

  try {
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ message: "Club deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete club.");
  }
}
