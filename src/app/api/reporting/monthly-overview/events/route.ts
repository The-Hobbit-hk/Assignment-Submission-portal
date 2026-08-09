import { NextResponse } from "next/server";
import type { EventType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  canGenerateMonthlyReportingDeck,
  canViewAllClubReports,
  canViewZoneClubReports,
} from "@/lib/roles";
import { getZonesForZonalRep } from "@/lib/zonal-reps";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER } from "@/lib/district-clubs-data";
import { CLUB_EVENT_AVENUE_VALUES, getEventTypeLabel } from "@/lib/event-types";
import { serializeEvent } from "@/lib/event";
import { apiError, handleRouteError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

const avenueSet = new Set<string>(CLUB_EVENT_AVENUE_VALUES);

/**
 * Events for one avenue (or "OTHER") in the monthly reporting dashboard period.
 * Zonal reps only see events from clubs in their assigned zone(s).
 */
export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  const email = session!.user.email;
  if (!canGenerateMonthlyReportingDeck(role, email)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month), 10);
  const year = parseInt(searchParams.get("year") ?? String(active.year), 10);
  const type = searchParams.get("type")?.trim() || "";

  if (!month || month < 1 || month > 12 || !year || year < 2020) {
    return apiError("Invalid month/year.", 400);
  }
  if (!type) {
    return apiError("Event type is required.", 400);
  }
  if (type !== "OTHER" && !avenueSet.has(type)) {
    return apiError("Unsupported avenue type.", 400);
  }

  const zoneFilter =
    !canViewAllClubReports(role) && canViewZoneClubReports(email)
      ? getZonesForZonalRep(email!)
      : null;

  if (zoneFilter && zoneFilter.length === 0) {
    return forbidden("No zone is assigned to your account.");
  }

  try {
    const clubs = await prisma.club.findMany({
      where: {
        ...OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER,
        ...(zoneFilter ? { zone: { in: zoneFilter } } : {}),
      },
      select: { id: true },
    });
    const clubIds = clubs.map((c) => c.id);

    if (clubIds.length === 0) {
      return NextResponse.json({
        month,
        year,
        type,
        label: type === "OTHER" ? "Other" : getEventTypeLabel(type),
        count: 0,
        events: [],
      });
    }

    const typeFilter: Prisma.EventWhereInput =
      type === "OTHER"
        ? { type: { notIn: [...CLUB_EVENT_AVENUE_VALUES] as EventType[] } }
        : { type: type as EventType };

    const events = await prisma.event.findMany({
      where: {
        clubId: { in: clubIds },
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        },
        ...typeFilter,
      },
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
      include: {
        club: { select: { id: true, name: true } },
        _count: { select: { registrations: true } },
      },
    });

    return NextResponse.json({
      month,
      year,
      type,
      label: type === "OTHER" ? "Other" : getEventTypeLabel(type),
      count: events.length,
      events: events.map(serializeEvent),
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load avenue events.");
  }
}
