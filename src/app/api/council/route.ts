import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import { forbidden, handleRouteError } from "@/lib/api-errors";
import { canViewCouncilStandings, isCouncilMember } from "@/lib/roles";
import {
  councilPeriodMonths,
  ensureCouncilScoresSynced,
  fetchCouncilLeaderboard,
  fetchCouncilPodium,
  serializeCouncilEntry,
  type CouncilScorePeriod,
} from "@/lib/council";

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
  // Council members are scoped to council-member standings only.
  const entityType = isCouncilMember(role)
    ? "MEMBER"
    : ((searchParams.get("entityType") ?? "MEMBER") as "CLUB" | "MEMBER");
  const month = parseInt(
    searchParams.get("month") ?? String(new Date().getMonth() + 1)
  );
  const year = parseInt(
    searchParams.get("year") ?? String(new Date().getFullYear())
  );
  const period = parsePeriod(searchParams.get("period"));
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "5");
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    const monthsToSync = councilPeriodMonths(period, month, year);
    await Promise.all(
      monthsToSync.map((p) => ensureCouncilScoresSynced(prisma, p.month, p.year))
    );

    const [podium, leaderboard] = await Promise.all([
      fetchCouncilPodium(prisma, entityType, month, year, period),
      fetchCouncilLeaderboard(prisma, {
        entityType,
        month,
        year,
        period,
        search,
        page,
        limit,
        skip,
      }),
    ]);

    return jsonCached(
      {
        podium,
        leaderboard: buildPaginatedResult(
          leaderboard.entries.map(serializeCouncilEntry),
          leaderboard.total,
          leaderboard.page,
          leaderboard.limit
        ),
      },
      { maxAge: 30 }
    );
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
