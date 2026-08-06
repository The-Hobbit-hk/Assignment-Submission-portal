import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { getActiveReportPeriod } from "@/lib/reporting-window";
import { buildMonthlyReportingOverview } from "@/lib/monthly-reporting-overview";
import { buildMonthlyReportingPptx } from "@/lib/monthly-reporting-pptx";
import { handleRouteError } from "@/lib/api-errors";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Admin-only PowerPoint overview of monthly club reporting. */
export async function GET(request: Request) {
  const { error } = await requireRole([...DISTRICT_ROLES]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month), 10);
  const year = parseInt(searchParams.get("year") ?? String(active.year), 10);

  if (!month || month < 1 || month > 12 || !year || year < 2020) {
    return NextResponse.json({ error: "Invalid month/year." }, { status: 400 });
  }

  try {
    const overview = await buildMonthlyReportingOverview(month, year);
    const buffer = await buildMonthlyReportingPptx(overview);
    const filename = `monthly-reporting-${month}-${year}.pptx`;

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
