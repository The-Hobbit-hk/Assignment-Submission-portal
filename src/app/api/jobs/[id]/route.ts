import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { forbidden, handleRouteError, notFound, validationError } from "@/lib/api-errors";
import { serializeJobPosting } from "@/lib/jobs";
import { canManageJobs, DISTRICT_ROLES } from "@/lib/roles";
import { updateJobPostingSchema } from "@/lib/validators/jobs";
import type { UserRole } from "@/types/auth";

const jobInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: jobInclude,
    });

    if (!job) return notFound("Job posting not found.");

    const canManage = canManageJobs(
      session!.user.role as UserRole,
      session!.user.email
    );
    if (job.status === "CLOSED" && !canManage) {
      return notFound("Job posting not found.");
    }

    return NextResponse.json(serializeJobPosting(job));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch job posting.");
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  const { id } = await params;

  try {
    const existing = await prisma.jobPosting.findUnique({ where: { id } });
    if (!existing) return notFound("Job posting not found.");

    const isManager = canManageJobs(role, session!.user.email);
    const isOwner = existing.createdById === session!.user.id;
    const isDistrict = DISTRICT_ROLES.includes(role);

    if (!isManager || (!isOwner && !isDistrict)) {
      return forbidden();
    }

    const body = await request.json();
    const parsed = updateJobPostingSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...parsed.data,
        location:
          parsed.data.location === undefined
            ? undefined
            : parsed.data.location ?? null,
        recruiterName:
          parsed.data.recruiterName === undefined
            ? undefined
            : parsed.data.recruiterName ?? null,
      },
      include: jobInclude,
    });

    return NextResponse.json(serializeJobPosting(job));
  } catch (err) {
    return handleRouteError(err, "Failed to update job posting.");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  const { id } = await params;

  try {
    const existing = await prisma.jobPosting.findUnique({ where: { id } });
    if (!existing) return notFound("Job posting not found.");

    const isManager = canManageJobs(role, session!.user.email);
    const isOwner = existing.createdById === session!.user.id;
    const isDistrict = DISTRICT_ROLES.includes(role);

    if (!isManager || (!isOwner && !isDistrict)) {
      return forbidden();
    }

    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete job posting.");
  }
}
