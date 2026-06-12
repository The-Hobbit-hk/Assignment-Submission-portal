import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeMemberListItem } from "@/lib/member";
import { handleRouteError } from "@/lib/api-errors";

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
  } catch (err) {
    return handleRouteError(err, "Failed to fetch club members.");
  }
}
