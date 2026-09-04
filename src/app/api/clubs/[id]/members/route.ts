import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessClubRecord } from "@/lib/club-access";
import { buildClubRosterWhere, filterHomeClubAffiliates } from "@/lib/club-home";
import { serializeMemberListItem } from "@/lib/member";
import { handleRouteError, forbidden, notFound } from "@/lib/api-errors";
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
      select: { id: true, name: true },
    });
    if (!club) return notFound("Club not found.");

    const rows = await prisma.member.findMany({
      where: buildClubRosterWhere(club),
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { club: { select: { id: true, name: true } } },
    });
    const members = filterHomeClubAffiliates(rows, club);

    return NextResponse.json(members.map(serializeMemberListItem));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch club members.");
  }
}
