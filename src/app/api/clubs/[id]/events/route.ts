import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { serializeClubEvent } from "@/lib/club";
import { handleRouteError, forbidden } from "@/lib/api-errors";
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
    const events = await prisma.event.findMany({
      where: { clubId: id },
      orderBy: { startDate: "desc" },
      take: 20,
    });

    return NextResponse.json(events.map(serializeClubEvent));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch events.");
  }
}
