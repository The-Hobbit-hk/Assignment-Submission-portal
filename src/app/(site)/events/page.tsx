export const dynamic = "force-dynamic";

import Link from "next/link";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import { PageHero } from "@/components/site/page-hero";
import { getPublicDistrictEvents } from "@/lib/public-site-data";

export default async function EventsPage() {
  const events = await getPublicDistrictEvents();

  return (
    <>
      <PageHero title="Events" subtitle="District events across RID 3131" />
      <section className="py-16">
        <div className="mx-auto max-w-4xl space-y-6 px-4 lg:px-8">
          {events.length === 0 ? (
            <p className="text-center text-zinc-500">No upcoming district events.</p>
          ) : (
            events.map((event) => (
              <article
                key={event.id}
                className="depth-card depth-card-interactive flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-xl font-semibold text-zinc-900 hover:text-accent"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-2 text-sm text-zinc-600">
                    {event.startDate.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{event.description}</p>
                  )}
                </div>
                <EventRegistrationButton event={event} />
              </article>
            ))
          )}
          <p className="text-sm text-zinc-500">
            Club installations and full calendar on the{" "}
            <Link href="/calendar" className="text-accent hover:underline">
              district calendar
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
