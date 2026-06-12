import { getEventEndDate, publicEventDescription } from "@/lib/event-display";

export type GoogleCalendarEventInput = {
  title: string;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  description?: string | null;
  meetUrl?: string | null;
};

function toGoogleUtc(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

export function buildGoogleCalendarUrl(event: GoogleCalendarEventInput): string {
  const end = event.endDate ?? getEventEndDate(event);
  const details: string[] = [];

  const blurb = publicEventDescription(event.description);
  if (blurb) details.push(blurb);
  if (event.meetUrl) details.push(`Google Meet: ${event.meetUrl}`);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleUtc(event.startDate)}/${toGoogleUtc(end)}`,
  });

  if (event.location) params.set("location", event.location);
  if (details.length > 0) params.set("details", details.join("\n\n"));

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
