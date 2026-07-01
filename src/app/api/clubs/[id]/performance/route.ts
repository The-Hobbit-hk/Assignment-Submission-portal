import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { computeClubPerformance } from "@/lib/club";
import { handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  if (!canAccessClubRecord({ role: session!.user.role as UserRole, clubId: session!.user.clubId }, id)) {
    return forbidden();
  }

  try {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return notFound("Club not found.");
    }

    const performance = await computeClubPerformance(id, prisma);
    return NextResponse.json(performance);
  } catch (err) {
    return handleRouteError(err, "Failed to fetch performance.");
  }
}
