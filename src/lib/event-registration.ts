export type RegistrationState = "open" | "coming_soon" | "closed" | "none";

export type EventRegistrationFields = {
  type: string;
  status: string;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
};

export function getRegistrationState(
  event: EventRegistrationFields,
  now: Date = new Date()
): RegistrationState {
  if (event.type === "INSTALLATION") {
    return "none";
  }

  if (event.status === "COMPLETED" || event.status === "CANCELLED") {
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
    default:
      return null;
  }
}
