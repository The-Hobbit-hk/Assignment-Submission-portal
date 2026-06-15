import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { NewMemberContent } from "@/components/members/new-member-content";
import { canManageClubMembers } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Add Member" };

export default async function NewMemberPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canManageClubMembers(role)) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl" />}>
      <NewMemberContent />
    </Suspense>
  );
}
