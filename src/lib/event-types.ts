/** Human-readable labels for every EventType enum value. */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  // Club avenues
  PROFESSIONAL_DEVELOPMENT: "Professional Development",
  CLUB_SERVICE: "Club Service",
  COMMUNITY_SERVICE: "Community Service",
  INTERNATIONAL_SERVICE: "International Service",
  DEI: "Diversity, Equity & Inclusion (DEI)",
  PUBLIC_IMAGE: "Public Image, Public Relations, Editing",
  ROTARY_RELATIONS: "Rotary Rotaract Relations, Interact Rotaract Relations",
  // District / legacy
  DISTRICT: "District Event",
  INSTALLATION: "Club Installation",
  ISD: "ISD",
  SERVICE: "Service",
  PROFESSIONAL: "Professional",
  SOCIAL: "Social",
  TRAINING: "Training",
};

/** Avenues clubs choose from when adding an event. */
export const CLUB_EVENT_AVENUE_VALUES = [
  "PROFESSIONAL_DEVELOPMENT",
  "CLUB_SERVICE",
  "COMMUNITY_SERVICE",
  "INTERNATIONAL_SERVICE",
  "DEI",
  "PUBLIC_IMAGE",
  "ROTARY_RELATIONS",
] as const;

export const CLUB_EVENT_AVENUES = CLUB_EVENT_AVENUE_VALUES.map((value) => ({
  value,
  label: EVENT_TYPE_LABELS[value],
}));

/** Types district admins can pick (avenues + district-level types). */
export const ADMIN_EVENT_TYPES = [
  ...CLUB_EVENT_AVENUE_VALUES,
  "DISTRICT",
  "INSTALLATION",
].map((value) => ({ value, label: EVENT_TYPE_LABELS[value] }));

export function getEventTypeLabel(type: string | null | undefined): string {
  if (!type) return "";
  return EVENT_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}
