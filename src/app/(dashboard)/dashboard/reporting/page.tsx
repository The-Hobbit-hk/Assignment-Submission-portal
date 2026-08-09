import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";
import { ReportingHub } from "@/components/reporting/reporting-hub";

export const metadata = {
  title: "Monthly Reporting",
};

export default async function ReportingPage() {
  await redirectIfZonalRepBlocked();
  return <ReportingHub />;
}
