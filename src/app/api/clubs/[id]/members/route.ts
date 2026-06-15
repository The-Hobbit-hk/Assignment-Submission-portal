import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { serializeMemberListItem } from "@/lib/member";
import { handleRouteError, forbidden } from "@/lib/api-errors";
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
    const members = await prisma.member.findMany({
      where: { clubId: id },
      orderBy: { lastName: "asc" },
      include: { club: { select: { id: true, name: true } } },
    });

    return NextResponse.json(members.map(serializeMemberListItem));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch club members.");
  }
}
