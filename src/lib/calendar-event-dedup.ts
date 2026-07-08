/** Normalize title + day so DB and Google Calendar events de-duplicate reliably. */
export function calendarEventDedupKey(title: string, startDate: Date) {
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const day = startDate.toISOString().slice(0, 10);
  return `${normalizedTitle}|${day}`;
}
