"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAY_LABELS_FULL, WEEKDAY_LABELS_SHORT } from "@/lib/calendar-utils";
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

export function CalendarWidget({ events }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, monthLabel, monthShort } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return {
      days,
      monthLabel: currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      monthShort: currentDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      ) {
        const day = d.getDate();
        map.set(day, [...(map.get(day) ?? []), e]);
      }
    });
    return map;
  }, [events, currentDate]);

  const today = new Date();

  const upcomingInMonth = useMemo(() => {
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    return [...events]
      .filter((e) => new Date(e.date).getTime() >= startOfToday)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

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
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={cn(
                              "truncate rounded-md bg-gradient-to-r px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm sm:text-[10px]",
                              eventGradient(ev.type)
                            )}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {upcomingInMonth.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Upcoming in {monthShort}
            </p>
            <ul className="space-y-2">
              {upcomingInMonth.slice(0, 4).map((ev) => (
                <li key={ev.id}>
                  <Link
                    href={`/dashboard/events/${ev.id}`}
                    className="depth-card-interactive flex items-center gap-3 rounded-lg border border-border/40 bg-white/80 px-3 py-2.5"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-sm",
                        eventGradient(ev.type)
                      )}
                    >
                      <span>{new Date(ev.date).getDate()}</span>
                      <span className="text-[8px] font-medium uppercase opacity-90">
                        {new Date(ev.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {ev.type.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
