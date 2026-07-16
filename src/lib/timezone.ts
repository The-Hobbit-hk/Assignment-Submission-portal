/** District 3131 operates in Indian Standard Time. */
export const DISTRICT_TIMEZONE = "Asia/Kolkata";

const IST = { timeZone: DISTRICT_TIMEZONE } as const;

export function formatIstDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
) {
  return date.toLocaleDateString("en-IN", { ...options, ...IST });
}

export function formatIstTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }
) {
  return date.toLocaleTimeString("en-IN", { ...options, ...IST });
}

/** e.g. "Saturday, 8 August 2026 · 7:00 pm – 10:00 pm" */
export function formatIstDateTimeRange(start: Date, end?: Date | null) {
  const datePart = formatIstDate(start);
  const startTime = formatIstTime(start);
  if (!end) return `${datePart} · ${startTime}`;
  return `${datePart} · ${startTime} – ${formatIstTime(end)}`;
}

/** Calendar-day key in IST (avoids UTC day shifts near midnight). */
export function istDateKey(date: Date) {
  return date.toLocaleDateString("en-CA", IST); // YYYY-MM-DD
}
