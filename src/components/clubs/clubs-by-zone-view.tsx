"use client";
import Image from "next/image";

import Link from "next/link";
import { Building2, MapPin, Users } from "lucide-react";
import { ClubStatusBadge } from "@/components/clubs/club-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClubListItem } from "@/types/club";

function groupByZone(clubs: ClubListItem[]): Record<string, ClubListItem[]> {
  const grouped: Record<string, ClubListItem[]> = {};
  for (const club of clubs) {
    const zone = club.zone?.trim() || "Unassigned Zone";
    if (!grouped[zone]) grouped[zone] = [];
    grouped[zone].push(club);
  }
  return Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  );
}

export function ClubsByZoneView({
  clubs,
  isLoading,
}: {
  clubs: ClubListItem[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const zones = groupByZone(clubs);

  return (
    <div className="space-y-10">
      {Object.entries(zones).map(([zone, zoneClubs]) => (
        <section key={zone}>
          <h2 className="text-lg font-semibold text-foreground">{zone}</h2>
          <p className="text-sm text-muted-foreground">{zoneClubs.length} club(s)</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {zoneClubs.map((club) => (
              <Link
                key={club.id}
                href={`/dashboard/clubs/${club.id}`}
                className="rounded-lg border border-border/60 bg-card p-4 transition hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/15 text-accent">
                      {club.logo ? (
                        <Image
                          src={club.logo}
                          alt={`${club.name} logo`}
                          fill
                          sizes="36px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{club.name}</p>
                      {club.president?.name && (
                        <p className="text-xs text-muted-foreground">
                          President: {club.president.name}
                        </p>
                      )}
                      {club.city && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {club.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <ClubStatusBadge status={club.status} />
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {club.memberCount} members
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
