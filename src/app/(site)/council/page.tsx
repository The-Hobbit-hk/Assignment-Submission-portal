import {
  CouncilHierarchyIntro,
  CouncilHierarchyView,
} from "@/components/site/council-hierarchy-view";

export default function CouncilPage() {
  return (
    <>
      <CouncilHierarchyIntro
        title="Council 26-27"
        subtitle="District leadership for Rotaract District 3131 — organised by role, from the District Rotaract Representative through core teams, zonal leads, and portfolio directors."
      />
      <CouncilHierarchyView />
    </>
  );
}
