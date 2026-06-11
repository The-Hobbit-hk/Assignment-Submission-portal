"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberForm } from "@/components/members/member-form";
import { useCreateMember } from "@/hooks/use-members";
import { useClubsList } from "@/hooks/use-clubs";

export default function NewMemberPage() {
  const router = useRouter();
  const createMutation = useCreateMember();
  const { data: clubsData } = useClubsList();
  const clubs = clubsData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Member</h1>
          <p className="text-muted-foreground">
            Register a new member to a club.
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
            submitLabel="Create Member"
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
              router.push("/dashboard/members");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
