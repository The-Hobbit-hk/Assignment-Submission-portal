import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const data = await getDashboardData();
    return jsonCached(data, { maxAge: 60 });
  } catch {
    return jsonCached(
      { error: "Failed to fetch dashboard data." },
      { status: 500, maxAge: 0 }
    );
  }
}
