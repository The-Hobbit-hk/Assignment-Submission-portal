export const dynamic = "force-dynamic";

import { ClubsByZone } from "@/components/site/clubs-by-zone";
import { PageHero } from "@/components/site/page-hero";
import { getPublicClubsByZone } from "@/lib/public-site-data";

export default async function ClubsPage() {
  const zones = await getPublicClubsByZone();

  return (
    <>
      <PageHero
        title="Rotaract Clubs"
        subtitle="100+ clubs across Pune and Raigad — organised by zone"
      />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <ClubsByZone zones={zones} />
        </div>
      </section>
    </>
  );
}
