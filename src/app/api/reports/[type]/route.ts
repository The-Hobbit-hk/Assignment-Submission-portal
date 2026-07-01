import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { canExportDistrictReports } from "@/lib/roles";
import { getReportData, type ReportType } from "@/lib/reports";
import { rowsToCsv, rowsToExcel, rowsToPdf, exportResponse } from "@/lib/export";
import { handleRouteError, apiError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

const VALID_TYPES = ["members", "clubs", "events", "bluebook", "council-bluebook", "performance"];

interface RouteParams { params: Promise<{ type: string }> }

export async function GET(request: Request, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!canExportDistrictReports(session!.user.role as UserRole)) {
    return forbidden();
  }

  const { type } = await params;
  if (!VALID_TYPES.includes(type)) {
    return apiError("Invalid report type.", 400);
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "csv") as "pdf" | "excel" | "csv";
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

  if (!["pdf", "excel", "csv"].includes(format)) {
    return apiError("Invalid format.", 400);
  }

  try {
    const { title, headers, rows } = await getReportData(
      type as ReportType,
      month,
      year
    );

    if (format === "csv") {
      return exportResponse(rowsToCsv(headers, rows), `${type}-report`, "csv");
    }
    if (format === "excel") {
      const buffer = await rowsToExcel(type, headers, rows);
      return exportResponse(buffer, `${type}-report`, "excel");
    }
    const buffer = await rowsToPdf(title, headers, rows);
    return exportResponse(buffer, `${type}-report`, "pdf");
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
