import { CouncilGroupNav } from "@/components/site/council-group-nav";
import { PageHero } from "@/components/site/page-hero";

export default function CouncilPage() {
  return (
    <>
      <PageHero
        title="Council 26-27"
        subtitle="District leadership for Rotaract District 3131 under the REIGN theme, RIY 2026-27"
      />
      <CouncilGroupNav />
    </>
  );
}
