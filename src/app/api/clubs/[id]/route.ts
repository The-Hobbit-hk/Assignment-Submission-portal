import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeClubDetail } from "@/lib/club";
import { updateClubSchema } from "@/lib/validators/club";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const clubInclude = {
  president: { select: { id: true, name: true, email: true } },
  secretary: { select: { id: true, name: true, email: true } },
  _count: { select: { members: true, events: true } },
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: clubInclude,
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    return NextResponse.json(serializeClubDetail(club));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch club." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateClubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid club data." }, { status: 400 });
    }

    const data = parsed.data;
    const updateData = {
      ...data,
      foundedAt: data.foundedAt ? new Date(data.foundedAt) : undefined,
    };

    const club = await prisma.club.update({
      where: { id },
      data: updateData,
      include: clubInclude,
    });

    return NextResponse.json(serializeClubDetail(club));
  } catch {
    return NextResponse.json(
      { error: "Failed to update club." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ message: "Club deleted." });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete club." },
      { status: 500 }
    );
  }
}
