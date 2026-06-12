import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CitationsManageContent } from "@/components/citations/citations-manage-content";
import { canManageCitations } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "DRR Citations" };

export default async function CitationsManagePage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canManageCitations(role)) {
    redirect("/dashboard");
  }

  return <CitationsManageContent />;
}
