"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventHasEnded } from "@/lib/event-display";
import {
  getRegistrationState,
  registrationLabel,
  type EventRegistrationFields,
} from "@/lib/event-registration";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import { cn } from "@/lib/utils";
import { EventRegistrationDialog } from "@/components/site/event-registration-dialog";

function coerceDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function EventRegistrationButton({
  event,
  className,
}: {
  event: EventRegistrationFields & {
    id: string;
    title?: string;
    location?: string | null;
    description?: string | null;
    onSiteRegistration?: boolean;
  };
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const evalNow = now ?? new Date();
  const startDate = coerceDate(event.startDate);
  const endDate = coerceDate(event.endDate);
  const isInstallation = event.type === "INSTALLATION";
  const installationEnded =
    isInstallation &&
    startDate &&
    eventHasEnded({ status: event.status, startDate, endDate }, evalNow);

  const state = isInstallation
    ? installationEnded
      ? "completed"
      : "open"
    : getRegistrationState(event, evalNow);

  const label = isInstallation
    ? installationEnded
      ? "Completed"
      : "Add to Calendar"
    : registrationLabel(state);

  if (!label) {
    return null;
  }

  const base = cn(
    "inline-flex rounded-full px-4 py-2 text-xs font-semibold transition",
    className
  );

  if (state === "open") {
    if (isInstallation && startDate) {
      const meetUrl = event.registrationUrl?.includes("meet.google.com")
        ? event.registrationUrl
        : null;

      return (
        <a
          href={buildGoogleCalendarUrl({
            title: event.title ?? "Club Installation",
            startDate,
            endDate,
            location: event.location,
            description: event.description,
            meetUrl,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, "depth-btn-accent text-white")}
        >
          {label}
        </a>
      );
    }

    if (event.onSiteRegistration) {
      return (
        <>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={cn(base, "depth-btn-accent text-white")}
          >
            {label}
          </button>
          <EventRegistrationDialog
            eventId={event.id}
            eventTitle={event.title ?? "District Event"}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </>
      );
    }

    if (event.registrationUrl) {
      return (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, "depth-btn-accent text-white")}
        >
          {label}
        </a>
      );
    }

    return (
      <Link
        href={`/login?callbackUrl=/dashboard/events/${event.id}`}
        className={cn(base, "depth-btn-accent text-white")}
      >
        {label}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        base,
        state === "coming_soon" &&
          "border border-amber-300 bg-amber-50 text-amber-800",
        state === "completed" &&
          "border border-emerald-300 bg-emerald-50 text-emerald-800",
        (state === "closed" || state === "none") &&
          "border border-zinc-200 bg-zinc-100 text-zinc-500"
      )}
    >
      {label}
    </span>
  );
}
