import { notFound } from "next/navigation";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import { PageHero } from "@/components/site/page-hero";
import { prisma } from "@/lib/prisma";

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      type: { in: ["DISTRICT", "INSTALLATION"] },
    },
    include: {
      club: { select: { name: true, zone: true, city: true } },
    },
  });

  if (!event) notFound();

  return (
    <>
      <PageHero title={event.title} />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-6 px-4 lg:px-8">
          <p className="text-sm text-zinc-600">
            {event.startDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {event.club && (
            <p className="text-sm text-zinc-500">
              {event.club.name}
              {event.club.zone ? ` · ${event.club.zone}` : ""}
              {event.club.city ? ` · ${event.club.city}` : ""}
            </p>
          )}
          {event.description && (
            <p className="leading-relaxed text-zinc-700">{event.description}</p>
          )}
          <EventRegistrationButton event={event} />
        </div>
      </section>
    </>
  );
}
