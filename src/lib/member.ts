import type {
  Member,
  Club,
  Prisma,
  MemberRole,
  MemberStatus,
} from "@/generated/prisma/client";
import type { MemberDetail, MemberListItem } from "@/types/member";

type MemberWithClub = Member & { club: Pick<Club, "id" | "name"> };

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
    club: { id: member.club.id, name: member.club.name },
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
}) {
  const where: Prisma.MemberWhereInput = {};

  if (params.clubId) where.clubId = params.clubId;
  if (params.role) where.role = params.role as MemberRole;
  if (params.status) where.status = params.status as MemberStatus;

  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: "insensitive" } },
      { lastName: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { riId: { contains: params.search, mode: "insensitive" } },
    ];
  }

  return where;
}
