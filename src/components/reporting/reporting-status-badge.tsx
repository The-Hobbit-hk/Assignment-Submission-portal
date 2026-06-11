import { Badge } from "@/components/ui/badge";
import type { ReportSubmissionLabel } from "@/lib/reporting";

const VARIANTS: Record<
  ReportSubmissionLabel,
  "success" | "warning" | "destructive" | "secondary"
> = {
  SUBMITTED: "success",
  DRAFT: "warning",
  "NOT SUBMITTED": "destructive",
};

export function ReportingStatusBadge({ status }: { status: ReportSubmissionLabel }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
