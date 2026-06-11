import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMemberListItem } from "@/lib/member";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const members = await prisma.member.findMany({
      where: { clubId: id },
      orderBy: { lastName: "asc" },
      include: { club: { select: { id: true, name: true } } },
    });

    return NextResponse.json(members.map(serializeMemberListItem));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch club members." },
      { status: 500 }
    );
  }
}
