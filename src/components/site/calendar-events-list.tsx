import Link from "next/link";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import type { getPublicCalendarEvents } from "@/lib/public-site-data";

type CalendarEvent = Awaited<ReturnType<typeof getPublicCalendarEvents>>[number];

function formatMonthKey(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function typeLabel(type: string) {
  if (type === "INSTALLATION") return "Club Installation";
  if (type === "DISTRICT") return "District Event";
  return type;
}

export function CalendarEventsList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-center text-zinc-500">No district events or installations scheduled yet.</p>
    );
  }

  const byMonth = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = formatMonthKey(event.startDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(byMonth).map(([month, monthEvents]) => (
        <div key={month} className="border-b border-zinc-200 pb-8">
          <h2 className="font-display text-2xl font-bold text-accent">{month}</h2>
          <ul className="mt-6 space-y-4">
            {monthEvents.map((event) => (
              <li
                key={event.id}
                className="depth-card depth-card-interactive flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                      {typeLabel(event.type)}
                    </span>
                    {event.club && (
                      <span className="text-xs text-zinc-500">
                        {event.club.name}
                        {event.club.zone ? ` · ${event.club.zone}` : ""}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="mt-1 block font-semibold text-zinc-900 hover:text-accent"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatDate(event.startDate)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <EventRegistrationButton event={event} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
