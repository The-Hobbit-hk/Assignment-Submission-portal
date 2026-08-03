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
import { WEEKDAY_LABELS_FULL, WEEKDAY_LABELS_SHORT } from "@/lib/calendar-utils";
import { getEventTypeLabel } from "@/lib/event-types";
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
  forDistrictNewsletter?: boolean;
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
  showDistrictSection?: boolean;
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
  showDistrictSection = true,
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
    <div className="space-y-4">
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
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {([["grid", Grid3X3], ["list", List], ["calendar", CalendarDays]] as const).map(
              ([mode, Icon]) => (
                <Button
                  key={mode}
                  variant={view === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView(mode)}
                  aria-label={`${mode} view`}
                  className="capitalize"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode}</span>
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
          events={ownClubId || !showDistrictSection ? clubEvents : events}
          month={month - 1}
          year={year}
          eventLinkBase={eventLinkBase}
        />
      ) : view === "list" ? (
        <div className="space-y-5">
          {showDistrictSection && (
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
          )}

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
        <div className="space-y-5">
          {showDistrictSection && (
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
          )}

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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/50 px-4 py-3 sm:px-5 sm:py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <Badge variant="outline" className="text-[10px]">
            {count}
          </Badge>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
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
    forDistrictNewsletter?: boolean;
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
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[10px]">
                {getEventTypeLabel(event.type)}
              </Badge>
              {event.forDistrictNewsletter && (
                <Badge className="bg-amber-100 text-[10px] text-amber-900">Newsletter</Badge>
              )}
            </div>
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
    forDistrictNewsletter?: boolean;
  };
  eventLinkBase: string;
}) {
  return (
    <Link
      href={`${eventLinkBase}/${event.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border/40 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3 sm:gap-4">
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
      </div>
      <div className="flex w-fit shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
        {event.forDistrictNewsletter && (
          <Badge className="bg-amber-100 text-amber-900">Newsletter</Badge>
        )}
        <Badge>{event.status}</Badge>
      </div>
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
        <div className="table-scroll grid grid-cols-7 gap-0.5 text-center text-xs sm:gap-1">
          {WEEKDAY_LABELS_FULL.map((d, index) => (
            <div key={d} className="py-1.5 font-medium text-muted-foreground sm:py-2">
              <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
              <span className="hidden sm:inline">{d}</span>
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
                  "min-h-12 rounded-md border border-border/30 p-0.5 sm:min-h-16 sm:p-1",
                  dayEvents.length && "border-accent/30 bg-accent/5"
                )}
              >
                <span className="text-[10px] font-medium sm:text-xs">{day}</span>
                {dayEvents.length > 0 && (
                  <span
                    className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-accent sm:hidden"
                    title={`${dayEvents.length} event(s)`}
                  />
                )}
                {dayEvents.slice(0, 2).map((e) => (
                  <Link
                    key={e.id}
                    href={`${eventLinkBase}/${e.id}`}
                    className="mt-0.5 hidden truncate text-[10px] text-accent hover:underline sm:block"
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
