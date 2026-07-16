"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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
import { ReportingSubmittedDialog } from "@/components/reporting/reporting-submitted-dialog";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";
import { YesNoSelect } from "@/components/reporting/yes-no-select";
import { getActiveReportPeriod, getReportingPeriodLabel } from "@/lib/reporting";
import {
  uploadAdminReportFile,
  useAdminReport,
  useSaveAdminReport,
} from "@/hooks/use-reporting";
import { useReportingWindow } from "@/hooks/use-reporting-window";
import { useSession } from "next-auth/react";
import { isClubUser } from "@/lib/roles";
import { notifyValidation, formErrorMessage } from "@/lib/toast";

export function AdminReportingForm() {
  const { month, year } = getActiveReportPeriod();

  const { data: session } = useSession();
  const clubUser = isClubUser(session?.user?.role ?? "MEMBER");
  const { data: window } = useReportingWindow(month, year);
  const { data, isLoading, refetch } = useAdminReport({ month, year });
  const save = useSaveAdminReport();
  const reportingClosed = clubUser && window && !window.open;

  const [newMembers, setNewMembers] = useState("");
  const [resolutionPassed, setResolutionPassed] = useState("");
  const [resolutionPassDate, setResolutionPassDate] = useState("");
  const [districtDuesPaid, setDistrictDuesPaid] = useState("");
  const [duesMembersCount, setDuesMembersCount] = useState("");
  const [duesAmount, setDuesAmount] = useState("");
  const [resolutionFileUrl, setResolutionFileUrl] = useState<string | null>(null);
  const [districtDuesFileUrl, setDistrictDuesFileUrl] = useState<string | null>(null);
  const [bylawsPassed, setBylawsPassed] = useState("");
  const [bylawsFileUrl, setBylawsFileUrl] = useState<string | null>(null);
  const [bylawsPassDate, setBylawsPassDate] = useState("");
  const [hostClub, setHostClub] = useState("");
  const [districtEventAttendance, setDistrictEventAttendance] = useState("");
  const [newsletterEvent, setNewsletterEvent] = useState("");
  const [formError, setFormError] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const periodLabel = getReportingPeriodLabel(month, year);
  const isSubmitted = data?.status === "SUBMITTED";

  useEffect(() => {
    if (isSubmitted) {
      setSuccessDialogOpen(true);
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (data) {
      setNewMembers(data.newMembers != null ? String(data.newMembers) : "");
      setResolutionPassed(data.resolutionPassed ?? "");
      setResolutionPassDate(
        data.resolutionPassDate
          ? new Date(data.resolutionPassDate).toISOString().slice(0, 10)
          : ""
      );
      setDistrictDuesPaid(data.districtDuesPaid ?? "");
      setDuesMembersCount(
        data.districtDuesMembersCount != null ? String(data.districtDuesMembersCount) : ""
      );
      setDuesAmount(data.districtDuesAmount != null ? String(data.districtDuesAmount) : "");
      setResolutionFileUrl(data.resolutionFileUrl ?? null);
      setDistrictDuesFileUrl(data.districtDuesFileUrl ?? null);
      setBylawsPassed(data.bylawsPassed ?? "");
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
    if (value !== "yes") {
      setResolutionFileUrl(null);
      setResolutionPassDate("");
    }
  };

  const handleDistrictDuesChange = (value: string) => {
    setDistrictDuesPaid(value);
    if (value !== "yes") {
      setDistrictDuesFileUrl(null);
      setDuesMembersCount("");
      setDuesAmount("");
    }
  };

  const handleBylawsChange = (value: string) => {
    setBylawsPassed(value);
    if (value !== "yes") {
      setBylawsFileUrl(null);
      setBylawsPassDate("");
    }
  };

  const handleSubmit = async () => {
    setFormError("");

    if (resolutionPassed === "yes" && !resolutionFileUrl) {
      setFormError(notifyValidation("Please upload proof of resolution passed."));
      return;
    }
    if (districtDuesPaid === "yes" && !districtDuesFileUrl) {
      setFormError(notifyValidation("Please upload proof of district dues payment."));
      return;
    }

    try {
      await save.mutateAsync({
        month,
        year,
        newMembers: newMembers ? parseInt(newMembers, 10) : undefined,
        resolutionPassed,
        resolutionFileUrl: resolutionPassed === "yes" ? resolutionFileUrl : null,
        resolutionPassDate:
          resolutionPassed === "yes" && resolutionPassDate
            ? new Date(resolutionPassDate).toISOString()
            : null,
        districtDuesPaid,
        districtDuesFileUrl: districtDuesPaid === "yes" ? districtDuesFileUrl : null,
        districtDuesMembersCount:
          districtDuesPaid === "yes" && duesMembersCount
            ? parseInt(duesMembersCount, 10)
            : null,
        districtDuesAmount:
          districtDuesPaid === "yes" && duesAmount ? parseInt(duesAmount, 10) : null,
        bylawsPassed,
        bylawsFileUrl: bylawsPassed === "yes" ? bylawsFileUrl : null,
        bylawsPassDate:
          bylawsPassed === "yes" && bylawsPassDate
            ? new Date(bylawsPassDate).toISOString()
            : null,
        hostClub,
        districtEventAttendance,
        newsletterEvent,
        submit: true,
      });
      await refetch();
      setSuccessDialogOpen(true);
    } catch (err) {
      setFormError(formErrorMessage(err, "Failed to submit admin report."));
    }
  };

  if (isLoading) return <Skeleton className="h-96 max-w-3xl" />;

  return (
    <ReportingFormLayout
      title="Administration Reporting"
      subtitle={`Club Administration — Monthly Reporting for ${periodLabel}`}
      banner={<ReportingWindowBanner month={month} year={year} />}
    >
      <ReportingSubmittedDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        title="Admin report submitted"
        description={`Your administration report for ${periodLabel} has been submitted successfully. You can still complete Events Reporting from Monthly Reporting.`}
      />

      <Button variant="ghost" size="sm" className="-mt-2 mb-2 w-fit px-0 text-muted-foreground" asChild>
        <Link href="/dashboard/reporting">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Monthly Reporting
        </Link>
      </Button>

      {isSubmitted ? (
        <div className="depth-card rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Admin report submitted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your administration report for {periodLabel} is on record.
          </p>
          <Button
            className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setSuccessDialogOpen(true)}
          >
            View confirmation
          </Button>
        </div>
      ) : (
        <>
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
          {resolutionPassed === "yes" && (
            <ReportingFieldRow label="Date of passing :">
              <Input
                type="date"
                value={resolutionPassDate}
                onChange={(e) => setResolutionPassDate(e.target.value)}
                className="border-border/60 bg-transparent"
                disabled={reportingClosed}
              />
            </ReportingFieldRow>
          )}
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
          {districtDuesPaid === "yes" && (
            <>
              <ReportingFieldRow label="Dues paid for (no. of members) :">
                <Input
                  type="number"
                  min={0}
                  value={duesMembersCount}
                  onChange={(e) => setDuesMembersCount(e.target.value)}
                  placeholder="e.g. 25"
                  className="border-border/60 bg-transparent"
                  disabled={reportingClosed}
                />
              </ReportingFieldRow>
              <ReportingFieldRow label="Amount paid (₹) :">
                <Input
                  type="number"
                  min={0}
                  value={duesAmount}
                  onChange={(e) => setDuesAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="border-border/60 bg-transparent"
                  disabled={reportingClosed}
                />
              </ReportingFieldRow>
            </>
          )}
        </ReportingSection>

        <ReportingSection title="Club By Laws">
          <ReportingFieldRow label="By-laws passed :">
            <YesNoSelect value={bylawsPassed} onChange={handleBylawsChange} />
          </ReportingFieldRow>

          {bylawsPassed === "yes" && (
            <>
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
            </>
          )}
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
        </>
      )}
    </ReportingFormLayout>
  );
}
