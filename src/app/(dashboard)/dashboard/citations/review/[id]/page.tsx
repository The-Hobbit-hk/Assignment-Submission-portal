import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CitationReviewDetail } from "@/components/citations/citation-review-detail";
import { canManageCitations } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Review Citation" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CitationReviewDetailPage({ params }: PageProps) {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canManageCitations(role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  return <CitationReviewDetail assignmentId={id} />;
}
