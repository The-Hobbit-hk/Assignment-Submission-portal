import {
  CouncilHierarchyIntro,
  CouncilHierarchyView,
} from "@/components/site/council-hierarchy-view";

export default function CouncilPage() {
  return (
    <>
      <CouncilHierarchyIntro
        title="District Executive Council 2026-27"
        subtitle="District leadership for Rotaract District 3131 — organised by role, from the District Rotaract Representative through core teams, zonal leads, and portfolio directors."
      />
      <CouncilHierarchyView />
    </>
  );
}
