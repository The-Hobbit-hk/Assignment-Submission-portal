export const dynamic = "force-dynamic";

import Link from "next/link";
import { DistrictCalendar } from "@/components/site/district-calendar";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import { getPublicCalendarEvents } from "@/lib/public-site-data";

export default async function CalendarPage() {
  const events = await getPublicCalendarEvents();

  const serialized = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    location: event.location,
    type: event.type,
    status: event.status,
    registrationOpensAt: event.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: event.registrationClosesAt?.toISOString() ?? null,
    registrationUrl: event.registrationUrl,
    club: event.club,
  }));

  return (
    <>
      <PageHero
        title="Calendar"
        subtitle="District events and club installations for RIY 2026-27"
      />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <SiteReveal>
            <DistrictCalendar events={serialized} />
          </SiteReveal>
          <Link
            href="/resources/district-calendar"
            className="mt-8 inline-block text-sm text-accent hover:underline"
          >
            View district calendar resources →
          </Link>
        </div>
      </section>
    </>
  );
}
