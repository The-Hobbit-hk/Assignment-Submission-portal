import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMemberDetail } from "@/lib/member";
import { updateMemberSchema } from "@/lib/validators/member";
import { logActivity } from "@/lib/activity";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: { club: { select: { id: true, name: true } } },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    return NextResponse.json(serializeMemberDetail(member));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch member." },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Invalid member data." },
        { status: 400 }
      );
    }

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const member = await prisma.member.update({
      where: { id },
      data: parsed.data,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to update member." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ message: "Member deleted." });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete member." },
      { status: 500 }
    );
  }
}
