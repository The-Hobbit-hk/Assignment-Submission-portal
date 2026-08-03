import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { rowsToExcel } from "@/lib/export";
import { deriveEventStatus } from "@/lib/event-display";
import { getEventTypeLabel } from "@/lib/event-types";
import { canManageEvents, isClubUser, DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { forbidden, handleRouteError } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  const canExportDistrict =
    canManageEvents(role) ||
    DISTRICT_ROLES.includes(role) ||
    role === "REPORTING_SECRETARY";
  const clubUser = isClubUser(role);

  if (!canExportDistrict && !clubUser) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month), 10);
  const year = parseInt(searchParams.get("year") ?? String(active.year), 10);
  const newsletterOnly = searchParams.get("newsletterOnly") === "true";
  const requestedClubId = searchParams.get("clubId");

  try {
    const where: Prisma.EventWhereInput = {
      startDate: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
      },
      clubId: { not: null },
    };

    if (newsletterOnly) {
      where.forDistrictNewsletter = true;
    }

    if (clubUser) {
      if (!session!.user.clubId) return forbidden();
      where.clubId = session!.user.clubId;
    } else if (requestedClubId) {
      where.clubId = requestedClubId;
    }

    const events = await prisma.event.findMany({
      where,
      include: { club: { select: { name: true, zone: true } } },
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
    });

    const headers = [
      "Club",
      "Zone",
      "Title",
      "Type",
      "Status",
      "Start",
      "End",
      "Location",
      "Hosted By",
      "Collaborations",
      "Description",
      "Attendance",
      "Max Attendees",
      "Service Hours",
      "For District Newsletter",
      "Banner URL",
      "Minutes PDF URL",
    ];

    const rows = events.map((event) => [
      event.club?.name ?? "",
      event.club?.zone ?? "",
      event.title,
      getEventTypeLabel(event.type),
      deriveEventStatus(event),
      event.startDate.toISOString(),
      event.endDate?.toISOString() ?? "",
      event.location ?? "",
      event.hostedBy ?? "",
      event.collaborations ?? "",
      event.description ?? "",
      event.attendees,
      event.maxAttendees ?? "",
      event.serviceHours,
      event.forDistrictNewsletter ? "Yes" : "No",
      event.bannerUrl ?? "",
      event.minutesPdfUrl ?? "",
    ]);

    const sheetName = newsletterOnly ? "Newsletter Events" : "Club Events";
    const suffix = newsletterOnly ? "newsletter" : "detail";
    const buffer = await rowsToExcel(sheetName, headers, rows);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="club-events-${suffix}-${month}-${year}.xlsx"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
