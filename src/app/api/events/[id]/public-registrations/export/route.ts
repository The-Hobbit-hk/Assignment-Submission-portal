import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES } from "@/lib/roles";
import { exportResponse } from "@/lib/export";
import { rowsToExcel } from "@/lib/export";
import {
  appBaseUrl,
  registrationFileUrl,
} from "@/lib/public-event-registration";
import { handleRouteError, notFound } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { error } = await requireRole(DISTRICT_ROLES);
  if (error) return error;

  const { id: eventId } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });
    if (!event) return notFound("Event not found.");

    const registrations = await prisma.publicEventRegistration.findMany({
      where: { eventId },
      orderBy: { registeredAt: "asc" },
    });

    const baseUrl = appBaseUrl(request);
    const headers = [
      "Name",
      "Club",
      "RI ID",
      "Registered At",
      "Payment Proof",
      "Government ID",
    ];

    const rows = registrations.map((r) => [
      r.name,
      r.clubName,
      r.riId,
      r.registeredAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      registrationFileUrl(baseUrl, eventId, r.id, "payment-proof"),
      registrationFileUrl(baseUrl, eventId, r.id, "government-id"),
    ]);

    const safeTitle = event.title.replace(/[^\w\s-]/g, "").trim().slice(0, 40);
    const buffer = await rowsToExcel("Registrations", headers, rows);

    return exportResponse(
      buffer,
      `${safeTitle || "event"}-registrations`,
      "excel"
    );
  } catch (err) {
    return handleRouteError(err, "Export failed.");
  }
}
