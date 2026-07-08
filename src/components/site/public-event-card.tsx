import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { EventRegistrationButton } from "@/components/site/event-registration-button";
import {
  getEventLifecycle,
  getEventPreviewGradient,
  parseCalendarKey,
  publicEventDescription,
  resolveEventBannerUrl,
} from "@/lib/event-display";
import { cn } from "@/lib/utils";

export type PublicEventCardData = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  status: string;
  bannerUrl: string | null;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  registrationUrl: string | null;
  onSiteRegistration?: boolean;
  type: string;
  gallery?: { url: string }[];
};

function formatEventDate(start: Date, end: Date | null) {
  const startLabel = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!end || end.toDateString() === start.toDateString()) {
    return startLabel;
  }
  const endLabel = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function PublicEventCard({ event }: { event: PublicEventCardData }) {
  const seed = parseCalendarKey(event.description) ?? event.id;
  const previewUrl =
    event.gallery?.[0]?.url ?? resolveEventBannerUrl(event.bannerUrl, seed);
  const gradient = getEventPreviewGradient(seed);
  const lifecycle = getEventLifecycle(event);
  const blurb = publicEventDescription(event.description);

  return (
    <article className="group depth-card depth-card-interactive overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
      <Link href={`/events/${event.id}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={previewUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "object-cover transition duration-500 group-hover:scale-[1.03]",
            lifecycle === "completed" && "grayscale-[0.35] brightness-95"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t opacity-80",
            gradient
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent shadow-sm">
            District
          </span>
          {lifecycle === "ongoing" && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Live now
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h2 className="font-display text-lg font-bold leading-tight text-white drop-shadow-sm lg:text-xl">
            {event.title}
          </h2>
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="space-y-2 text-sm text-zinc-600">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
            {formatEventDate(event.startDate, event.endDate)}
          </p>
          {event.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              {event.location}
            </p>
          )}
        </div>

        {blurb && (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">{blurb}</p>
        )}

        <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <EventRegistrationButton event={event} />
          <Link
            href={`/events/${event.id}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
