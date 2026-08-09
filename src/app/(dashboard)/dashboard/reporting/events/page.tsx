import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";
import { EventsReportingForm } from "@/components/reporting/events-reporting-form";

export const metadata = {
  title: "Events Reporting",
};

export default async function EventsReportingPage() {
  await redirectIfZonalRepBlocked();
  return <EventsReportingForm />;
}
