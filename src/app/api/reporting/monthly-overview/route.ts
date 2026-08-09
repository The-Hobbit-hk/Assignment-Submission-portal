import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { buildMonthlyReportingOverview } from "@/lib/monthly-reporting-overview";
import { handleRouteError, apiError } from "@/lib/api-errors";

export const runtime = "nodejs";

/** Admin JSON overview for the monthly reporting visual dashboard. */
export async function GET(request: Request) {
  const { error } = await requireRole([...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month), 10);
  const year = parseInt(searchParams.get("year") ?? String(active.year), 10);

  if (!month || month < 1 || month > 12 || !year || year < 2020) {
    return apiError("Invalid month/year.", 400);
  }

  try {
    const overview = await buildMonthlyReportingOverview(month, year);
    return NextResponse.json(overview, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load monthly reporting overview.");
  }
}
