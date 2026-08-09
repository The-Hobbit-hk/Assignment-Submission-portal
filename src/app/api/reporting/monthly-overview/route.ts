import { requireAuth } from "@/lib/api-auth";
import {
  canGenerateMonthlyReportingDeck,
  canViewAllClubReports,
  canViewZoneClubReports,
} from "@/lib/roles";
import { getZonesForZonalRep } from "@/lib/zonal-reps";
import { buildMonthlyReportingOverview } from "@/lib/monthly-reporting-overview";
import { NextResponse } from "next/server";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

function resolveOverviewZones(role: UserRole, email: string | null | undefined) {
  if (canViewAllClubReports(role)) {
    return null;
  }
  if (canViewZoneClubReports(email)) {
    return getZonesForZonalRep(email!);
  }
  return null;
}

/** JSON overview for the monthly reporting visual dashboard. */
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
    return apiError("Invalid month/year.", 400);
  }

  const zones = resolveOverviewZones(role, email);
  if (canViewZoneClubReports(email) && !canViewAllClubReports(role) && (!zones || zones.length === 0)) {
    return forbidden("No zone is assigned to your account.");
  }

  try {
    const overview = await buildMonthlyReportingOverview(month, year, { zones });
    return NextResponse.json(overview, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load monthly reporting overview.");
  }
}
