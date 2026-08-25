import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canViewDistrictDues } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { handleRouteError, forbidden } from "@/lib/api-errors";

export type DistrictDuesPaidMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  riId: string | null;
  role: string;
  status: string;
};

export type DistrictDuesPaidClubGroup = {
  club: { id: string; name: string; zone: string | null; charterNumber: string | null };
  paidCount: number;
  rosterCount: number;
  members: DistrictDuesPaidMember[];
};

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canViewDistrictDues(session!.user.role, session!.user.email)) {
    return forbidden();
  }

  try {
    const clubs = await prisma.club.findMany({
      where: OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
      orderBy: [{ zone: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        zone: true,
        charterNumber: true,
        _count: { select: { members: true } },
        members: {
          where: { duesPaid: "yes" },
          orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            riId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    const groups: DistrictDuesPaidClubGroup[] = clubs
      .map((club) => ({
        club: {
          id: club.id,
          name: club.name,
          zone: club.zone,
          charterNumber: club.charterNumber,
        },
        paidCount: club.members.length,
        rosterCount: club._count.members,
        members: club.members,
      }))
      .filter((group) => group.paidCount > 0);

    const summary = {
      clubsWithPaidMembers: groups.length,
      totalPaidMembers: groups.reduce((sum, group) => sum + group.paidCount, 0),
      totalRosterMembers: clubs.reduce((sum, club) => sum + club._count.members, 0),
    };

    return NextResponse.json({ summary, clubs: groups });
  } catch (err) {
    return handleRouteError(err, "Failed to load paid dues members.");
  }
}
