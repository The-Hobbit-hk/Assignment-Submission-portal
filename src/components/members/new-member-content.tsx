"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberForm } from "@/components/members/member-form";
import { useCreateMember } from "@/hooks/use-members";
import { useClub, useClubsList } from "@/hooks/use-clubs";
import { isClubUser } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export function NewMemberContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const clubUser = isClubUser(role);
  const ownClubId = clubUser ? session?.user?.clubId ?? undefined : undefined;
  const requestedClubId = searchParams.get("clubId") ?? undefined;
  const lockClubId = ownClubId ?? requestedClubId;

  const createMutation = useCreateMember();
  const { data: clubsData } = useClubsList({ limit: 100 }, { enabled: !clubUser });
  const { data: ownClub } = useClub(lockClubId ?? "");

  const clubs =
    lockClubId && (clubUser || ownClub)
      ? [{ id: lockClubId, name: ownClub?.name ?? "Selected club" }]
      : (clubsData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? []);

  const backHref = lockClubId
    ? `/dashboard/members?clubId=${lockClubId}`
    : "/dashboard/members";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Member</h1>
          <p className="text-muted-foreground">
            {clubUser
              ? "Register a new member to your club."
              : "Register a new member to a club."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm
            clubs={clubs}
            lockClubId={lockClubId}
            submitLabel="Create Member"
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
              router.push(backHref);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
