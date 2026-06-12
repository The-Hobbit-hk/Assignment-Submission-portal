import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMonthlyReport } from "@/lib/reporting";
import {
  assertClubReportingAccess,
  requireReportingClubId,
  resolveReportingClubId,
} from "@/lib/reporting-access";
import { upsertMonthlyReport } from "@/lib/reporting-store";
import { eventsReportSchema } from "@/lib/validators/reporting";
import { getActiveReportPeriod } from "@/lib/reporting";
import { validationError, handleRouteError, apiError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const active = getActiveReportPeriod();
  const month = parseInt(searchParams.get("month") ?? String(active.month));
  const year = parseInt(searchParams.get("year") ?? String(active.year));
  const clubId = await resolveReportingClubId(session!, searchParams.get("clubId"));

  try {
    const report = await prisma.monthlyReport.findFirst({
      where: { type: "EVENTS", month, year, clubId },
    });
    return NextResponse.json(report ? serializeMonthlyReport(report) : null);
  } catch (err) {
    return handleRouteError(err, "Failed to load report.");
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = eventsReportSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    const access = await assertClubReportingAccess(session!, d.month, d.year);
    if (!access.ok) {
      return apiError(access.error, access.status);
    }

    const clubResolved = await requireReportingClubId(session!, d.clubId);
    if (!clubResolved.ok) {
      return apiError(clubResolved.error, clubResolved.status);
    }
    const clubId = clubResolved.clubId;
    const isSubmit = d.submit === true;

    const report = await upsertMonthlyReport(
      prisma,
      "EVENTS",
      { month: d.month, year: d.year, clubId },
      {
        submittedBy: { connect: { id: session!.user.id } },
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        submittedAt: isSubmit ? new Date() : null,
        ...(clubId ? { club: { connect: { id: clubId } } } : {}),
      }
    );

    return NextResponse.json(serializeMonthlyReport(report));
  } catch (err) {
    return handleRouteError(err, "Failed to save report.");
  }
}
