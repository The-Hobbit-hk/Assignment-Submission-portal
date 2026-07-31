"use client";

import { useState } from "react";
import { Award, Loader2, Send } from "lucide-react";
import { CitationAssignmentCard } from "@/components/citations/citation-assignment-card";
import { CitationStatusBadge } from "@/components/citations/citation-status-badge";
import { ReportingFileUpload } from "@/components/reporting/reporting-file-upload";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCitationAssignments,
  useUpdateCitationAssignment,
  uploadCitationProof,
} from "@/hooks/use-citations";
import type { SerializedCitationAssignment } from "@/lib/citations-shared";
import { toast } from "@/lib/toast";

function CitationSubmitPanel({ assignment }: { assignment: SerializedCitationAssignment }) {
  const update = useUpdateCitationAssignment(assignment.id);
  const [notes, setNotes] = useState(assignment.clubNotes ?? "");
  const [proofUrl, setProofUrl] = useState<string | null>(assignment.proofUrl);

  const editable =
    assignment.status === "ASSIGNED" ||
    assignment.status === "DRAFT" ||
    assignment.status === "REJECTED";

  const saveDraft = () => {
    update.mutate(
      { clubNotes: notes, saveDraft: true },
      { onSuccess: () => toast.success("Draft saved") }
    );
  };

  const submit = () => {
    update.mutate(
      { clubNotes: notes, submit: true },
      { onSuccess: () => toast.success("Submitted for DRR review") }
    );
  };

  return (
    <div className="depth-card mt-2 space-y-4 rounded-xl border border-border/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{assignment.definition.title}</p>
        <CitationStatusBadge status={assignment.status} />
      </div>
      <p className="text-xs text-muted-foreground">
        {assignment.periodLabel} · {assignment.definition.points} pts ·{" "}
        {assignment.definition.description ?? "Complete and upload proof."}
      </p>

      {assignment.status === "REJECTED" && assignment.reviewerComment && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          DRR feedback: {assignment.reviewerComment}
        </p>
      )}

      {assignment.status === "APPROVED" ? (
        <p className="text-sm text-green-600">
          Approved — {assignment.awardedPoints} points awarded.
        </p>
      ) : assignment.status === "SUBMITTED" ? (
        <p className="text-sm text-muted-foreground">Awaiting DRR review.</p>
      ) : editable ? (
        <>
          <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Upload a proof document (required).</li>
            <li>Add optional notes, then click Submit for review.</li>
          </ol>
          <ReportingFileUpload
            label="1. Proof document"
            fileUrl={proofUrl}
            onUpload={async (file) => {
              const updated = await uploadCitationProof(assignment.id, file);
              setProofUrl(updated.proofUrl);
            }}
            onClear={() => setProofUrl(null)}
          />
          <Textarea
            placeholder="2. Club notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save draft
            </Button>
            <Button size="sm" onClick={submit} disabled={update.isPending || !proofUrl}>
              <Send className="h-4 w-4" />
              3. Submit for review
            </Button>
          </div>
          {!proofUrl && (
            <p className="text-xs text-muted-foreground">
              Submit stays disabled until a proof file is uploaded.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}

export function CitationsMyContent() {
  const { data: assignments, isLoading } = useCitationAssignments();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = (assignments ?? []).filter((a) => a.status !== "EXPIRED");

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Club portal
            </p>
            <h1 className="font-display text-xl font-bold sm:text-2xl">My Citations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap a citation to open it, upload proof, then submit for DRR approval.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : active.length === 0 ? (
        <div className="depth-card rounded-xl p-10 text-center text-muted-foreground">
          No citations assigned to your club yet.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {active.length} assigned · Select any row below to upload proof and submit.
          </p>
          {active.map((assignment) => {
            const isOpen = expandedId === assignment.id;
            return (
              <div key={assignment.id}>
                <button
                  type="button"
                  className="w-full text-left"
                  aria-expanded={isOpen}
                  onClick={() => setExpandedId(isOpen ? null : assignment.id)}
                >
                  <CitationAssignmentCard
                    assignment={assignment}
                    interactive
                    expanded={isOpen}
                  />
                </button>
                {isOpen && <CitationSubmitPanel assignment={assignment} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
