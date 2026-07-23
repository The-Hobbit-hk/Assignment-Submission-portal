"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAY_LABELS_FULL, WEEKDAY_LABELS_SHORT } from "@/lib/calendar-utils";
import { displayCalendarTitle } from "@/lib/event-display";
import { getEventTypeLabel } from "@/lib/event-types";
import { formatIstDate, istDateKey } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/dashboard";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  DISTRICT: "from-accent to-rose-500",
  SERVICE: "from-emerald-500 to-teal-500",
  PROFESSIONAL: "from-indigo-500 to-violet-500",
  SOCIAL: "from-sky-500 to-blue-500",
  TRAINING: "from-amber-500 to-orange-500",
  INSTALLATION: "from-fuchsia-500 to-pink-500",
};

function eventGradient(type: string) {
  return EVENT_TYPE_COLORS[type] ?? "from-accent to-rose-500";
}

function eventHref(event: CalendarEvent) {
  if (event.type === "DISTRICT" || event.type === "INSTALLATION") {
    return `/events/${event.id}`;
  }
  return `/dashboard/events/${event.id}`;
}

export function CalendarWidget({ events }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, monthLabel, monthShort, viewYear, viewMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return {
      days,
      viewYear: year,
      viewMonth: month,
      monthLabel: currentDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      monthShort: currentDate
        .toLocaleDateString("en-IN", { month: "short" })
        .toUpperCase(),
    };
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const event of events) {
      const d = new Date(event.date);
      const key = istDateKey(d);
      const [y, m, day] = key.split("-").map(Number);
      if (y === viewYear && m === viewMonth + 1 && day) {
        map.set(day, [...(map.get(day) ?? []), event]);
      }
    }
    return map;
  }, [events, viewYear, viewMonth]);

  const today = new Date();
  const todayKey = istDateKey(today);

  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  const isFutureMonth =
    currentDate.getFullYear() > today.getFullYear() ||
    (currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() > today.getMonth());

  const eventsInViewMonth = useMemo(() => {
    return [...events]
      .filter((e) => {
        const key = istDateKey(new Date(e.date));
        const [y, m] = key.split("-").map(Number);
        return y === viewYear && m === viewMonth + 1;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, viewYear, viewMonth]);

  /** Remaining / all events for the month currently shown on the grid. */
  const upcomingInViewMonth = useMemo(() => {
    if (isFutureMonth) return eventsInViewMonth;
    if (isCurrentMonth) {
      return eventsInViewMonth.filter(
        (e) => istDateKey(new Date(e.date)) >= todayKey
      );
    }
    // Past month — show the month's events for reference.
    return eventsInViewMonth;
  }, [eventsInViewMonth, isCurrentMonth, isFutureMonth, todayKey]);

  /** When on the current month, also preview next month's schedule. */
  const upcomingNextMonth = useMemo(() => {
    if (!isCurrentMonth) return [];
    const [ty, tm] = todayKey.split("-").map(Number);
    const nextMonthDate = new Date(ty, tm, 1); // month is 1-based from todayKey → next month
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth() + 1;
    return [...events]
      .filter((e) => {
        const key = istDateKey(new Date(e.date));
        const [y, m] = key.split("-").map(Number);
        return y === nextYear && m === nextMonth;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, isCurrentMonth, todayKey]);

  const nextMonthLabel = useMemo(() => {
    const [ty, tm] = todayKey.split("-").map(Number);
    const next = new Date(ty, tm, 1);
    return next.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  }, [todayKey]);

  function renderUpcomingList(list: CalendarEvent[], limit = 6) {
    if (list.length === 0) {
      return (
        <p className="rounded-lg border border-dashed border-border/50 bg-zinc-50/80 px-3 py-4 text-center text-xs text-muted-foreground">
          No events in this month.
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {list.slice(0, limit).map((ev) => {
          const d = new Date(ev.date);
          return (
            <li key={ev.id}>
              <Link
                href={eventHref(ev)}
                className="depth-card-interactive flex items-center gap-3 rounded-lg border border-border/40 bg-white/80 px-3 py-2.5"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-sm",
                    eventGradient(ev.type)
                  )}
                >
                  <span>{formatIstDate(d, { day: "numeric" })}</span>
                  <span className="text-[8px] font-medium uppercase opacity-90">
                    {formatIstDate(d, { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayCalendarTitle(ev.title, ev.type)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {getEventTypeLabel(ev.type)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent shadow-sm">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Calendar
            </p>
            <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-white to-zinc-50/80 shadow-inner">
          <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
            {WEEKDAY_LABELS_FULL.map((day, index) => (
              <div
                key={day}
                className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
              >
                <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayEvents = day ? eventsByDay.get(day) ?? [] : [];
              const isToday = Boolean(day && isCurrentMonth && day === today.getDate());

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[4rem] border-b border-r border-border/30 p-1 last:border-r-0 sm:min-h-[5.25rem] sm:p-1.5",
                    day === null && "bg-zinc-50/50",
                    isToday && "bg-accent/[0.06]"
                  )}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium sm:text-xs",
                            isToday
                              ? "bg-accent font-semibold text-white shadow-md shadow-accent/30"
                              : "text-muted-foreground"
                          )}
                        >
                          {day}
                        </span>
                        {dayEvents.length > 1 && (
                          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                            +{dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const label = displayCalendarTitle(ev.title, ev.type);
                          return (
                            <Link
                              key={ev.id}
                              href={eventHref(ev)}
                              className={cn(
                                "block truncate rounded-md bg-gradient-to-r px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm hover:opacity-90 sm:text-[10px]",
                                eventGradient(ev.type)
                              )}
                              title={ev.title}
                            >
                              {label}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {isCurrentMonth
                ? `Upcoming in ${monthShort}`
                : isFutureMonth
                  ? `Upcoming in ${monthShort}`
                  : `Events in ${monthShort}`}
            </p>
            {renderUpcomingList(upcomingInViewMonth)}
          </div>

          {isCurrentMonth && upcomingNextMonth.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Upcoming next month · {nextMonthLabel}
              </p>
              {renderUpcomingList(upcomingNextMonth)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
