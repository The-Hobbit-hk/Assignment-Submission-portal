import Link from "next/link";
import { PublicEventCard, type PublicEventCardData } from "@/components/site/public-event-card";
import { getEventLifecycle } from "@/lib/event-display";

export function PublicEventsList({ events }: { events: PublicEventCardData[] }) {
  const upcoming = events.filter((e) => getEventLifecycle(e) !== "completed");
  const completed = events.filter((e) => getEventLifecycle(e) === "completed");

  if (events.length === 0) {
    return <p className="text-center text-zinc-500">No district events listed yet.</p>;
  }

  return (
    <div className="space-y-12">
      {upcoming.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-zinc-900">Upcoming & ongoing</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Mark your calendar for what&apos;s next across District 3131.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((event) => (
              <PublicEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-zinc-900">Completed</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Events that have already taken place this Rotaract year.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {completed.map((event) => (
              <PublicEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <p className="text-sm text-zinc-500">
        Club installations and the full calendar are on the{" "}
        <Link href="/calendar" className="font-medium text-accent hover:underline">
          district calendar
        </Link>
        .
      </p>
    </div>
  );
}
