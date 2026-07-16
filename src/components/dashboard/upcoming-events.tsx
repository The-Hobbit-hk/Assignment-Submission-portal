import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UpcomingEvent } from "@/types/dashboard";
import { getEventTypeLabel } from "@/lib/event-types";

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
        <Link
          href="/dashboard/events"
          className="text-xs text-accent hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No upcoming events
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/15 text-accent">
                <span className="text-xs font-bold leading-none">
                  {new Date(event.startDate).getDate()}
                </span>
                <span className="text-[10px] uppercase">
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {event.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {event.clubName && <span>{event.clubName}</span>}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="mt-1.5 text-[10px]">
                  {getEventTypeLabel(event.type)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
