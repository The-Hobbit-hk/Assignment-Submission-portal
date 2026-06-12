import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import { buildClubWhere, clubListInclude, serializeClubListItem } from "@/lib/club";
import { createClubSchema, clubQuerySchema } from "@/lib/validators/club";
import { logActivity } from "@/lib/activity";
import { validationError, handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = clubQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { search, status, zone, page, limit, minimal } = parsed.data;
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    const where = buildClubWhere({ search, status, zone });

    const total = await prisma.club.count({ where });

    const items = minimal
      ? (
          await prisma.club.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            select: { id: true, name: true, zone: true },
          })
        ).map((club) => ({
          id: club.id,
          name: club.name,
          zone: club.zone,
          charterNumber: null,
          city: null,
          status: "ACTIVE" as const,
          foundedAt: null,
          serviceHours: 0,
          memberCount: 0,
          eventCount: 0,
          president: null,
          secretary: null,
        }))
      : (
          await prisma.club.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            include: clubListInclude,
          })
        ).map((club) => serializeClubListItem(club));

    return NextResponse.json(
      buildPaginatedResult(items, total, page, limit)
    );
  } catch (err) {
    return handleRouteError(err, "Failed to fetch clubs.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createClubSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;

    const club = await prisma.club.create({
      data: {
        name: data.name,
        charterNumber: data.charterNumber,
        city: data.city,
        zone: data.zone,
        status: data.status,
        foundedAt: data.foundedAt ? new Date(data.foundedAt) : undefined,
        description: data.description,
        presidentId: data.presidentId,
        secretaryId: data.secretaryId,
        serviceHours: data.serviceHours ?? 0,
      },
      include: clubListInclude,
    });

    await logActivity({
      type: "CLUB_CREATED",
      title: `Club "${club.name}" was created`,
      clubId: club.id,
      userId: session!.user.id,
    });

    return NextResponse.json(serializeClubListItem(club), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Failed to create club.");
  }
}
