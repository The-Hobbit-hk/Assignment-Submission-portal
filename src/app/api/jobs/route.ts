import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { forbidden, handleRouteError, validationError } from "@/lib/api-errors";
import { serializeJobPosting } from "@/lib/jobs";
import { canManageJobs } from "@/lib/roles";
import { createJobPostingSchema } from "@/lib/validators/jobs";
import type { UserRole } from "@/types/auth";

const jobInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const canManage = canManageJobs(
      session!.user.role as UserRole,
      session!.user.email
    );

    const jobs = await prisma.jobPosting.findMany({
      where: {
        ...(status === "OPEN" || status === "CLOSED" ? { status } : {}),
        ...(!canManage ? { status: "OPEN" as const } : {}),
      },
      include: jobInclude,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(jobs.map(serializeJobPosting));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch job postings.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!canManageJobs(role, session!.user.email)) {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = createJobPostingSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const job = await prisma.jobPosting.create({
      data: {
        ...parsed.data,
        location: parsed.data.location ?? null,
        recruiterName: parsed.data.recruiterName ?? null,
        status: parsed.data.status ?? "OPEN",
        createdById: session!.user.id,
      },
      include: jobInclude,
    });

    return NextResponse.json(serializeJobPosting(job), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create job posting.");
  }
}
