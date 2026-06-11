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
  const state = getRegistrationState(event);
  const label = registrationLabel(state);

  if (!label) {
    return null;
  }

  const base = cn(
    "inline-flex rounded-full px-4 py-2 text-xs font-semibold transition",
    className
  );

  if (state === "open") {
    return (
      <Link
        href={`/login?callbackUrl=/dashboard/events/${event.id}`}
        className={cn(base, "bg-accent text-white hover:bg-accent/90")}
      >
        {label}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        base,
        state === "coming_soon"
          ? "border border-amber-300 bg-amber-50 text-amber-800"
          : "border border-zinc-200 bg-zinc-100 text-zinc-500"
      )}
    >
      {label}
    </span>
  );
}
