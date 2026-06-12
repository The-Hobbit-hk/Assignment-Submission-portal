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
    bannerUrl: event.bannerUrl,
    gallery: event.gallery,
    registrationOpensAt: event.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: event.registrationClosesAt?.toISOString() ?? null,
    registrationUrl: event.registrationUrl,
    club: event.club,
  }));

  return (
    <>
      <PageHero
        title="Calendar"
        subtitle="Next district dates, installations, and registrations — at a glance for RIY 2026-27."
        backgroundImage="/home-hero-background.png"
        large
      />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
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
