import { eventHasEnded } from "@/lib/event-display";

export type RegistrationState =
  | "open"
  | "coming_soon"
  | "closed"
  | "full"
  | "completed"
  | "none";

function coerceDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export type EventRegistrationFields = {
  type: string;
  status: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  registrationUrl?: string | null;
  onSiteRegistration?: boolean;
  maxAttendees?: number | null;
  registrationCount?: number | null;
};

export function getRegistrationState(
  event: EventRegistrationFields,
  now: Date = new Date()
): RegistrationState {
  if (event.type === "INSTALLATION") {
    return "none";
  }

  const startDate = coerceDate(event.startDate);
  const endDate = coerceDate(event.endDate);

  if (
    startDate &&
    eventHasEnded(
      {
        status: event.status,
        startDate,
        endDate,
      },
      now
    )
  ) {
    return "completed";
  }

  if (event.status === "COMPLETED") {
    return "completed";
  }

  if (event.status === "CANCELLED") {
    return "closed";
  }

  if (!event.registrationOpensAt) {
    return "coming_soon";
  }

  if (now < event.registrationOpensAt) {
    return "coming_soon";
  }

  if (event.registrationClosesAt && now > event.registrationClosesAt) {
    return "closed";
  }

  if (
    event.maxAttendees != null &&
    event.maxAttendees > 0 &&
    (event.registrationCount ?? 0) >= event.maxAttendees
  ) {
    return "full";
  }

  return "open";
}

export function registrationLabel(state: RegistrationState): string | null {
  switch (state) {
    case "open":
      return "Register Now";
    case "coming_soon":
      return "Coming Soon";
    case "closed":
      return "Registrations Closed";
    case "full":
      return "Event Full";
    case "completed":
      return "Completed";
    default:
      return null;
  }
}
