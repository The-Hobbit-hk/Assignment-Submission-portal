import { PageHero } from "@/components/site/page-hero";
import { ResourcesExplorer } from "@/components/site/resources-explorer";

export default function ResourcesPage() {
  return (
    <>
      <PageHero title="Useful Resources" subtitle="Official district documents and references" />
      <ResourcesExplorer />
    </>
  );
}
