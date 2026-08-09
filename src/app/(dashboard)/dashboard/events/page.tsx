import { redirect } from "next/navigation";

export const metadata = { title: "Events" };

/** Club/district users land on Events Reporting. ZRs are redirected by events/layout. */
export default function EventsPage() {
  redirect("/dashboard/reporting/events");
}
