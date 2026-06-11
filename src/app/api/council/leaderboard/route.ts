import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { buildPaginatedResult, getPaginationParams } from "@/lib/pagination";
import {
  ensureCouncilScoresSynced,
  fetchCouncilLeaderboard,
  serializeCouncilEntry,
} from "@/lib/council";
import { jsonCached } from "@/lib/api-response";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const entityType = (searchParams.get("entityType") ?? "CLUB") as "CLUB" | "MEMBER";
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const period = searchParams.get("period") ?? "monthly";
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const { skip } = getPaginationParams(searchParams, limit);

  try {
    await ensureCouncilScoresSynced(prisma, month, year);

    const { entries, total } = await fetchCouncilLeaderboard(prisma, {
      entityType,
      month,
      year,
      period,
      search,
      page,
      limit,
      skip,
    });

    return jsonCached(
      buildPaginatedResult(entries.map(serializeCouncilEntry), total, page, limit),
      { maxAge: 120 }
    );
  } catch {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
