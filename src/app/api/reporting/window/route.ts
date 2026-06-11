import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { isReportingWindowOpen } from "@/lib/reporting-window";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const result = await isReportingWindowOpen(month, year);
  return NextResponse.json({
    open: result.open,
    message: result.message,
    opensAt: result.period?.opensAt?.toISOString() ?? null,
    closesAt: result.period?.closesAt?.toISOString() ?? null,
  });
}
