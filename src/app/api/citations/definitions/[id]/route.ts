import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeCitationDefinition } from "@/lib/citations";
import { DISTRICT_ROLES } from "@/lib/roles";
import { updateCitationDefinitionSchema } from "@/lib/validators/citations";
import { validationError, notFound, handleRouteError } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateCitationDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.citationDefinition.findUnique({ where: { id } });
    if (!existing) return notFound("Citation definition not found.");

    const definition = await prisma.citationDefinition.update({
      where: { id },
      data: parsed.data,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json(serializeCitationDefinition(definition));
  } catch (err) {
    return handleRouteError(err, "Failed to update citation definition.");
  }
}
