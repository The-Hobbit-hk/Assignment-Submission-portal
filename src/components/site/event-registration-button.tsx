import Link from "next/link";
import {
  getRegistrationState,
  registrationLabel,
  type EventRegistrationFields,
} from "@/lib/event-registration";
import { cn } from "@/lib/utils";

export function EventRegistrationButton({
  event,
  className,
}: {
  event: EventRegistrationFields & { id: string };
  className?: string;
}) {
  const isInstallationMeet =
    event.type === "INSTALLATION" && Boolean(event.registrationUrl?.includes("meet.google.com"));
  const state = isInstallationMeet ? "open" : getRegistrationState(event);
  const label = isInstallationMeet ? "Join Google Meet" : registrationLabel(state);

  if (!label) {
    return null;
  }

  const base = cn(
    "inline-flex rounded-full px-4 py-2 text-xs font-semibold transition",
    className
  );

  if (state === "open") {
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
