import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import {
  assignCitationToClubs,
  assignmentInclude,
  buildAssignmentsWhereFromQuery,
  serializeCitationAssignment,
  validatePeriodForCadence,
} from "@/lib/citations";
import { canSubmitCitations, DISTRICT_ROLES } from "@/lib/roles";
import {
  assignCitationsSchema,
  citationAssignmentsQuerySchema,
} from "@/lib/validators/citations";
import { apiError, validationError, handleRouteError } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = citationAssignmentsQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const role = session!.user.role as UserRole;
  const isDrr = DISTRICT_ROLES.includes(role);

  try {
    const where = buildAssignmentsWhereFromQuery(parsed.data);

    if (!isDrr) {
      if (!canSubmitCitations(role)) {
        return apiError("You don't have permission to view citations.", 403);
      }
      const clubId = session!.user.clubId;
      if (!clubId) {
        return NextResponse.json([]);
      }
      where.clubId = clubId;
    } else if (parsed.data.clubId) {
      where.clubId = parsed.data.clubId;
    }

    const assignments = await prisma.citationAssignment.findMany({
      where,
      include: assignmentInclude,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(assignments.map(serializeCitationAssignment));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch citation assignments.");
  }
}

export async function POST(request: Request) {
  const { error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = assignCitationsSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const definition = await prisma.citationDefinition.findUnique({
      where: { id: parsed.data.definitionId },
    });
    if (!definition) {
      return apiError("Citation definition not found.", 404);
    }

    const period = validatePeriodForCadence(definition.cadence, {
      year: parsed.data.year,
      month: parsed.data.month,
      quarter: parsed.data.quarter,
      rotaryYearLabel: parsed.data.rotaryYearLabel,
    });

    const created = await assignCitationToClubs({
      definitionId: parsed.data.definitionId,
      clubIds: parsed.data.clubIds,
      assignAllClubs: parsed.data.assignAllClubs,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      period,
      cadence: definition.cadence,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to assign citations.";
    return handleRouteError(err, message);
  }
}
