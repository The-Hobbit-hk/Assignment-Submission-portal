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
  } catch {
    return NextResponse.json({ error: "Failed to load report." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = eventsReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report data." }, { status: 400 });
    }

    const d = parsed.data;
    const access = await assertClubReportingAccess(session!, d.month, d.year);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const clubResolved = await requireReportingClubId(session!, d.clubId);
    if (!clubResolved.ok) {
      return NextResponse.json({ error: clubResolved.error }, { status: clubResolved.status });
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
  } catch {
    return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
  }
}
