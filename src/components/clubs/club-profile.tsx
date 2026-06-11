"use client";

import Link from "next/link";
import { ArrowLeft, Building2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClubStatusBadge } from "@/components/clubs/club-status-badge";
import { ClubAnalyticsPanel } from "@/components/clubs/club-analytics";
import { ClubPerformancePanel } from "@/components/clubs/club-performance";
import { ClubEventsList } from "@/components/clubs/club-events-list";
import { ClubMembersList } from "@/components/clubs/club-members-list";
import { useClub } from "@/hooks/use-clubs";

interface ClubProfileProps {
  clubId: string;
}

export function ClubProfile({ clubId }: ClubProfileProps) {
  const { data: club, isLoading, error } = useClub(clubId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !club) {
    return <div className="text-center text-destructive">Club not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clubs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{club.name}</h1>
              <ClubStatusBadge status={club.status} />
            </div>
            {(club.city || club.zone) && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[club.city, club.zone].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-accent" />
              President
            </CardTitle>
          </CardHeader>
          <CardContent>
            {club.president ? (
              <div>
                <p className="font-medium">
                  {club.president.name ?? "Unnamed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {club.president.email}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-accent" />
              Secretary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {club.secretary ? (
              <div>
                <p className="font-medium">
                  {club.secretary.name ?? "Unnamed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {club.secretary.email}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {club.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{club.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analytics">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <ClubAnalyticsPanel clubId={clubId} />
        </TabsContent>
        <TabsContent value="members">
          <ClubMembersList clubId={clubId} />
        </TabsContent>
        <TabsContent value="events">
          <ClubEventsList clubId={clubId} />
        </TabsContent>
        <TabsContent value="performance">
          <ClubPerformancePanel clubId={clubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
