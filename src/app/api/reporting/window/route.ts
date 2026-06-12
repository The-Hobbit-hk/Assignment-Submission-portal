import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getActiveReportPeriod,
  getSubmissionWindowLabel,
  isReportingWindowOpen,
} from "@/lib/reporting-window";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));

  const result = await isReportingWindowOpen(month, year);
  const labels = getSubmissionWindowLabel(month, year);

  return NextResponse.json({
    open: result.open,
    message: result.message,
    reportMonth: month,
    reportYear: year,
    reportLabel: labels.reportLabel,
    opensAt: result.period?.opensAt?.toISOString() ?? null,
    closesAt: result.period?.closesAt?.toISOString() ?? null,
  });
}
