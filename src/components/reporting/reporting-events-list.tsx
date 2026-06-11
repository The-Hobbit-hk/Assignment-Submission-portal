"use client";

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EventRow = {
  id: string;
  title: string;
  startDate: string;
  location: string | null;
  type: string;
  status: string;
};

interface ReportingEventsListProps {
  events: EventRow[];
  emptyMessage: string;
  linkEvents?: boolean;
}

export function ReportingEventsList({
  events,
  emptyMessage,
  linkEvents = true,
}: ReportingEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
      <Table className="ref-table">
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                {linkEvents ? (
                  <Link href={`/dashboard/events/${event.id}`} className="hover:text-accent">
                    {event.title}
                  </Link>
                ) : (
                  event.title
                )}
              </TableCell>
              <TableCell>
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {event.location ? (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {event.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{event.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ReportingEventsListCompact({ events }: { events: EventRow[] }) {
  if (events.length === 0) return null;

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex items-start gap-3 rounded-lg border border-border/40 bg-black/20 px-3 py-2.5 text-sm"
        >
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="font-medium">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.startDate).toLocaleDateString()} · {event.type}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
