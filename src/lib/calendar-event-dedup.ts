/** Normalize installation titles for matching across DB and Google Calendar. */
export function calendarEventTitleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Normalize title + day so DB and Google Calendar events de-duplicate reliably. */
export function calendarEventDedupKey(title: string, startDate: Date) {
  const day = startDate.toISOString().slice(0, 10);
  return `${calendarEventTitleKey(title)}|${day}`;
}
