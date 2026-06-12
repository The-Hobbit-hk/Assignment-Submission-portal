import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeEvent } from "@/lib/event";
import { assertClubEventCreateAccess, resolveReportingClubId } from "@/lib/reporting-access";
import { reportingEventSchema } from "@/lib/validators/reporting";
import { isClubUser } from "@/lib/roles";
import { logActivity } from "@/lib/activity";
import { saveUpload } from "@/lib/upload";

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
      return NextResponse.json({ error: "Invalid event data." }, { status: 400 });
    }

    const parsed = reportingEventSchema.safeParse(JSON.parse(payload));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event data." }, { status: 400 });
    }

    const d = parsed.data;
    const startDate = new Date(d.startDate);

    const access = assertClubEventCreateAccess(session!);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const clubId = isClubUser(session!.user.role)
      ? await resolveReportingClubId(session!)
      : await resolveReportingClubId(session!, d.clubId);

    if (!clubId) {
      return NextResponse.json(
        { error: "A club must be selected to add an event." },
        { status: 400 }
      );
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
        status: "UPCOMING",
        clubId,
        attendees: d.attendees ?? 0,
        minutesPdfUrl,
        bannerUrl,
      },
      include: eventInclude,
    });

    await logActivity({
      type: "EVENT_CREATED",
      title: `Event "${event.title}" added for reporting`,
      clubId: event.clubId ?? undefined,
      userId: session!.user.id,
    });

    return NextResponse.json(serializeEvent(event), { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
