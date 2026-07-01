import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessMemberRecord } from "@/lib/club-access";
import { canReassignMemberPrivilegedFields } from "@/lib/roles";
import { serializeMemberDetail } from "@/lib/member";
import { updateMemberSchema } from "@/lib/validators/member";
import { logActivity } from "@/lib/activity";
import { validationError, handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: { club: { select: { id: true, name: true } } },
    });

    if (!member) {
      return notFound("Member not found.");
    }

    if (
      !canAccessMemberRecord(
        { role, clubId: session!.user.clubId },
        member.clubId
      )
    ) {
      return forbidden();
    }

    return NextResponse.json(serializeMemberDetail(member));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch member.");
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Member not found.");
    }

    const role = session!.user.role as UserRole;
    if (
      !canAccessMemberRecord(
        { role, clubId: session!.user.clubId },
        existing.clubId
      )
    ) {
      return forbidden();
    }

    // Prevent club users from moving a member to another club or self-awarding
    // score points via the update payload.
    const data = { ...parsed.data };
    if (!canReassignMemberPrivilegedFields(role)) {
      delete data.clubId;
      delete data.points;
    }

    const member = await prisma.member.update({
      where: { id },
      data,
      include: { club: { select: { id: true, name: true } } },
    });

    await logActivity({
      type: "MEMBER_UPDATED",
      title: `${member.firstName} ${member.lastName} profile updated`,
      memberId: member.id,
      clubId: member.clubId,
      userId: session!.user.id,
    });

    return NextResponse.json(serializeMemberDetail(member));
  } catch (err) {
    return handleRouteError(err, "Failed to update member.");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const role = session!.user.role as UserRole;

  try {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Member not found.");
    }

    if (
      !canAccessMemberRecord(
        { role, clubId: session!.user.clubId },
        existing.clubId
      )
    ) {
      return forbidden();
    }

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ message: "Member deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete member.");
  }
}
