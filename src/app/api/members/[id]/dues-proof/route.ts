import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMemberListItem } from "@/lib/member";
import { isClubUser } from "@/lib/roles";
import { saveUpload } from "@/lib/upload";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
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

    if (
      isClubUser(session!.user.role) &&
      session!.user.clubId !== member.clubId
    ) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file?.size) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const url = await saveUpload(file, "member-dues", 5 * 1024 * 1024);
    const updated = await prisma.member.update({
      where: { id },
      data: { duesProofUrl: url },
      include: { club: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeMemberListItem(updated));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
