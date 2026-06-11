import { EventsReportingForm } from "@/components/reporting/events-reporting-form";
import { ReportingWindowBlock } from "@/components/reporting/reporting-window-block";

export const metadata = {
  title: "Events Reporting",
};

export default function EventsReportingPage() {
  return (
    <ReportingWindowBlock>
      <EventsReportingForm />
    </ReportingWindowBlock>
  );
}
