"use client";

import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubEvents } from "@/hooks/use-clubs";
import { getEventTypeLabel } from "@/lib/event-types";

interface ClubEventsListProps {
  clubId: string;
}

export function ClubEventsList({ clubId }: ClubEventsListProps) {
  const { data: events, isLoading } = useClubEvents(clubId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Club Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!events?.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No events recorded
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 rounded-lg border border-border/40 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {event.location && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {getEventTypeLabel(event.type)}
                  </Badge>
                  <Badge
                    variant={
                      event.status === "COMPLETED" ? "success" : "default"
                    }
                    className="text-[10px]"
                  >
                    {event.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {event.attendees} attendees · {event.serviceHours}h
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
