import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeClubEvent } from "@/lib/club";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const events = await prisma.event.findMany({
      where: { clubId: id },
      orderBy: { startDate: "desc" },
      take: 20,
    });

    return NextResponse.json(events.map(serializeClubEvent));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events." },
      { status: 500 }
    );
  }
}
