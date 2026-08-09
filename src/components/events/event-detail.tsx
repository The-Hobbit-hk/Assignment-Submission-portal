"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEvent, useEvent, uploadEventFile } from "@/hooks/use-events";
import { PublicEventRegistrationsPanel } from "@/components/events/public-event-registrations-panel";
import { getEventTypeLabel } from "@/lib/event-types";
import { useQueryClient } from "@tanstack/react-query";

export function EventDetail({ eventId }: { eventId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: event, isLoading } = useEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const bannerRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!event) return <p className="text-destructive">Event not found.</p>;

  async function handleUpload(
    type: "banner" | "minutes" | "gallery",
    ref: React.RefObject<HTMLInputElement | null>
  ) {
    const file = ref.current?.files?.[0];
    if (!file) return;
    await uploadEventFile(eventId, type, file);
    qc.invalidateQueries({ queryKey: ["events", eventId] });
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{event.title}</h1>
          <p className="text-muted-foreground">{event.club?.name ?? "District Event"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${eventId}/edit`}>Edit</Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              if (confirm("Delete?")) {
                deleteMutation.mutate(eventId, {
                  onSuccess: () => router.push("/dashboard/events"),
                });
              }
            }}
            aria-label="Delete event"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {event.bannerUrl && (
        <a
          href={event.bannerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-border/50 bg-muted/40"
        >
          <div className="relative mx-auto flex min-h-[220px] max-h-[min(70vh,32rem)] w-full items-center justify-center sm:min-h-[280px]">
            <Image
              src={event.bannerUrl}
              alt={`${event.title} banner`}
              width={1600}
              height={900}
              unoptimized
              className="max-h-[min(70vh,32rem)] w-full object-contain"
              sizes="(max-width: 1024px) 100vw, 960px"
              priority
            />
          </div>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
            Open full image
          </span>
        </a>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="leading-relaxed text-foreground">
              {event.description ?? "No description."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>{getEventTypeLabel(event.type)}</Badge>
              <Badge
                variant={
                  event.status === "COMPLETED"
                    ? "success"
                    : event.status === "CANCELLED"
                      ? "destructive"
                      : event.status === "ONGOING"
                        ? "warning"
                        : "outline"
                }
              >
                {event.status}
              </Badge>
              {event.forDistrictNewsletter && (
                <Badge className="bg-amber-100 text-amber-900">Newsletter</Badge>
              )}
            </div>
            <p>
              <strong>Date:</strong> {new Date(event.startDate).toLocaleString()}
            </p>
            {event.location && (
              <p>
                <strong>Location:</strong> {event.location}
              </p>
            )}
            {event.hostedBy && (
              <p>
                <strong>Hosted by:</strong> {event.hostedBy}
              </p>
            )}
            {event.collaborations && (
              <p>
                <strong>Collaborations:</strong> {event.collaborations}
              </p>
            )}
            <p>
              <strong>Attendance:</strong> {event.attendees}
              {event.maxAttendees != null ? ` / ${event.maxAttendees} max` : ""}
            </p>
            {event.minutesPdfUrl && (
              <a
                href={event.minutesPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <FileText className="h-4 w-4" />
                View meeting minutes (PDF)
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => handleUpload("banner", bannerRef)}
            />
            <input
              ref={minutesRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={() => handleUpload("minutes", minutesRef)}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => handleUpload("gallery", galleryRef)}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => bannerRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Banner
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => minutesRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Minutes PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => galleryRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              Gallery photo
            </Button>
          </CardContent>
        </Card>
      </div>

      {event.gallery && event.gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {event.gallery.map((img) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.caption ?? "Event photo"}
                    fill
                    className="object-cover transition hover:scale-[1.02]"
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(event.type === "DISTRICT" || event.type === "INSTALLATION") && (
        <PublicEventRegistrationsPanel eventId={eventId} />
      )}
    </div>
  );
}
