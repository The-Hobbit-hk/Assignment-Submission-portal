import { redirect } from "next/navigation";

export const metadata = { title: "Events" };

export default function EventsPage() {
  redirect("/dashboard/reporting/events");
}
