import { Suspense } from "react";
import { ReportingYearStatusView } from "@/components/reporting/reporting-year-status-view";

export const metadata = { title: "Year Reporting Status" };

export default function ReportingYearStatusPage() {
  return (
    <Suspense>
      <ReportingYearStatusView />
    </Suspense>
  );
}
