import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getClubUserClubId } from "@/lib/club-access";
import { canManageClubMembers, canReassignMemberPrivilegedFields } from "@/lib/roles";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import { buildMemberWhere, serializeMemberListItem, generateProspectiveId } from "@/lib/member";
import { createMemberSchema, memberQuerySchema } from "@/lib/validators/member";
import { logActivity } from "@/lib/activity";
import { validationError, handleRouteError, apiError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!canManageClubMembers(role)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const parsed = memberQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const ownClubId = getClubUserClubId({ role, clubId: session!.user.clubId });
  const { search, role: memberRole, status, page, limit } = parsed.data;
  let { clubId } = parsed.data;

  if (ownClubId) {
    clubId = ownClubId;
  }

  const { skip } = getPaginationParams(searchParams, limit);

  try {
    const where = buildMemberWhere({ search, clubId, role: memberRole, status });

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { club: { select: { id: true, name: true } } },
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json(
      buildPaginatedResult(
        members.map(serializeMemberListItem),
        total,
        page,
        limit
      )
    );
  } catch (err) {
    return handleRouteError(err, "Failed to fetch members.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!canManageClubMembers(role)) {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = createMemberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;
    const ownClubId = getClubUserClubId({ role, clubId: session!.user.clubId });
    const clubId = ownClubId ?? data.clubId;

    if (!clubId) {
      return apiError("Club is required.", 400);
    }

    if (ownClubId && data.clubId && data.clubId !== ownClubId) {
      return forbidden();
    }

    const existing = await prisma.member.findUnique({
      where: { email_clubId: { email: data.email, clubId } },
    });

    if (existing) {
      return apiError("A member with this email already exists in this club.", 409);
    }

    const riId =
      data.status === "PROSPECTIVE"
        ? data.riId?.trim() || generateProspectiveId()
        : data.riId;

    const member = await prisma.member.create({
      data: {
        clubId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        riId,
        profession: data.profession,
        bio: data.bio,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        duesPaid: data.duesPaid || null,
        bloodGroup: data.bloodGroup,
        whatsapp: data.whatsapp,
        points: canReassignMemberPrivilegedFields(role) ? (data.points ?? 0) : 0,
      },
      include: { club: { select: { id: true, name: true } } },
    });

    await logActivity({
      type: "MEMBER_JOINED",
      title: `${member.firstName} ${member.lastName} joined ${member.club.name}`,
      description: `New member added to the district ERP`,
      memberId: member.id,
      clubId: member.clubId,
      userId: session!.user.id,
    });

    return NextResponse.json(serializeMemberListItem(member), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create member.");
  }
}
