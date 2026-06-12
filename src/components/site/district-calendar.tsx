"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SerializedCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  type: string;
  status: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  registrationUrl: string | null;
  club: { name: string; zone: string | null; city: string | null } | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function typeColor(type: string) {
  if (type === "INSTALLATION") return "bg-indigo-500";
  if (type === "DISTRICT") return "bg-accent";
  return "bg-zinc-500";
}

function typeLabel(type: string) {
  if (type === "INSTALLATION") return "Installation";
  if (type === "DISTRICT") return "District";
  return type;
}

export function DistrictCalendar({ events }: { events: SerializedCalendarEvent[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SerializedCalendarEvent[]>();
    for (const event of events) {
      const d = new Date(event.startDate);
      const key = dateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    return eventsByDay.get(dateKey(selected)) ?? [];
  }, [selected, eventsByDay]);

  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events
      .filter((e) => new Date(e.startDate) >= now)
      .slice(0, 5);
  }, [events]);

  function goMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  function goToday() {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(now);
  }

  return (
    <div className="space-y-6">
      <div className="depth-card overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => goMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => goMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="font-display text-xl font-bold text-zinc-900 sm:text-2xl">{monthLabel}</h2>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              District
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Installation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-r border-zinc-200 py-2.5 last:border-r-0">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const inMonth = day.getMonth() === month;
            const isToday = sameDay(day, today);
            const isSelected = selected ? sameDay(day, selected) : false;
            const dayEvents = eventsByDay.get(dateKey(day)) ?? [];
            const visible = dayEvents.slice(0, 2);
            const more = dayEvents.length - visible.length;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "group relative min-h-[4.5rem] border-b border-r border-zinc-100 p-1.5 text-left transition sm:min-h-[6.5rem] sm:p-2",
                  "hover:bg-rose-50/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  !inMonth && "bg-zinc-50/80 text-zinc-400",
                  isSelected && "bg-rose-50 ring-1 ring-inset ring-accent/25"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday && "bg-accent text-white",
                    !isToday && inMonth && "text-zinc-800",
                    !isToday && !inMonth && "text-zinc-400"
                  )}
                >
                  {day.getDate()}
                </span>

                <div className="mt-1 hidden space-y-0.5 sm:block">
                  {visible.map((event) => (
                    <span
                      key={event.id}
                      className={cn(
                        "block truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white",
                        typeColor(event.type)
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </span>
                  ))}
                  {more > 0 && (
                    <span className="block px-1 text-[10px] font-medium text-zinc-500">
                      +{more} more
                    </span>
                  )}
                </div>

                {dayEvents.length > 0 && (
                  <div className="mt-1 flex gap-0.5 sm:hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn("h-1.5 w-1.5 rounded-full", typeColor(event.type))}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="depth-card rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-zinc-900">
            {selected
              ? selected.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Select a day"}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No events on this day.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                        typeColor(event.type)
                      )}
                    >
                      {typeLabel(event.type)}
                    </span>
                    {event.club && (
                      <span className="text-xs text-zinc-500">{event.club.name}</span>
                    )}
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="mt-2 block font-semibold text-zinc-900 hover:text-accent"
                  >
                    {event.title}
                  </Link>
                  {event.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {event.location}
                    </p>
                  )}
                  <div className="mt-3">
                    <EventRegistrationButton
                      event={{
                        id: event.id,
                        type: event.type,
                        status: event.status,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        registrationUrl: event.registrationUrl,
                        registrationOpensAt: event.registrationOpensAt
                          ? new Date(event.registrationOpensAt)
                          : null,
                        registrationClosesAt: event.registrationClosesAt
                          ? new Date(event.registrationClosesAt)
                          : null,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="depth-card rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-zinc-900">Coming up</h3>
          <p className="mt-1 text-sm text-zinc-500">Next five district dates on the calendar</p>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No upcoming events scheduled.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(event.startDate);
                      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      setSelected(d);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl border border-zinc-200 p-3 text-left transition hover:border-accent/30 hover:bg-rose-50/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <span className="text-[10px] font-bold uppercase leading-none">
                        {new Date(event.startDate).toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{event.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {typeLabel(event.type)}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
