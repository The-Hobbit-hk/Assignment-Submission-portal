import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import {
  getEventPreviewGradient,
  parseCalendarKey,
  publicEventDescription,
  resolveEventBannerUrl,
  displayEventLocation,
} from "@/lib/event-display";
import { getPublicEventById } from "@/lib/public-event";
import { formatIstDateTimeRange } from "@/lib/timezone";
import { cn } from "@/lib/utils";

// Cache each event page; registration open/closed state is computed client-side.
export const revalidate = 300;

// Opt in to ISR: pages are rendered on first request, then cached for `revalidate`.
export function generateStaticParams() {
  return [];
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const event = await getPublicEventById(decoded);

  if (!event) notFound();

  // Old calendar links used Google UIDs — send them to the canonical DB id.
  if (decoded !== event.id && decoded.toLowerCase().startsWith("gcal-")) {
    redirect(`/events/${event.id}`);
  }

  const seed = parseCalendarKey(event.description) ?? event.id;
  const previewUrl =
    event.gallery[0]?.url ?? resolveEventBannerUrl(event.bannerUrl, seed);
  const gradient = getEventPreviewGradient(seed);
  const blurb = publicEventDescription(event.description);
  const location = displayEventLocation(event.location);

  return (
    <>
      <section className="relative border-b border-zinc-200">
        <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden sm:min-h-[280px]">
          <Image
            src={previewUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-70", gradient)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-site-header lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                District 3131
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-4xl space-y-8 px-4 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3 text-sm text-zinc-600">
              <p className="flex items-center gap-2 text-base text-zinc-800">
                <CalendarDays className="h-5 w-5 text-accent" />
                {formatIstDateTimeRange(event.startDate, event.endDate)}
              </p>
              {location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  {location}
                </p>
              )}
              {event.club && (
                <p className="text-zinc-500">
                  {event.club.name}
                  {event.club.zone ? ` · ${event.club.zone}` : ""}
                  {event.club.city ? ` · ${event.club.city}` : ""}
                </p>
              )}
            </div>
            <EventRegistrationButton event={event} />
          </div>

          {blurb && <p className="leading-relaxed text-zinc-700">{blurb}</p>}

          {event.gallery.length > 1 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {event.gallery.slice(1).map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
