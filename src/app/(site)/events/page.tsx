export const revalidate = 600;

import { PublicEventsList } from "@/components/site/public-events-list";
import { PageHero } from "@/components/site/page-hero";
import { getPublicDistrictEvents } from "@/lib/public-site-data";

export default async function EventsPage() {
  const events = await getPublicDistrictEvents();

  return (
    <>
      <PageHero
        title="Events"
        subtitle="District events across RID 3131 — previews, dates, and registration at a glance."
        backgroundImage="/home-hero-background.png"
        large
      />
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <PublicEventsList events={events} />
        </div>
      </section>
    </>
  );
}
