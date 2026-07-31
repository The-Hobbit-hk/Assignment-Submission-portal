"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { CitationStatusBadge } from "@/components/citations/citation-status-badge";
import {
  formatCitationTitle,
  type SerializedCitationAssignment,
} from "@/lib/citations-shared";
import { cn } from "@/lib/utils";

interface CitationAssignmentCardProps {
  assignment: SerializedCitationAssignment;
  href?: string;
  /** Shows chevron + action hint (for expand-in-place lists). */
  interactive?: boolean;
  expanded?: boolean;
  actionHint?: string;
  showClub?: boolean;
  className?: string;
}

export function CitationAssignmentCard({
  assignment,
  href,
  interactive = false,
  expanded = false,
  actionHint,
  showClub = false,
  className,
}: CitationAssignmentCardProps) {
  const clickable = Boolean(href) || interactive;
  const hint =
    actionHint ??
    (interactive
      ? expanded
        ? "Close"
        : assignment.status === "ASSIGNED" ||
            assignment.status === "DRAFT" ||
            assignment.status === "REJECTED"
          ? "Open to submit"
          : "View details"
      : undefined);

  const content = (
    <div
      className={cn(
        "depth-card-interactive flex items-start justify-between gap-3 rounded-xl border border-border/40 p-4",
        clickable && "group cursor-pointer",
        expanded && "border-accent/40 bg-accent/5",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground group-hover:text-accent">
            {formatCitationTitle(assignment.definition.title)}
          </p>
          <CitationStatusBadge status={assignment.status} />
        </div>
        {showClub && (
          <p className="text-sm text-muted-foreground">{assignment.club.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {assignment.periodLabel} · {assignment.definition.points} pts possible
          {assignment.awardedPoints > 0 && (
            <span className="ml-1 font-medium text-accent">
              · {assignment.awardedPoints} awarded
            </span>
          )}
        </p>
        {assignment.dueDate && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Due {new Date(assignment.dueDate).toLocaleDateString("en-IN")}
          </p>
        )}
        {assignment.reviewerComment && assignment.status === "REJECTED" && (
          <p className="text-xs text-destructive">Feedback: {assignment.reviewerComment}</p>
        )}
      </div>
      {clickable && (
        <div className="mt-0.5 flex shrink-0 flex-col items-end gap-1">
          {hint && (
            <span className="text-[11px] font-medium text-accent group-hover:underline">
              {hint}
            </span>
          )}
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform group-hover:text-accent",
              expanded && "rotate-90"
            )}
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
