import { Suspense } from "react";
import { MembersContent } from "@/components/members/members-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MembersContent />
    </Suspense>
  );
}
