import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { getBluebookAnalytics } from "@/lib/bluebook";
import { handleRouteError } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  try {
    const analytics = await getBluebookAnalytics(prisma, month, year);
    return jsonCached(analytics, { maxAge: 120 });
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
