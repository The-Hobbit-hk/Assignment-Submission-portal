"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { CitationStatusBadge } from "@/components/citations/citation-status-badge";
import type { SerializedCitationAssignment } from "@/lib/citations-shared";
import { cn } from "@/lib/utils";

interface CitationAssignmentCardProps {
  assignment: SerializedCitationAssignment;
  href?: string;
  showClub?: boolean;
  className?: string;
}

export function CitationAssignmentCard({
  assignment,
  href,
  showClub = false,
  className,
}: CitationAssignmentCardProps) {
  const content = (
    <div
      className={cn(
        "depth-card-interactive flex items-start justify-between gap-3 rounded-xl border border-border/40 p-4",
        href && "group cursor-pointer",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground group-hover:text-accent">
            {assignment.definition.title}
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
      {href && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
