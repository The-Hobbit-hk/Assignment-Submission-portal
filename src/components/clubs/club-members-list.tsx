"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberRoleBadge, MemberStatusBadge } from "@/components/members/member-status-badge";
import { useClubMembers } from "@/hooks/use-clubs";

interface ClubMembersListProps {
  clubId: string;
}

export function ClubMembersList({ clubId }: ClubMembersListProps) {
  const { data: members, isLoading } = useClubMembers(clubId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Members ({members?.length ?? 0})
        </CardTitle>
        <Link
          href={`/dashboard/members?clubId=${clubId}`}
          className="text-xs text-accent hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {!members?.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No members yet
          </p>
        ) : (
          members.slice(0, 10).map((member) => (
            <Link
              key={member.id}
              href={`/dashboard/members/${member.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {member.firstName[0]}
                  {member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {member.firstName} {member.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <MemberRoleBadge role={member.role} />
              <MemberStatusBadge status={member.status} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
