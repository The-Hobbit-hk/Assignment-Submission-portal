import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import {
  ensureCouncilScoresSynced,
  fetchCouncilLeaderboard,
  fetchCouncilPodium,
  serializeCouncilEntry,
} from "@/lib/council";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const entityType = (searchParams.get("entityType") ?? "MEMBER") as
    | "CLUB"
    | "MEMBER";
  const month = parseInt(
    searchParams.get("month") ?? String(new Date().getMonth() + 1)
  );
  const year = parseInt(
    searchParams.get("year") ?? String(new Date().getFullYear())
  );
  const period = searchParams.get("period") ?? "monthly";
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "5");
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    await ensureCouncilScoresSynced(prisma, month, year);

    const [podium, leaderboard] = await Promise.all([
      fetchCouncilPodium(prisma, entityType, month, year),
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
      { maxAge: 120 }
    );
  } catch {
    return jsonCached({ error: "Failed." }, { status: 500, maxAge: 0 });
  }
}
