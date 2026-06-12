"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { BluebookStatusBadge } from "@/components/bluebook/bluebook-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  uploadCouncilReportProof,
  useMyCouncilTasks,
  useSubmitCouncilReport,
} from "@/hooks/use-council-assignments";
import { reportStatusLabel } from "@/lib/bluebook-labels";
import { getReportingPeriodLabel } from "@/lib/reporting";
import { toast } from "@/lib/toast";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }),
}));

export function MyCouncilTasks() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useMyCouncilTasks(month, year);
  const submitReport = useSubmitCouncilReport(month, year);

  const periodLabel = getReportingPeriodLabel(month, year);
  const stats = data?.stats;
  const report = data?.report;
  const assignments = data?.assignments ?? [];
  const canSubmit = stats?.submissionOpen && assignments.length > 0;
  const alreadySubmitted = report?.status === "SUBMITTED" || report?.status === "APPROVED";

  const submissionLabel = reportStatusLabel(
    report?.status ?? stats?.submissionStatus ?? "DRAFT",
    assignments.length > 0
  );

  const openSubmitDialog = () => {
    setNotes(report?.submissionNotes ?? "");
    setPendingFiles([]);
    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      for (const file of pendingFiles) {
        await uploadCouncilReportProof(month, year, file);
      }
      await submitReport.mutateAsync(notes);
      setSubmitOpen(false);
      setNotes("");
      setPendingFiles([]);
      await refetch();
      toast.success("Blue Book report submitted successfully");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <PageHeading
        title="My Bluebook"
        subtitle={`Your assigned tasks and Blue Book submission for ${periodLabel}.`}
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Period</span>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="depth-card block rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tasks assigned" value={String(stats.totalTasks)} />
          <StatCard label="Possible points" value={String(stats.totalPossiblePoints)} />
          <StatCard label="Points awarded" value={String(stats.totalAwardedPoints)} />
          <StatCard label="Submission status" value={submissionLabel} accent />
        </div>
      )}

      {data?.cycle && (
        <p className="text-sm text-muted-foreground">
          Submission deadline:{" "}
          <strong className="text-foreground">
            {new Date(data.cycle.closesAt).toLocaleString("en-IN")}
          </strong>
          {stats?.submissionClosed && !stats?.testingMode && (
            <span className="ml-2 font-medium text-destructive">· Submission Closed</span>
          )}
          {stats?.testingMode && (
            <span className="ml-2 font-medium text-amber-600">· Testing mode (window open)</span>
          )}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Assigned tasks</h2>
        <div className="table-scroll rounded-lg border border-border/40">
          <Table className="ref-table min-w-[560px]">
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No tasks assigned for this period.
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="font-medium">{task.task?.title ?? "Task"}</div>
                      {task.task?.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {task.task.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{task.task?.maxScore ?? 0}</TableCell>
                    <TableCell>
                      <BluebookStatusBadge status={task.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {report?.proofUrls && report.proofUrls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Submitted documents</h3>
          <ul className="space-y-1">
            {report.proofUrls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View document
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
        <Button
          size="lg"
          className="bg-accent px-8 text-accent-foreground"
          disabled={!canSubmit || alreadySubmitted}
          onClick={openSubmitDialog}
        >
          {alreadySubmitted ? "Blue Book submitted" : "Submit Blue Book"}
        </Button>
        {alreadySubmitted && report?.submittedAt && (
          <p className="text-sm text-green-600">
            Submitted on {new Date(report.submittedAt).toLocaleString("en-IN")}
          </p>
        )}
        {!canSubmit && assignments.length > 0 && !alreadySubmitted && !stats?.testingMode && (
          <p className="text-sm text-muted-foreground">Submission window is closed.</p>
        )}
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Blue Book — {periodLabel}</DialogTitle>
            <DialogDescription>
              Upload your supporting documents (PDF preferred), add a brief summary, then submit.
              Your report will be locked until the District Secretary reopens it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Supporting documents</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition hover:border-accent/40 hover:bg-muted/50"
              >
                <Upload className="h-8 w-8 text-accent" />
                <span>Click to upload PDF, DOCX, or images</span>
                <span className="text-xs">Multiple files allowed</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  setPendingFiles((prev) => [...prev, ...Array.from(files)]);
                  e.target.value = "";
                }}
              />
              {pendingFiles.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {pendingFiles.map((file, i) => (
                    <li key={`${file.name}-${i}`} className="flex items-center gap-2 text-foreground">
                      <FileText className="h-4 w-4 shrink-0 text-accent" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
              {report?.proofUrls && report.proofUrls.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {report.proofUrls.length} file(s) already uploaded for this period.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Summary / remarks</p>
              <Textarea
                placeholder="Summary of work completed, remarks, or additional explanation…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              className="bg-accent text-accent-foreground"
              disabled={
                uploading ||
                submitReport.isPending ||
                (pendingFiles.length === 0 && !(report?.proofUrls?.length ?? 0))
              }
              onClick={() => void handleSubmit()}
            >
              {uploading || submitReport.isPending ? "Submitting…" : "Submit Blue Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="depth-card rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
