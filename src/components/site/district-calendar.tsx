"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import { Button } from "@/components/ui/button";
import {
  getEventLifecycle,
  getEventPreviewGradient,
  parseCalendarKey,
  resolveEventBannerUrl,
} from "@/lib/event-display";
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
  bannerUrl?: string | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  registrationUrl: string | null;
  club: { name: string; zone: string | null; city: string | null } | null;
  gallery?: { url: string }[];
};

type FilterType = "ALL" | "DISTRICT" | "INSTALLATION";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

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

function toLifecycleEvent(event: SerializedCalendarEvent) {
  return {
    status: event.status,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : null,
  };
}

function previewUrl(event: SerializedCalendarEvent) {
  const seed = parseCalendarKey(event.description) ?? event.id;
  return event.gallery?.[0]?.url ?? resolveEventBannerUrl(event.bannerUrl, seed);
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function SpotlightCard({ event }: { event: SerializedCalendarEvent }) {
  const seed = parseCalendarKey(event.description) ?? event.id;
  const gradient = getEventPreviewGradient(seed);
  const lifecycle = getEventLifecycle(toLifecycleEvent(event));

  return (
    <article className="group flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md sm:w-[240px]">
      <Link href={`/events/${event.id}`} className="relative block h-24 overflow-hidden">
        <Image
          src={previewUrl(event)}
          alt=""
          fill
          sizes="240px"
          className={cn(
            "object-cover transition duration-300 group-hover:scale-105",
            lifecycle === "completed" && "grayscale-[0.4]"
          )}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t opacity-75", gradient)} />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white",
            typeColor(event.type)
          )}
        >
          {typeLabel(event.type)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-medium text-accent">{formatShortDate(event.startDate)}</p>
        <Link
          href={`/events/${event.id}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 hover:text-accent"
        >
          {event.title}
        </Link>
        <div className="mt-auto pt-2">
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
            className="px-2.5 py-1 text-[10px]"
          />
        </div>
      </div>
    </article>
  );
}

function AgendaRow({ event }: { event: SerializedCalendarEvent }) {
  const lifecycle = getEventLifecycle(toLifecycleEvent(event));
  const d = new Date(event.startDate);

  return (
    <li className="flex gap-3 rounded-lg border border-zinc-100 bg-white p-3 transition hover:border-accent/25 hover:bg-rose-50/30">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center",
          lifecycle === "completed" ? "bg-zinc-100 text-zinc-500" : "bg-accent/10 text-accent"
        )}
      >
        <span className="text-[9px] font-bold uppercase leading-none">
          {d.toLocaleDateString("en-IN", { month: "short" })}
        </span>
        <span className="text-base font-bold leading-none">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white",
              typeColor(event.type)
            )}
          >
            {typeLabel(event.type)}
          </span>
          {event.club && (
            <span className="truncate text-xs text-zinc-500">{event.club.name}</span>
          )}
        </div>
        <Link
          href={`/events/${event.id}`}
          className="mt-1 block truncate font-semibold text-zinc-900 hover:text-accent"
        >
          {event.title}
        </Link>
        {event.location && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {event.location}
          </p>
        )}
      </div>
      <div className="hidden shrink-0 self-center sm:block">
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
          className="px-3 py-1.5 text-[10px]"
        />
      </div>
    </li>
  );
}

export function DistrictCalendar({ events }: { events: SerializedCalendarEvent[] }) {
  const today = new Date();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date | null>(null);

  const filtered = useMemo(
    () =>
      events.filter((e) => filter === "ALL" || e.type === filter),
    [events, filter]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    [filtered]
  );

  const upcoming = useMemo(
    () => sorted.filter((e) => getEventLifecycle(toLifecycleEvent(e)) !== "completed"),
    [sorted]
  );

  const completed = useMemo(
    () => sorted.filter((e) => getEventLifecycle(toLifecycleEvent(e)) === "completed"),
    [sorted]
  );

  const spotlight = upcoming.slice(0, 8);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SerializedCalendarEvent[]>();
    for (const event of filtered) {
      const d = new Date(event.startDate);
      const key = dateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [filtered]);

  const agendaEvents = useMemo(() => {
    if (!selected) return sorted;
    return sorted.filter((e) => sameDay(new Date(e.startDate), selected));
  }, [sorted, selected]);

  const groupedAgenda = useMemo(() => {
    const groups = new Map<string, SerializedCalendarEvent[]>();
    for (const event of agendaEvents) {
      const key = new Date(event.startDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
    }
    return [...groups.entries()];
  }, [agendaEvents]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const counts = useMemo(
    () => ({
      all: events.length,
      district: events.filter((e) => e.type === "DISTRICT").length,
      installation: events.filter((e) => e.type === "INSTALLATION").length,
      upcoming: upcoming.length,
    }),
    [events, upcoming.length]
  );

  function goMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  function goToday() {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(null);
  }

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "ALL", label: "All", count: counts.all },
    { id: "DISTRICT", label: "District", count: counts.district },
    { id: "INSTALLATION", label: "Installations", count: counts.installation },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setSelected(null);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                filter === f.id
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-accent/30"
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-800">{counts.upcoming}</span> upcoming
        </p>
      </div>

      {spotlight.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-zinc-900">Next up</h2>
            <Link href="/events" className="text-sm font-medium text-accent hover:underline">
              All district events →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {spotlight.map((event) => (
              <SpotlightCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
        <div className="depth-card overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2.5">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => goMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-900">{monthLabel}</p>
              <button
                type="button"
                onClick={goToday}
                className="text-[10px] font-medium text-accent hover:underline"
              >
                Today
              </button>
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => goMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/80 text-center text-[10px] font-semibold text-zinc-400">
            {WEEKDAYS.map((day, i) => (
              <div key={`${day}-${i}`} className="py-1.5">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 p-1">
            {grid.map((day) => {
              const inMonth = day.getMonth() === month;
              const isToday = sameDay(day, today);
              const isSelected = selected ? sameDay(day, selected) : false;
              const hasEvents = (eventsByDay.get(dateKey(day)) ?? []).length > 0;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : day)}
                  className={cn(
                    "relative flex h-9 w-full items-center justify-center rounded-md text-xs transition",
                    !inMonth && "text-zinc-300",
                    inMonth && "text-zinc-700 hover:bg-rose-50",
                    isSelected && "bg-accent text-white hover:bg-accent",
                    isToday && !isSelected && "font-bold text-accent"
                  )}
                >
                  {day.getDate()}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className="border-t border-zinc-100 px-3 py-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-zinc-500 hover:text-accent"
              >
                Clear day filter ×
              </button>
            </div>
          )}
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-zinc-900">
              {selected
                ? selected.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Full schedule"}
            </h2>
          </div>

          {groupedAgenda.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center text-sm text-zinc-500">
              No events match this view. Try another filter or date.
            </p>
          ) : (
            <div className="space-y-6">
              {groupedAgenda.map(([monthName, monthEvents]) => (
                <div key={monthName}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {monthName}
                  </h3>
                  <ul className="space-y-2">
                    {monthEvents.map((event) => (
                      <AgendaRow key={event.id} event={event} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {completed.length > 0 && !selected && filter !== "INSTALLATION" && (
            <details className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-600">
                Past events ({completed.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {completed.slice(0, 12).map((event) => (
                  <AgendaRow key={event.id} event={event} />
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>
    </div>
  );
}
