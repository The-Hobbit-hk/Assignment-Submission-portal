import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeSubmission } from "@/lib/bluebook";
import { reviewSubmissionSchema } from "@/lib/validators/bluebook";
import { validationError, handleRouteError } from "@/lib/api-errors";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = reviewSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const submission = await prisma.bluebookSubmission.update({
      where: { id },
      data: {
        allocatedScore: parsed.data.allocatedScore,
        reviewerComment: parsed.data.reviewerComment,
        status: parsed.data.status,
        reviewedAt: new Date(),
        reviewedById: session!.user.id,
      },
      include: {
        club: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, maxScore: true, dueDate: true } },
      },
    });

    return NextResponse.json(serializeSubmission(submission));
  } catch (err) {
    return handleRouteError(err, "Review failed.");
  }
}
