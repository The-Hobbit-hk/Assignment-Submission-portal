import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";
import { serializeCouncilAssignment } from "@/lib/council-bluebook";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const assignment = await prisma.councilBluebookAssignment.findUnique({
      where: { id },
    });

    if (!assignment || assignment.assigneeId !== session!.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const url = await saveUpload(file, "bluebook-proof");
    const updated = await prisma.councilBluebookAssignment.update({
      where: { id },
      data: { proofUrl: url },
      include: { task: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(serializeCouncilAssignment(updated));
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
