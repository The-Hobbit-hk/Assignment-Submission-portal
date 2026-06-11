import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeSubmission } from "@/lib/bluebook";

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const submission = await prisma.bluebookSubmission.update({
      where: { id },
      data: {
        status: body.submit ? "SUBMITTED" : undefined,
        submittedAt: body.submit ? new Date() : undefined,
      },
      include: {
        club: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, maxScore: true, dueDate: true } },
      },
    });
    return NextResponse.json(serializeSubmission(submission));
  } catch {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
