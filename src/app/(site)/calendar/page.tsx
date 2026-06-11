export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarEventsList } from "@/components/site/calendar-events-list";
import { PageHero } from "@/components/site/page-hero";
import { getPublicCalendarEvents } from "@/lib/public-site-data";

export default async function CalendarPage() {
  const events = await getPublicCalendarEvents();

  return (
    <>
      <PageHero
        title="Calendar"
        subtitle="District events and club installations for RIY 2026-27"
      />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <CalendarEventsList events={events} />
          <Link
            href="/resources/district-calendar"
            className="mt-10 inline-block text-sm text-accent hover:underline"
          >
            View district calendar resources →
          </Link>
        </div>
      </section>
    </>
  );
}
