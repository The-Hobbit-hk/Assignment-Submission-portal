import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BluebookContent } from "@/components/bluebook/bluebook-content";
import { canViewClubBluebook, canViewMyCouncilBluebook } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Bluebook" };

export default async function BluebookPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canViewClubBluebook(role)) {
    redirect("/dashboard");
  }

  if (canViewMyCouncilBluebook(role)) {
    redirect("/dashboard/bluebook/my-tasks");
  }

  return <BluebookContent />;
}
