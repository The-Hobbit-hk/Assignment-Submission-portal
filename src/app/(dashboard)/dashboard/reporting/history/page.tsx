import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";
import { ReportingHistoryView } from "@/components/reporting/reporting-history-view";

export const metadata = { title: "Reporting History" };

export default async function ReportingHistoryPage() {
  await redirectIfZonalRepBlocked();
  return <ReportingHistoryView />;
}
