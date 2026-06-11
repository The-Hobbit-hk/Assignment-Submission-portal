import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/site/content-page";
import { CouncilRosterList } from "@/components/site/council-roster-list";
import {
  getCouncilByGroup,
  type CouncilGroupSlug,
} from "@/lib/council-roster-data";
import { COUNCIL_PAGES } from "@/lib/site-content";

export function generateStaticParams() {
  return Object.keys(COUNCIL_PAGES).map((slug) => ({ slug }));
}

export default async function CouncilSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = COUNCIL_PAGES[slug];
  if (!content) notFound();

  const members = getCouncilByGroup(slug as CouncilGroupSlug);

  return (
    <>
      <ContentPageView content={content} />
      <CouncilRosterList members={members} sectionTitle={content.title} />
    </>
  );
}
