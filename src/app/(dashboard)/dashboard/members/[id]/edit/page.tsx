"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberForm } from "@/components/members/member-form";
import { useMember, useUpdateMember } from "@/hooks/use-members";
import { useClubsList } from "@/hooks/use-clubs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: member, isLoading } = useMember(id);
  const updateMutation = useUpdateMember(id);
  const { data: clubsData } = useClubsList();
  const clubs = clubsData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];

  if (isLoading) {
    return <Skeleton className="mx-auto h-96 max-w-2xl" />;
  }

  if (!member) {
    return <div className="text-center text-destructive">Member not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/members/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Member</h1>
          <p className="text-muted-foreground">
            {member.firstName} {member.lastName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Information</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm
            clubs={clubs}
            initialData={member}
            submitLabel="Save Changes"
            onSubmit={async (data) => {
              await updateMutation.mutateAsync(data);
              router.push(`/dashboard/members/${id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
