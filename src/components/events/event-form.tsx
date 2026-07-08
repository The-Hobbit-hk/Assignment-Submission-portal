"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventItem } from "@/hooks/use-events";
import { formErrorMessage, toast } from "@/lib/toast";

interface EventFormProps {
  clubs: { id: string; name: string }[];
  initial?: Partial<EventItem>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  /** When set, club is fixed (club reporting) and selector is hidden */
  lockedClub?: { id: string; name: string };
}

export function EventForm({
  clubs,
  initial,
  onSubmit,
  submitLabel = "Save Event",
  lockedClub,
}: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    startDate: initial?.startDate ? initial.startDate.slice(0, 16) : "",
    endDate: initial?.endDate ? initial.endDate.slice(0, 16) : "",
    location: initial?.location ?? "",
    type: initial?.type ?? "SERVICE",
    status: initial?.status ?? "UPCOMING",
    clubId: lockedClub?.id ?? initial?.clubId ?? "",
    maxAttendees: initial?.maxAttendees ?? "",
    registrationOpensAt: initial?.registrationOpensAt
      ? initial.registrationOpensAt.slice(0, 16)
      : "",
    registrationClosesAt: initial?.registrationClosesAt
      ? initial.registrationClosesAt.slice(0, 16)
      : "",
    onSiteRegistration: initial?.onSiteRegistration ?? false,
    serviceHours: initial?.serviceHours ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        clubId: form.clubId || undefined,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        registrationOpensAt: form.registrationOpensAt
          ? new Date(form.registrationOpensAt).toISOString()
          : undefined,
        registrationClosesAt: form.registrationClosesAt
          ? new Date(form.registrationClosesAt).toISOString()
          : undefined,
        serviceHours: Number(form.serviceHours),
      });
      toast.success(
        initial?.id ? "Event updated successfully" : "Event created successfully"
      );
    } catch (err) {
      setError(formErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
        <div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        {lockedClub ? (
          <div className="space-y-2">
            <Label>Club</Label>
            <Input value={lockedClub.name} disabled className="bg-muted" />
          </div>
        ) : (
          <div className="space-y-2"><Label>Club</Label>
            <Select value={form.clubId || "none"} onValueChange={(v) => setForm({ ...form, clubId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="District-wide" /></SelectTrigger>
              <SelectContent><SelectItem value="none">District-wide</SelectItem>{clubs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["SERVICE","PROFESSIONAL","SOCIAL","DISTRICT","TRAINING","ISD","INSTALLATION"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["UPCOMING","ONGOING","COMPLETED","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Max attendees</Label><Input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} /></div>
      </div>
      {(form.type === "DISTRICT" || form.type === "INSTALLATION") && (
        <div className="space-y-4 rounded-lg border border-border/50 p-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.onSiteRegistration}
              onChange={(e) =>
                setForm({ ...form, onSiteRegistration: e.target.checked })
              }
            />
            <span>
              <span className="font-medium">On-site registration form</span>
              <span className="mt-1 block text-muted-foreground">
                Visitors register on the website (name, club, RI ID, payment screenshot, govt ID).
                Submissions are visible to district admins only.
              </span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Registration opens</Label>
            <Input
              type="datetime-local"
              value={form.registrationOpensAt}
              onChange={(e) => setForm({ ...form, registrationOpensAt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Registration closes</Label>
            <Input
              type="datetime-local"
              value={form.registrationClosesAt}
              onChange={(e) => setForm({ ...form, registrationClosesAt: e.target.value })}
            />
          </div>
          </div>
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
