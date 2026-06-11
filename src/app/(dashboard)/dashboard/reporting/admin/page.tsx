import { AdminReportingForm } from "@/components/reporting/admin-reporting-form";
import { ReportingWindowBlock } from "@/components/reporting/reporting-window-block";

export const metadata = {
  title: "Administration Reporting",
};

export default function AdminReportingPage() {
  return (
    <ReportingWindowBlock>
      <AdminReportingForm />
    </ReportingWindowBlock>
  );
}
