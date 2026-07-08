"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon, Trash2, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteEvent, useEvent, useRegisterEvent, uploadEventFile } from "@/hooks/use-events";
import { useMembers } from "@/hooks/use-members";
import { PublicEventRegistrationsPanel } from "@/components/events/public-event-registrations-panel";
import { useQueryClient } from "@tanstack/react-query";

export function EventDetail({ eventId }: { eventId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: event, isLoading } = useEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const registerMutation = useRegisterEvent(eventId);
  const { data: membersData } = useMembers({ limit: 100 });
  const [memberId, setMemberId] = useState("");
  const bannerRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!event) return <p className="text-destructive">Event not found.</p>;

  async function handleUpload(type: "banner" | "minutes" | "gallery", ref: React.RefObject<HTMLInputElement | null>) {
    const file = ref.current?.files?.[0];
    if (!file) return;
    await uploadEventFile(eventId, type, file);
    qc.invalidateQueries({ queryKey: ["events", eventId] });
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/events"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <p className="text-muted-foreground">{event.club?.name ?? "District Event"}</p>
        </div>
        <Button variant="outline" asChild><Link href={`/dashboard/events/${eventId}/edit`}>Edit</Link></Button>
        <Button variant="destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(eventId, { onSuccess: () => router.push("/dashboard/events") }); }}><Trash2 className="h-4 w-4" /></Button>
      </div>

      {event.bannerUrl && <div className="h-48 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${event.bannerUrl})` }} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{event.description ?? "No description."}</p>
            <div className="flex flex-wrap gap-2">
              <Badge>{event.type}</Badge><Badge variant="outline">{event.status}</Badge>
            </div>
            <p><strong>Date:</strong> {new Date(event.startDate).toLocaleString()}</p>
            {event.location && <p><strong>Location:</strong> {event.location}</p>}
            <p><strong>Service hours:</strong> {event.serviceHours}h</p>
            {event.minutesPdfUrl && (
              <a href={event.minutesPdfUrl} target="_blank" className="flex items-center gap-2 text-accent hover:underline">
                <FileText className="h-4 w-4" />View meeting minutes (PDF)
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Uploads</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={() => handleUpload("banner", bannerRef)} />
            <input ref={minutesRef} type="file" accept="application/pdf" className="hidden" onChange={() => handleUpload("minutes", minutesRef)} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={() => handleUpload("gallery", galleryRef)} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => bannerRef.current?.click()}><Upload className="h-4 w-4" />Banner</Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => minutesRef.current?.click()}><FileText className="h-4 w-4" />Minutes PDF</Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => galleryRef.current?.click()}><ImageIcon className="h-4 w-4" />Gallery photo</Button>
          </CardContent>
        </Card>
      </div>

      {event.gallery && event.gallery.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Gallery</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {event.gallery.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image src={img.url} alt={img.caption ?? "Event photo"} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Registrations ({event.registrations?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {membersData?.data?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!memberId} onClick={() => registerMutation.mutate(memberId)}><UserPlus className="h-4 w-4" />Register</Button>
          </div>
          <div className="space-y-2">
            {event.registrations?.map((r) => (
              <div key={r.id} className="flex justify-between rounded-lg border border-border/40 px-3 py-2 text-sm">
                <span>{r.member.firstName} {r.member.lastName}</span>
                <Badge variant="outline">{r.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(event.type === "DISTRICT" || event.type === "INSTALLATION") && (
        <PublicEventRegistrationsPanel eventId={eventId} />
      )}
    </div>
  );
}
