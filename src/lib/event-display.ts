export function parseCalendarKey(description: string | null | undefined): string | null {
  if (!description) return null;
  const match = description.match(/calendar-key:([^\s]+)/);
  return match?.[1] ?? null;
}

/** Public-facing description (hides internal calendar-key metadata). */
export function publicEventDescription(description: string | null | undefined): string | null {
  if (!description) return null;
  const cleaned = description.replace(/calendar-key:[^\s]+/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function getEventEndDate(event: {
  startDate: Date;
  endDate?: Date | null;
}): Date {
  if (event.endDate) return event.endDate;
  const end = new Date(event.startDate);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function eventHasEnded(
  event: {
    status: string;
    startDate: Date;
    endDate?: Date | null;
  },
  now: Date = new Date()
): boolean {
  if (event.status === "COMPLETED") return true;
  return now > getEventEndDate(event);
}

export function eventIsOngoing(
  event: {
    status: string;
    startDate: Date;
    endDate?: Date | null;
  },
  now: Date = new Date()
): boolean {
  if (event.status === "COMPLETED" || event.status === "CANCELLED") return false;
  return now >= event.startDate && now <= getEventEndDate(event);
}

export type EventLifecycle = "upcoming" | "ongoing" | "completed";

export function getEventLifecycle(
  event: {
    status: string;
    startDate: Date;
    endDate?: Date | null;
  },
  now: Date = new Date()
): EventLifecycle {
  if (eventHasEnded(event, now)) return "completed";
  if (eventIsOngoing(event, now)) return "ongoing";
  return "upcoming";
}

const PREVIEW_GRADIENTS = [
  "from-rose-600 via-accent to-orange-500",
  "from-indigo-700 via-violet-600 to-fuchsia-500",
  "from-sky-600 via-blue-600 to-indigo-600",
  "from-emerald-600 via-teal-600 to-cyan-600",
  "from-amber-500 via-orange-500 to-red-500",
] as const;

const PREVIEW_IMAGES = [
  "/reign-theme-riy-2026-27.png",
  "/home-hero-background.png",
] as const;

export function getEventPreviewGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % PREVIEW_GRADIENTS.length;
  }
  return PREVIEW_GRADIENTS[hash] ?? PREVIEW_GRADIENTS[0];
}

export function getDefaultEventBannerUrl(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % PREVIEW_IMAGES.length;
  }
  return PREVIEW_IMAGES[hash] ?? PREVIEW_IMAGES[0];
}

export function resolveEventBannerUrl(
  bannerUrl: string | null | undefined,
  seed: string
): string {
  return bannerUrl?.trim() || getDefaultEventBannerUrl(seed);
}

/** Drop generic placeholders that aren't real venue info. */
export function displayEventLocation(location: string | null | undefined): string | null {
  if (!location) return null;
  const trimmed = location.trim();
  if (!trimmed) return null;
  if (/^district\s*3131$/i.test(trimmed)) return null;
  if (/^(tba|tbd|to be announced|n\/?a)$/i.test(trimmed)) return null;
  return trimmed;
}

/** Shorten long Google Maps-style addresses for list/card UI. */
export function shortEventLocation(
  location: string | null | undefined,
  max = 72
): string | null {
  const display = displayEventLocation(location);
  if (!display) return null;
  if (display.length <= max) return display;
  const cut = display.slice(0, max);
  const lastComma = cut.lastIndexOf(",");
  if (lastComma > 24) return `${cut.slice(0, lastComma).trim()}…`;
  return `${cut.trim()}…`;
}

/**
 * For installation cards, prefer the club name over the long
 * "Club Installation — Rotaract Club of …" prefix.
 */
export function displayCalendarTitle(title: string, type?: string): string {
  if (type !== "INSTALLATION") return title;
  const parts = title.split(/\s+[—–-]\s+/);
  if (parts.length < 2) return title;
  const clubPart = parts.slice(1).join(" — ").trim();
  return clubPart || title;
}
