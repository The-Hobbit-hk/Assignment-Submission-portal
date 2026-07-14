import Image from "next/image";
"use client";

import Link from "next/link";
import { Building2, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClubStatusBadge } from "@/components/clubs/club-status-badge";
import type { ClubListItem } from "@/types/club";

interface ClubsGridProps {
  clubs: ClubListItem[];
  isLoading?: boolean;
}

export function ClubsGrid({ clubs, isLoading }: ClubsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 py-12 text-center text-muted-foreground">
        No clubs found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clubs.map((club) => (
        <Link key={club.id} href={`/dashboard/clubs/${club.id}`}>
          <Card className="h-full transition-colors hover:border-accent/40 hover:bg-muted">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/15 text-accent">
                  {club.logo ? (
                    <Image
                      src={club.logo}
                      alt={`${club.name} logo`}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{club.name}</CardTitle>
                  {club.city && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {club.city}
                      {club.zone && ` · ${club.zone}`}
                    </p>
                  )}
                </div>
              </div>
              <ClubStatusBadge status={club.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-accent" />
                  {club.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-accent" />
                  {club.eventCount} events
                </span>
              </div>
              {club.president && (
                <p className="text-xs text-muted-foreground">
                  President: {club.president.name ?? club.president.email}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
