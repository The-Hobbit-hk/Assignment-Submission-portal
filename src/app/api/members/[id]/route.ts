import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canAccessMemberRecord } from "@/lib/club-access";
import { canReassignMemberPrivilegedFields } from "@/lib/roles";
import { serializeMemberDetail } from "@/lib/member";
import { updateMemberSchema, MEMBER_SELF_EDITABLE_FIELDS } from "@/lib/validators/member";
import { logActivity } from "@/lib/activity";
import { validationError, handleRouteError, notFound, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** A member may always view/edit their own record (matched by user id or email). */
function isOwnMemberRecord(
  session: { user: { id?: string; email?: string | null } },
  member: { userId: string | null; email: string }
): boolean {
  if (member.userId && session.user.id && member.userId === session.user.id) {
    return true;
  }
  return (
    !!session.user.email &&
    member.email.toLowerCase() === session.user.email.toLowerCase()
  );
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
      ) &&
      !isOwnMemberRecord(session!, member)
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
    const isManager = canAccessMemberRecord(
      { role, clubId: session!.user.clubId },
      existing.clubId
    );
    const isSelf = isOwnMemberRecord(session!, existing);

    if (!isManager && !isSelf) {
      return forbidden();
    }

    let data = { ...parsed.data };

    if (isManager) {
      // Prevent club users from moving a member to another club or
      // self-awarding score points via the update payload.
      if (!canReassignMemberPrivilegedFields(role)) {
        delete data.clubId;
        delete data.points;
      }
    } else {
      // Self-service edit: restrict to profile fields (no club/role/status/points).
      data = Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          (MEMBER_SELF_EDITABLE_FIELDS as readonly string[]).includes(key)
        )
      );
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
