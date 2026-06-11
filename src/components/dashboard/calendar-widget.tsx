"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/layout/page-heading";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/dashboard";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarWidget({ events }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, monthLabel } = useMemo(() => {
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
      }).toUpperCase(),
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
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="space-y-4">
      <SectionLabel>Calendar</SectionLabel>

      <div className="rounded-xl border border-border/40 bg-card/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 bg-transparent text-xs"
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
          <span className="text-sm font-medium uppercase tracking-wide">{monthLabel}</span>
        </div>

        <div className="grid grid-cols-7 border border-border/40">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-b border-r border-border/40 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const dayEvents = day ? eventsByDay.get(day) ?? [] : [];
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[72px] border-b border-r border-border/40 p-1 last:border-r-0",
                  day === null && "bg-transparent",
                  isCurrentMonth && day === today.getDate() && "bg-accent/5"
                )}
              >
                {day && (
                  <>
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="truncate rounded bg-[#e8a598]/80 px-1 py-0.5 text-[10px] text-[#1a1a1a]"
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
    </div>
  );
}
