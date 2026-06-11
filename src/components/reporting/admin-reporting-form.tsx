"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ReportingFieldRow,
  ReportingFormLayout,
  ReportingPanel,
  ReportingSection,
} from "@/components/reporting/reporting-form-layout";
import { ReportingFileUpload } from "@/components/reporting/reporting-file-upload";
import { ManageReportingMemberForm } from "@/components/reporting/manage-reporting-member-form";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { YesNoSelect } from "@/components/reporting/yes-no-select";
import { getReportingPeriodLabel } from "@/lib/reporting";
import {
  uploadAdminReportFile,
  useAdminReport,
  useSaveAdminReport,
} from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { isClubUser } from "@/lib/roles";

export function AdminReportingForm() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const clubId = session?.user?.clubId ?? null;
  const { data: window } = useReportingWindow(month, year);
  const { data, isLoading, refetch } = useAdminReport({ month, year });
  const save = useSaveAdminReport();
  const reportingClosed = clubUser && window && !window.open;

  const [newMembers, setNewMembers] = useState("");
  const [resolutionPassed, setResolutionPassed] = useState("");
  const [districtDuesPaid, setDistrictDuesPaid] = useState("");
  const [resolutionFileUrl, setResolutionFileUrl] = useState<string | null>(null);
  const [districtDuesFileUrl, setDistrictDuesFileUrl] = useState<string | null>(null);
  const [bylawsFileUrl, setBylawsFileUrl] = useState<string | null>(null);
  const [bylawsPassDate, setBylawsPassDate] = useState("");
  const [hostClub, setHostClub] = useState("");
  const [districtEventAttendance, setDistrictEventAttendance] = useState("");
  const [newsletterEvent, setNewsletterEvent] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (data) {
      setNewMembers(data.newMembers != null ? String(data.newMembers) : "");
      setResolutionPassed(data.resolutionPassed ?? "");
      setDistrictDuesPaid(data.districtDuesPaid ?? "");
      setResolutionFileUrl(data.resolutionFileUrl ?? null);
      setDistrictDuesFileUrl(data.districtDuesFileUrl ?? null);
      setBylawsFileUrl(data.bylawsFileUrl ?? null);
      setBylawsPassDate(
        data.bylawsPassDate ? new Date(data.bylawsPassDate).toISOString().slice(0, 10) : ""
      );
      setHostClub(data.hostClub ?? "");
      setDistrictEventAttendance(data.districtEventAttendance ?? "");
      setNewsletterEvent(data.newsletterEvent ?? "");
    }
  }, [data]);

  const handleResolutionChange = (value: string) => {
    setResolutionPassed(value);
    if (value !== "yes") setResolutionFileUrl(null);
  };

  const handleDistrictDuesChange = (value: string) => {
    setDistrictDuesPaid(value);
    if (value !== "yes") setDistrictDuesFileUrl(null);
  };

  const handleSubmit = async () => {
    setFormError("");

    if (resolutionPassed === "yes" && !resolutionFileUrl) {
      setFormError("Please upload proof of resolution passed.");
      return;
    }
    if (districtDuesPaid === "yes" && !districtDuesFileUrl) {
      setFormError("Please upload proof of district dues payment.");
      return;
    }

    await save.mutateAsync({
      month,
      year,
      newMembers: newMembers ? parseInt(newMembers, 10) : undefined,
      resolutionPassed,
      resolutionFileUrl: resolutionPassed === "yes" ? resolutionFileUrl : null,
      districtDuesPaid,
      districtDuesFileUrl: districtDuesPaid === "yes" ? districtDuesFileUrl : null,
      bylawsFileUrl,
      bylawsPassDate: bylawsPassDate ? new Date(bylawsPassDate).toISOString() : null,
      hostClub,
      districtEventAttendance,
      newsletterEvent,
      submit: true,
    });
  };

  if (isLoading) return <Skeleton className="h-96 max-w-3xl" />;

  return (
    <ReportingFormLayout
      title="Administration Reporting"
      subtitle={`Club Administration — Monthly Reporting for ${getReportingPeriodLabel(month, year)}`}
      banner={<ReportingWindowBanner month={month} year={year} />}
    >
      <Button variant="ghost" size="sm" className="-mt-2 mb-2 w-fit px-0 text-muted-foreground" asChild>
        <Link href="/dashboard/reporting">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Monthly Reporting
        </Link>
      </Button>

      <ReportingPanel title="Club Administration">
        <ReportingFieldRow label="New Members :">
          <Input
            type="number"
            min={0}
            value={newMembers}
            onChange={(e) => setNewMembers(e.target.value)}
            className="border-border/60 bg-transparent"
          />
        </ReportingFieldRow>

        <ReportingSection title="Resolution">
          <ReportingFieldRow label="Resolution passed :">
            <div>
              <YesNoSelect value={resolutionPassed} onChange={handleResolutionChange} />
              {resolutionPassed === "yes" && (
                <ReportingFileUpload
                  label="Proof of Resolution Passed (Max 5MB)"
                  fileUrl={resolutionFileUrl}
                  disabled={reportingClosed}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  hint="PDF or image, max 5MB"
                  onUpload={async (file) => {
                    const report = await uploadAdminReportFile(file, "resolution", month, year);
                    setResolutionFileUrl(report.resolutionFileUrl ?? null);
                    await refetch();
                  }}
                  onClear={() => setResolutionFileUrl(null)}
                />
              )}
            </div>
          </ReportingFieldRow>
        </ReportingSection>

        <ReportingSection title="Finance Reporting">
          <ReportingFieldRow label="Has the club paid district dues :">
            <div>
              <YesNoSelect value={districtDuesPaid} onChange={handleDistrictDuesChange} />
              {districtDuesPaid === "yes" && (
                <ReportingFileUpload
                  label="Proof of District Dues Payment (Max 5MB)"
                  fileUrl={districtDuesFileUrl}
                  disabled={reportingClosed}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  hint="PDF or image, max 5MB"
                  onUpload={async (file) => {
                    const report = await uploadAdminReportFile(file, "districtDues", month, year);
                    setDistrictDuesFileUrl(report.districtDuesFileUrl ?? null);
                    await refetch();
                  }}
                  onClear={() => setDistrictDuesFileUrl(null)}
                />
              )}
            </div>
          </ReportingFieldRow>
        </ReportingSection>

        <ReportingSection title="Club By Laws">
          <ReportingFieldRow label="Upload Doc Here (Max 5MB) :">
            <ReportingFileUpload
              label="Club bylaws document"
              fileUrl={bylawsFileUrl}
              disabled={reportingClosed}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              hint="PDF or image, max 5MB"
              onUpload={async (file) => {
                const report = await uploadAdminReportFile(file, "bylaws", month, year);
                setBylawsFileUrl(report.bylawsFileUrl ?? null);
                await refetch();
              }}
              onClear={() => setBylawsFileUrl(null)}
            />
          </ReportingFieldRow>

          <ReportingFieldRow label="Date Pass On :">
            <Input
              type="date"
              value={bylawsPassDate}
              onChange={(e) => setBylawsPassDate(e.target.value)}
              className="border-border/60 bg-transparent"
              disabled={reportingClosed}
            />
          </ReportingFieldRow>
        </ReportingSection>
      </ReportingPanel>

      <ReportingPanel title="District Event Participation">
        <div className="space-y-0">
          <ReportingFieldRow label="Were you the host club :">
            <YesNoSelect value={hostClub} onChange={setHostClub} />
          </ReportingFieldRow>

          <ReportingFieldRow label="Attendance at District Event (details)">
            <Textarea
              value={districtEventAttendance}
              onChange={(e) => setDistrictEventAttendance(e.target.value)}
              rows={4}
              placeholder="Which district events did your club attend? Include participation details."
              className="resize-y border-border/60 bg-transparent"
            />
          </ReportingFieldRow>

          <ReportingFieldRow label="event for district newsletter (optional) :">
            <Input
              value={newsletterEvent}
              onChange={(e) => setNewsletterEvent(e.target.value)}
              placeholder="Highlight one club event for the district newsletter"
              className="border-border/60 bg-transparent"
            />
          </ReportingFieldRow>
        </div>
      </ReportingPanel>

      {clubId && (
        <ReportingPanel title="Manage Members">
          <p className="mb-4 text-sm text-muted-foreground">
            Add new members to your club roster as part of monthly reporting.
          </p>
          <ManageReportingMemberForm clubId={clubId} disabled={reportingClosed} />
        </ReportingPanel>
      )}

      {reportingClosed && (
        <p className="text-sm text-destructive">{window?.message}</p>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button
        onClick={handleSubmit}
        disabled={save.isPending || reportingClosed}
        className="bg-accent px-10 text-accent-foreground hover:bg-accent/90"
      >
        {save.isPending ? "Submitting..." : "Submit"}
      </Button>

      {data?.status === "SUBMITTED" && (
        <p className="text-sm text-green-500">Report submitted for this month.</p>
      )}
    </ReportingFormLayout>
  );
}
