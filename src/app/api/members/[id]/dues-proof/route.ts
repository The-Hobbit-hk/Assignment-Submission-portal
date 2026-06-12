import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMemberListItem } from "@/lib/member";
import { isClubUser } from "@/lib/roles";
import { saveUpload } from "@/lib/upload";
import { handleRouteError, apiError, notFound, forbidden } from "@/lib/api-errors";

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
      return notFound("Member not found.");
    }

    if (
      isClubUser(session!.user.role) &&
      session!.user.clubId !== member.clubId
    ) {
      return forbidden();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file?.size) {
      return apiError("No file provided.", 400);
    }

    const url = await saveUpload(file, "member-dues", 5 * 1024 * 1024);
    const updated = await prisma.member.update({
      where: { id },
      data: { duesProofUrl: url },
      include: { club: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeMemberListItem(updated));
  } catch (e) {
    return handleRouteError(e, "Upload failed.");
  }
}
