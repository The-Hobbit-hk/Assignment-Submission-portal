import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";

export async function GET() {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  try {
    const members = await prisma.user.findMany({
      where: { role: "COUNCIL_MEMBER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
