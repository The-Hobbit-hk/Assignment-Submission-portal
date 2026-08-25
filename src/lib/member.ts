import type {
  Member,
  Club,
  Prisma,
  MemberRole,
  MemberStatus,
} from "@/generated/prisma/client";
import type { MemberDetail, MemberListItem } from "@/types/member";

type MemberWithClub = Member & { club: Pick<Club, "id" | "name"> };

/** e.g. PROS-A3F9K2 — used when status is Prospective and no RI ID was provided. */
export function generateProspectiveId() {
  return `PROS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function serializeMemberListItem(member: MemberWithClub): MemberListItem {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt.toISOString(),
    riId: member.riId,
    profession: member.profession,
    gender: member.gender,
    dateOfBirth: member.dateOfBirth?.toISOString() ?? null,
    duesPaid: member.duesPaid,
    duesProofUrl: member.duesProofUrl,
    bloodGroup: member.bloodGroup,
    whatsapp: member.whatsapp,
    avatar: member.avatar,
    points: member.points,
    // Council members display their real home club while belonging to the district council club.
    club: { id: member.club.id, name: member.homeClub ?? member.club.name },
  };
}

export function serializeMemberDetail(member: MemberWithClub): MemberDetail {
  return {
    ...serializeMemberListItem(member),
    bio: member.bio,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

export function buildMemberWhere(params: {
  search?: string;
  clubId?: string;
  role?: string;
  status?: string;
  duesPaid?: string;
}) {
  const where: Prisma.MemberWhereInput = {};

  if (params.clubId) where.clubId = params.clubId;
  if (params.role) where.role = params.role as MemberRole;
  if (params.status) where.status = params.status as MemberStatus;

  if (params.duesPaid === "yes") {
    where.duesPaid = "yes";
  } else if (params.duesPaid === "unpaid") {
    where.OR = [{ duesPaid: null }, { duesPaid: { not: "yes" } }];
  }

  if (params.search) {
    const searchClause = [
      { firstName: { contains: params.search, mode: "insensitive" as const } },
      { lastName: { contains: params.search, mode: "insensitive" as const } },
      { email: { contains: params.search, mode: "insensitive" as const } },
      { riId: { contains: params.search, mode: "insensitive" as const } },
    ];
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchClause }];
      delete where.OR;
    } else {
      where.OR = searchClause;
    }
  }

  return where;
}
