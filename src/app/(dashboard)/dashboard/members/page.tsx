import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { MembersContent } from "@/components/members/members-content";
import { canManageClubMembers } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Members" };

export default async function MembersPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canManageClubMembers(role)) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MembersContent />
    </Suspense>
  );
}
