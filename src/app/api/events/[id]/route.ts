import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeEvent } from "@/lib/event";
import { updateEventSchema } from "@/lib/validators/event";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: { select: { id: true, name: true } },
        gallery: { orderBy: { sortOrder: "asc" } },
        registrations: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const serialized = serializeEvent(event);
    return NextResponse.json({
      ...serialized,
      registrations: event.registrations.map((r) => ({
        id: r.id,
        status: r.status,
        registeredAt: r.registeredAt.toISOString(),
        member: r.member,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch event." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const d = parsed.data;
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...d,
        startDate: d.startDate ? new Date(d.startDate) : undefined,
        endDate: d.endDate ? new Date(d.endDate) : undefined,
      },
      include: {
        club: { select: { id: true, name: true } },
        gallery: { orderBy: { sortOrder: "asc" } },
        _count: { select: { registrations: true } },
      },
    });
    return NextResponse.json(serializeEvent(event));
  } catch {
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted." });
  } catch {
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
