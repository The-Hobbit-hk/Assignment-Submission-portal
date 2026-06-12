import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { getDashboardData } from "@/lib/dashboard";
import { handleRouteError } from "@/lib/api-errors";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const data = await getDashboardData();
    return jsonCached(data, { maxAge: 60 });
  } catch (err) {
    return handleRouteError(err, "Failed to fetch dashboard data.");
  }
}
