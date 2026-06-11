import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import { buildMemberWhere, serializeMemberListItem } from "@/lib/member";
import { createMemberSchema, memberQuerySchema } from "@/lib/validators/member";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = memberQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const { search, clubId, role, status, page, limit } = parsed.data;
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    const where = buildMemberWhere({ search, clubId, role, status });

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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch members." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid member data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { isClubUser } = await import("@/lib/roles");
    const clubId =
      isClubUser(session!.user.role) && session!.user.clubId
        ? session!.user.clubId
        : data.clubId;

    const existing = await prisma.member.findUnique({
      where: { email_clubId: { email: data.email, clubId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A member with this email already exists in this club." },
        { status: 409 }
      );
    }

    const member = await prisma.member.create({
      data: {
        clubId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        riId: data.riId,
        profession: data.profession,
        bio: data.bio,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        duesPaid: data.duesPaid || null,
        bloodGroup: data.bloodGroup,
        whatsapp: data.whatsapp,
        points: data.points ?? 0,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to create member." },
      { status: 500 }
    );
  }
}
