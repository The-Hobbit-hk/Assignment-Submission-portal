import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeRegistration } from "@/lib/event";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return NextResponse.json(registrations.map(serializeRegistration));
  } catch {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const { memberId } = await request.json();
    if (!memberId) {
      return NextResponse.json({ error: "memberId required." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    if (event.maxAttendees) {
      const count = await prisma.eventRegistration.count({ where: { eventId: id } });
      if (count >= event.maxAttendees) {
        return NextResponse.json({ error: "Event is full." }, { status: 409 });
      }
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventId: id, memberId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.event.update({
      where: { id },
      data: { attendees: { increment: 1 } },
    });

    return NextResponse.json(serializeRegistration(registration), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
