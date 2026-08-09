import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  canGenerateMonthlyReportingDeck,
  canViewAllClubReports,
  canViewZoneClubReports,
} from "@/lib/roles";
import { getZonesForZonalRep } from "@/lib/zonal-reps";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { buildMonthlyReportingOverview } from "@/lib/monthly-reporting-overview";
import { buildMonthlyReportingPptx } from "@/lib/monthly-reporting-pptx";
import { handleRouteError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

/** PowerPoint export of monthly club reporting overview. */
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

  if (!month || month < 1 || month > 12 || !year || year < 2020) {
    return NextResponse.json({ error: "Invalid month/year." }, { status: 400 });
  }

  const zones =
    !canViewAllClubReports(role) && canViewZoneClubReports(email)
      ? getZonesForZonalRep(email!)
      : null;

  if (zones && zones.length === 0) {
    return forbidden("No zone is assigned to your account.");
  }

  try {
    const overview = await buildMonthlyReportingOverview(month, year, { zones });
    const buffer = await buildMonthlyReportingPptx(overview);
    const filename =
      overview.scope === "zone" && overview.assignedZones?.length
        ? `monthly-reporting-${overview.assignedZones.join("-").replace(/\s+/g, "")}-${month}-${year}.pptx`
        : `monthly-reporting-${month}-${year}.pptx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to generate monthly reporting PPT.");
  }
}
