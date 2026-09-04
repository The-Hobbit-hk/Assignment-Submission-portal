import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canViewDistrictDues } from "@/lib/roles";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { homeClubMatches } from "@/lib/club-home";
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

const paidMemberSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  riId: true,
  role: true,
  status: true,
  clubId: true,
  homeClub: true,
} as const;

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
          select: paidMemberSelect,
        },
      },
    });

    // Council members are stored on the district council club; attribute paid
    // dues to their homeClub for district reporting.
    const paidCouncil = await prisma.member.findMany({
      where: {
        duesPaid: "yes",
        homeClub: { not: null },
      },
      select: paidMemberSelect,
    });

    const allCouncilHome = await prisma.member.findMany({
      where: { homeClub: { not: null } },
      select: { id: true, clubId: true, homeClub: true },
    });

    const groups: DistrictDuesPaidClubGroup[] = clubs
      .map((club) => {
        const directPaid = club.members;
        const affiliatePaid = paidCouncil.filter(
          (member) =>
            member.clubId !== club.id && homeClubMatches(member.homeClub, club.name)
        );
        const byId = new Map<string, DistrictDuesPaidMember>();
        for (const member of [...directPaid, ...affiliatePaid]) {
          byId.set(member.id, {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            riId: member.riId,
            role: member.role,
            status: member.status,
          });
        }
        const members = [...byId.values()].sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );

        const affiliateRosterCount = allCouncilHome.filter(
          (member) =>
            member.clubId !== club.id && homeClubMatches(member.homeClub, club.name)
        ).length;

        return {
          club: {
            id: club.id,
            name: club.name,
            zone: club.zone,
            charterNumber: club.charterNumber,
          },
          paidCount: members.length,
          rosterCount: club._count.members + affiliateRosterCount,
          members,
        };
      })
      .filter((group) => group.paidCount > 0);

    const summary = {
      clubsWithPaidMembers: groups.length,
      totalPaidMembers: groups.reduce((sum, group) => sum + group.paidCount, 0),
      totalRosterMembers:
        clubs.reduce((sum, club) => sum + club._count.members, 0) + allCouncilHome.length,
    };

    return NextResponse.json({ summary, clubs: groups });
  } catch (err) {
    return handleRouteError(err, "Failed to load paid dues members.");
  }
}
