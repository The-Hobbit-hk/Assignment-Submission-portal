import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { computeClubAnalytics } from "@/lib/club";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const analytics = await computeClubAnalytics(id, prisma);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
