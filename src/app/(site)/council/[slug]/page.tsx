import { notFound } from "next/navigation";
import {
  CouncilHierarchyIntro,
  CouncilHierarchyView,
} from "@/components/site/council-hierarchy-view";
import type { CouncilGroupSlug } from "@/lib/council-roster-data";
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

  return (
    <>
      <CouncilHierarchyIntro
        title={content.title}
        subtitle={content.paragraphs[0]}
        backHref="/council"
      />
      <CouncilHierarchyView groups={[slug as CouncilGroupSlug]} showNav={false} />
    </>
  );
}
