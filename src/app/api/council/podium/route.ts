import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  ensureCouncilScoresSynced,
  fetchCouncilPodium,
} from "@/lib/council";
import { jsonCached } from "@/lib/api-response";
import { forbidden, handleRouteError } from "@/lib/api-errors";
import { canViewCouncilStandings, isCouncilMember } from "@/lib/roles";

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

  try {
    await ensureCouncilScoresSynced(prisma, month, year);
    const podium = await fetchCouncilPodium(prisma, entityType, month, year);
    return jsonCached(podium, { maxAge: 120 });
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
