import { EventDetail } from "@/components/events/event-detail";

export const metadata = { title: "Event Details" };

interface PageProps { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EventDetail eventId={id} />;
}
