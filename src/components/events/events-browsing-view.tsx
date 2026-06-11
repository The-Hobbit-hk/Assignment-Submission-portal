"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, CalendarDays, Grid3X3, List, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AddReportingEventDialog } from "@/components/reporting/add-reporting-event-dialog";
import { useEvents } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list" | "calendar";

export type EventsBrowsingItem = {
  id: string;
  title: string;
  startDate: string;
  location: string | null;
  type: string;
  status: string;
  bannerUrl: string | null;
  registrationCount: number;
  clubId: string | null;
  club: { name: string } | null;
};

interface EventsBrowsingViewProps {
  month: number;
  year: number;
  clubId?: string | null;
  clubName?: string;
  /** When set, club section shows only this club's events (club login view). */
  ownClubId?: string | null;
  addEventDisabled?: boolean;
  showAddEvent?: boolean;
  districtSectionTitle?: string;
  clubSectionTitle?: string;
  eventLinkBase?: string;
}

export function EventsBrowsingView({
  month,
  year,
  clubId,
  clubName = "Your club",
  ownClubId,
  addEventDisabled,
  showAddEvent = true,
  districtSectionTitle = "District Events",
  clubSectionTitle = "Club Events",
  eventLinkBase = "/dashboard/events",
}: EventsBrowsingViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const canAdd = showAddEvent && !!clubId;

  const { data, isLoading } = useEvents({
    search: search || undefined,
    page,
    limit: 50,
    month,
    year,
  });

  const events = (data?.data ?? []) as EventsBrowsingItem[];
  const districtEvents = events.filter((e) => !e.clubId);
  const clubEvents = ownClubId
    ? events.filter((e) => e.clubId === ownClubId)
    : events.filter((e) => e.clubId);

  const addEventButton = canAdd ? (
    <AddReportingEventDialog
      clubId={clubId!}
      clubName={clubName}
      reportingMonth={month}
      reportingYear={year}
      disabled={addEventDisabled}
    />
  ) : null;

  const clubEmptyMessage = ownClubId
    ? "No events for your club this month. Click Add Event to register an activity."
    : "No club events this month.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {([["grid", Grid3X3], ["list", List], ["calendar", CalendarDays]] as const).map(
              ([mode, Icon]) => (
                <Button
                  key={mode}
                  variant={view === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView(mode)}
                >
                  <Icon className="h-4 w-4" />
                  {mode}
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : view === "calendar" ? (
        <CalendarView
          events={ownClubId ? clubEvents : events}
          month={month - 1}
          year={year}
          eventLinkBase={eventLinkBase}
        />
      ) : view === "list" ? (
        <div className="space-y-8">
          <EventsSection title={districtSectionTitle} count={districtEvents.length}>
            {districtEvents.length === 0 ? (
              <EmptySection message="No district events this month." />
            ) : (
              <div className="space-y-2">
                {districtEvents.map((e) => (
                  <EventListRow key={e.id} event={e} eventLinkBase={eventLinkBase} />
                ))}
              </div>
            )}
          </EventsSection>

          <EventsSection
            title={clubSectionTitle}
            count={clubEvents.length}
            action={addEventButton}
          >
            {clubEvents.length === 0 ? (
              <EmptySection message={clubEmptyMessage} />
            ) : (
              <div className="space-y-2">
                {clubEvents.map((e) => (
                  <EventListRow key={e.id} event={e} eventLinkBase={eventLinkBase} />
                ))}
              </div>
            )}
          </EventsSection>
        </div>
      ) : (
        <div className="space-y-8">
          <EventsSection title={districtSectionTitle} count={districtEvents.length}>
            {districtEvents.length === 0 ? (
              <EmptySection message="No district events this month." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {districtEvents.map((e) => (
                  <EventGridCard key={e.id} event={e} eventLinkBase={eventLinkBase} />
                ))}
              </div>
            )}
          </EventsSection>

          <EventsSection
            title={clubSectionTitle}
            count={clubEvents.length}
            action={addEventButton}
          >
            {clubEvents.length === 0 ? (
              <EmptySection message={clubEmptyMessage} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {clubEvents.map((e) => (
                  <EventGridCard key={e.id} event={e} eventLinkBase={eventLinkBase} />
                ))}
              </div>
            )}
          </EventsSection>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && view !== "calendar" && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function EventsSection({
  title,
  count,
  children,
  action,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/50 bg-card/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-black/20 px-5 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <Badge variant="outline" className="text-[10px]">
            {count}
          </Badge>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/50 px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function EventGridCard({
  event,
  eventLinkBase,
}: {
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string | null;
    type: string;
    bannerUrl: string | null;
    registrationCount: number;
    club?: { name: string } | null;
  };
  eventLinkBase: string;
}) {
  return (
    <Link href={`${eventLinkBase}/${event.id}`}>
      <Card className="overflow-hidden transition-colors hover:border-accent/40">
        {event.bannerUrl ? (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.bannerUrl})` }}
          />
        ) : (
          <div className="flex h-32 items-center justify-center bg-accent/10">
            <Calendar className="h-8 w-8 text-accent" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">{event.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {event.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <p>
            {new Date(event.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {event.location && (
            <p className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </p>
          )}
          {event.club?.name && <p className="mt-1">{event.club.name}</p>}
          <p className="mt-1">{event.registrationCount} registered</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventListRow({
  event,
  eventLinkBase,
}: {
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string | null;
    type: string;
    status: string;
    club: { name: string } | null;
  };
  eventLinkBase: string;
}) {
  return (
    <Link
      href={`${eventLinkBase}/${event.id}`}
      className="flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:bg-white/5"
    >
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent">
        <span>{new Date(event.startDate).getDate()}</span>
        <span className="text-[10px] uppercase">
          {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {event.club?.name ?? "District"} · {event.location ?? "TBD"}
        </p>
      </div>
      <Badge>{event.status}</Badge>
    </Link>
  );
}

function CalendarView({
  events,
  month,
  year,
  eventLinkBase,
}: {
  events: { id: string; title: string; startDate: string; type: string }[];
  month: number;
  year: number;
  eventLinkBase: string;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const byDay = new Map<number, typeof events>();
  events.forEach((e) => {
    const d = new Date(e.startDate).getDate();
    byDay.set(d, [...(byDay.get(d) ?? []), e]);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = byDay.get(day) ?? [];
            return (
              <div
                key={day}
                className={cn(
                  "min-h-16 rounded-md border border-border/30 p-1",
                  dayEvents.length && "border-accent/30 bg-accent/5"
                )}
              >
                <span className="text-xs font-medium">{day}</span>
                {dayEvents.slice(0, 2).map((e) => (
                  <Link
                    key={e.id}
                    href={`${eventLinkBase}/${e.id}`}
                    className="mt-0.5 block truncate text-[10px] text-accent hover:underline"
                  >
                    {e.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
