import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  councilPeriodMonths,
  ensureCouncilScoresSynced,
  fetchCouncilPodium,
  type CouncilScorePeriod,
} from "@/lib/council";
import { jsonCached } from "@/lib/api-response";
import { forbidden, handleRouteError } from "@/lib/api-errors";
import { canViewCouncilStandings, isCouncilMember } from "@/lib/roles";

function parsePeriod(value: string | null): CouncilScorePeriod {
  if (value === "yearly" || value === "quarterly") return value;
  return "monthly";
}

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role;
  if (!canViewCouncilStandings(role)) return forbidden();

  const { searchParams } = new URL(request.url);
  const entityType = isCouncilMember(role)
    ? "MEMBER"
    : ((searchParams.get("entityType") ?? "CLUB") as "CLUB" | "MEMBER");
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const period = parsePeriod(searchParams.get("period"));

  try {
    const monthsToSync = councilPeriodMonths(period, month, year);
    await Promise.all(
      monthsToSync.map((p) => ensureCouncilScoresSynced(prisma, p.month, p.year))
    );
    const podium = await fetchCouncilPodium(prisma, entityType, month, year, period);
    return jsonCached(podium, { maxAge: 120 });
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
