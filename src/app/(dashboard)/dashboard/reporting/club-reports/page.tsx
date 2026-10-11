import { Suspense } from "react";
import { ClubReportsView } from "@/components/reporting/club-reports-view";

export const metadata = { title: "Club Reports" };

export default function ClubReportsPage() {
  return (
    <Suspense>
      <ClubReportsView />
    </Suspense>
  );
}
