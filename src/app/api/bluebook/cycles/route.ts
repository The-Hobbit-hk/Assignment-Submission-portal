import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { serializeCycle } from "@/lib/bluebook-cycle";
import { createBluebookCycleSchema } from "@/lib/validators/bluebook-cycle";
import { canAssignBluebook } from "@/lib/roles";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    if (month && year) {
      const cycle = await prisma.bluebookCycle.findUnique({
        where: {
          month_year: { month: parseInt(month, 10), year: parseInt(year, 10) },
        },
      });
      return NextResponse.json(cycle ? serializeCycle(cycle) : null);
    }

    const cycles = await prisma.bluebookCycle.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 24,
    });
    return NextResponse.json(cycles.map(serializeCycle));
  } catch {
    return NextResponse.json({ error: "Failed to load cycles." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireRole(["DISTRICT_SECRETARY", "DISTRICT_ADMIN", "SUPER_ADMIN"]);
  if (error) return error;
  if (!canAssignBluebook(session!.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = createBluebookCycleSchema.parse(await request.json());
    const cycle = await prisma.bluebookCycle.upsert({
      where: { month_year: { month: body.month, year: body.year } },
      create: {
        title: body.title,
        month: body.month,
        year: body.year,
        opensAt: new Date(body.opensAt),
        closesAt: new Date(body.closesAt),
        isActive: body.isActive ?? true,
      },
      update: {
        title: body.title,
        opensAt: new Date(body.opensAt),
        closesAt: new Date(body.closesAt),
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(serializeCycle(cycle));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
