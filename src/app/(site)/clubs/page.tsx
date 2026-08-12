export const revalidate = 900;

import { ClubsByZone } from "@/components/site/clubs-by-zone";
import { PageHero } from "@/components/site/page-hero";
import {
  DISTRICT_OFFICIAL_CLUB_COUNT,
  DISTRICT_ZONE_META,
} from "@/lib/district-clubs-data";
import { getPublicClubsByZone } from "@/lib/public-site-data";

export default async function ClubsPage() {
  const zones = await getPublicClubsByZone();

  return (
    <>
      <PageHero
        title="Rotaract Clubs"
        subtitle={`${DISTRICT_OFFICIAL_CLUB_COUNT} clubs across Pune and Raigad — organised by zone`}
      />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <ClubsByZone zones={zones} zoneMeta={DISTRICT_ZONE_META} />
        </div>
      </section>
    </>
  );
}
