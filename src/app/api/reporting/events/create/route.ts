import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeEvent } from "@/lib/event";
import { assertClubEventCreateAccess, resolveReportingClubId } from "@/lib/reporting-access";
import { syncEventsReportIfClubHasEvents } from "@/lib/events-reporting-sync";
import { reportingEventSchema } from "@/lib/validators/reporting";
import { isClubUser } from "@/lib/roles";
import { logActivity } from "@/lib/activity";
import { saveUpload } from "@/lib/upload";
import { deriveEventStatus } from "@/lib/event-display";
import { validationError, handleRouteError, apiError } from "@/lib/api-errors";

const eventInclude = {
  club: { select: { id: true, name: true } },
  _count: { select: { registrations: true } },
};

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const payload = formData.get("data");
    if (!payload || typeof payload !== "string") {
      return apiError("Invalid event data.", 400);
    }

    const parsed = reportingEventSchema.safeParse(JSON.parse(payload));
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const d = parsed.data;
    const startDate = new Date(d.startDate);

    const access = assertClubEventCreateAccess(session!);
    if (!access.ok) {
      return apiError(access.error, access.status);
    }

    const clubId = isClubUser(session!.user.role)
      ? await resolveReportingClubId(session!)
      : await resolveReportingClubId(session!, d.clubId);

    if (!clubId) {
      return apiError("A club must be selected to add an event.", 400);
    }

    const minutesFile = formData.get("minutes") as File | null;
    const imageFile = formData.get("image") as File | null;

    let minutesPdfUrl: string | undefined;
    let bannerUrl: string | undefined;

    if (minutesFile?.size) {
      minutesPdfUrl = await saveUpload(minutesFile, "event-minutes", 2 * 1024 * 1024);
    }
    if (imageFile?.size) {
      bannerUrl = await saveUpload(imageFile, "event-banners", 2 * 1024 * 1024);
    }

    const event = await prisma.event.create({
      data: {
        title: d.title,
        description: d.description,
        startDate,
        endDate: d.endDate ? new Date(d.endDate) : undefined,
        location: d.location,
        hostedBy: d.hostedBy,
        collaborations: d.collaborations,
        type: d.type,
        status: deriveEventStatus({
          startDate,
          endDate: d.endDate ? new Date(d.endDate) : null,
        }),
        clubId,
        attendees: d.attendees ?? 0,
        minutesPdfUrl,
        bannerUrl,
        forDistrictNewsletter: d.forDistrictNewsletter === true,
      },
      include: eventInclude,
    });

    await logActivity({
      type: "EVENT_CREATED",
      title: `Event "${event.title}" added for reporting`,
      clubId: event.clubId ?? undefined,
      userId: session!.user.id,
    });

    if (event.clubId) {
      await syncEventsReportIfClubHasEvents(prisma, {
        clubId: event.clubId,
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
        submittedByUserId: session!.user.id,
      });
    }

    const { revalidatePublicEvents } = await import("@/lib/revalidate-public-site");
    revalidatePublicEvents();

    return NextResponse.json(serializeEvent(event), { status: 201 });
  } catch (e) {
    return handleRouteError(e, "Failed to create event.");
  }
}
