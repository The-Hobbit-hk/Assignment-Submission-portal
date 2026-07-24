"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Pencil, Phone, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberRoleBadge, MemberStatusBadge } from "@/components/members/member-status-badge";
import { useMember } from "@/hooks/use-members";

interface MemberProfileCardProps {
  memberId: string;
}

export function MemberProfileCard({ memberId }: MemberProfileCardProps) {
  const { data: member, isLoading, error } = useMember(memberId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="text-center text-destructive">Member not found.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-muted-foreground">{member.club.name}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/members/${memberId}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.avatar ?? undefined} />
              <AvatarFallback className="text-2xl">
                {member.firstName[0]}
                {member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <MemberRoleBadge role={member.role} />
              <MemberStatusBadge status={member.status} />
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Trophy className="h-5 w-5" />
              <span className="text-xl font-bold">{member.points} points</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {member.status === "PROSPECTIVE" && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Prospective ID</p>
                <p className="font-mono text-sm font-semibold tracking-wide">
                  {member.riId || "Generating…"}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                {member.email}
              </p>
            </div>
            {member.phone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-accent" />
                  {member.phone}
                </p>
              </div>
            )}
            {member.riId && member.status !== "PROSPECTIVE" && (
              <div>
                <p className="text-xs text-muted-foreground">RI ID</p>
                <p className="text-sm">{member.riId}</p>
              </div>
            )}
            {member.profession && (
              <div>
                <p className="text-xs text-muted-foreground">Profession</p>
                <p className="text-sm">{member.profession}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm">
                {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {member.bio && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="text-sm">{member.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
