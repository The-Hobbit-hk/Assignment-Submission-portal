import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRegistrationState } from "@/lib/event-registration";
import { handleRouteError, apiError, notFound } from "@/lib/api-errors";
import { publicEventRegistrationSchema } from "@/lib/validators/public-event-registration";
import { savePrivateUpload } from "@/lib/upload";
import { serializePublicRegistration } from "@/lib/public-event-registration";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: eventId } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        type: { in: ["DISTRICT", "INSTALLATION"] },
        onSiteRegistration: true,
      },
    });

    if (!event) {
      return notFound("Event not found or on-site registration is not enabled.");
    }

    const state = getRegistrationState(event);
    if (state !== "open") {
      return apiError("Registration is not open for this event.", 403);
    }

    const form = await request.formData();
    const paymentFile = form.get("paymentProof");
    const governmentIdFile = form.get("governmentId");

    if (!(paymentFile instanceof File) || paymentFile.size === 0) {
      return apiError("Payment screenshot is required.", 400);
    }
    if (!(governmentIdFile instanceof File) || governmentIdFile.size === 0) {
      return apiError("Government ID upload is required.", 400);
    }

    const parsed = publicEventRegistrationSchema.safeParse({
      name: form.get("name"),
      clubName: form.get("clubName"),
      riId: form.get("riId"),
      acknowledged: form.get("acknowledged"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid form data.";
      return apiError(message, 400);
    }

    const { name, clubName, riId } = parsed.data;

    if (event.maxAttendees) {
      const count = await prisma.publicEventRegistration.count({ where: { eventId } });
      if (count >= event.maxAttendees) {
        return apiError("This event is full.", 409);
      }
    }

    const existing = await prisma.publicEventRegistration.findUnique({
      where: { eventId_riId: { eventId, riId } },
    });
    if (existing) {
      return apiError("This RI ID is already registered for this event.", 409);
    }

    const subfolder = `event-registrations/${eventId}`;
    const [paymentProofPath, governmentIdPath] = await Promise.all([
      savePrivateUpload(paymentFile, subfolder),
      savePrivateUpload(governmentIdFile, subfolder),
    ]);

    const registration = await prisma.publicEventRegistration.create({
      data: {
        eventId,
        name,
        clubName,
        riId,
        paymentProofPath,
        governmentIdPath,
        acknowledged: true,
      },
    });

    return NextResponse.json(serializePublicRegistration(registration), { status: 201 });
  } catch (err) {
    return handleRouteError(err, "Registration failed.");
  }
}
