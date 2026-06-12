import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import {
  serializeCitationDefinition,
} from "@/lib/citations";
import { DISTRICT_ROLES } from "@/lib/roles";
import { createCitationDefinitionSchema } from "@/lib/validators/citations";
import { validationError, handleRouteError } from "@/lib/api-errors";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const definitions = await prisma.citationDefinition.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(definitions.map(serializeCitationDefinition));
  } catch (err) {
    return handleRouteError(err, "Failed to fetch citation definitions.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createCitationDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const definition = await prisma.citationDefinition.create({
      data: {
        ...parsed.data,
        createdById: session!.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json(serializeCitationDefinition(definition), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create citation definition.");
  }
}
