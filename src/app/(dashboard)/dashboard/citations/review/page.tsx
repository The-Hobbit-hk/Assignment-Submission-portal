import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CitationsReviewContent } from "@/components/citations/citations-review-content";
import { canManageCitations } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Citation Review" };

export default async function CitationsReviewPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canManageCitations(role)) {
    redirect("/dashboard");
  }

  return <CitationsReviewContent />;
}
