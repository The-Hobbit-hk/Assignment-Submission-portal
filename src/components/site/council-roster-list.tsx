import { CouncilRosterGrid } from "@/components/site/council-roster-grid";
import type { CouncilUserSeed } from "@/lib/council-roster-data";

export function CouncilRosterList({
  members,
  sectionTitle,
}: {
  members: CouncilUserSeed[];
  sectionTitle?: string;
}) {
  return <CouncilRosterGrid members={members} sectionTitle={sectionTitle} />;
}
