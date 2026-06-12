import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getClubCitationStandings,
  resolvePeriodLabel,
  validatePeriodForCadence,
} from "@/lib/citations";
import { siteConfig } from "@/config/site";
import { citationStandingsQuerySchema } from "@/lib/validators/citations";
import { validationError, handleRouteError } from "@/lib/api-errors";
import type { CitationCadence } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = citationStandingsQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const now = new Date();
    const cadence: CitationCadence = parsed.data.cadence ?? "MONTHLY";
    const year = parsed.data.year ?? now.getFullYear();
    const month = parsed.data.month ?? now.getMonth() + 1;
    const quarter = parsed.data.quarter ?? Math.ceil(month / 3);
    const rotaryYearLabel = parsed.data.rotaryYearLabel ?? siteConfig.rotaryYear;

    const period = validatePeriodForCadence(cadence, {
      year,
      month,
      quarter,
      rotaryYearLabel,
    });

    const standings = await getClubCitationStandings({
      cadence,
      periodKey: period.periodKey,
      limit: parsed.data.limit,
    });

    return NextResponse.json({
      cadence,
      periodKey: period.periodKey,
      periodLabel: resolvePeriodLabel(cadence, {
        year: period.year,
        month: period.month ?? undefined,
        quarter: period.quarter ?? undefined,
        rotaryYearLabel: period.rotaryYearLabel ?? undefined,
      }),
      standings,
    });
  } catch (err) {
    return handleRouteError(err, "Failed to fetch citation standings.");
  }
}
