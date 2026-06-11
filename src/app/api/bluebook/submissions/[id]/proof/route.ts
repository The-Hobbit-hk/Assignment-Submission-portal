import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file." }, { status: 400 });

    const url = await saveUpload(file, "bluebook/proofs");
    const submission = await prisma.bluebookSubmission.update({
      where: { id },
      data: { proofUrl: url },
    });
    return NextResponse.json({ proofUrl: submission.proofUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
