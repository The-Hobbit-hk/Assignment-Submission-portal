import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { fetchAssignableCouncilMembers } from "@/lib/council-assignees";
import { DISTRICT_ROLES } from "@/lib/roles";
import { handleRouteError } from "@/lib/api-errors";

export async function GET() {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const members = await fetchAssignableCouncilMembers(prisma);
    return NextResponse.json(members);
  } catch (err) {
    return handleRouteError(err, "Failed.");
  }
}
