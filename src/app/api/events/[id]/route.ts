import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeEvent } from "@/lib/event";
import { updateEventSchema } from "@/lib/validators/event";
import { validationError, handleRouteError, notFound } from "@/lib/api-errors";

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
    if (!event) return notFound("Not found.");

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
  } catch (err) {
    return handleRouteError(err, "Failed to fetch event.");
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
      return validationError(parsed.error);
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
    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json(serializeEvent(event));
  } catch (err) {
    return handleRouteError(err, "Failed to update event.");
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    await prisma.event.delete({ where: { id } });

    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json({ message: "Deleted." });
  } catch (err) {
    return handleRouteError(err, "Failed to delete.");
  }
}
