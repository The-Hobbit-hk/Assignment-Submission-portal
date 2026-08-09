"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimeField } from "@/components/ui/date-time-field";
import type { EventItem } from "@/hooks/use-events";
import { formErrorMessage, toast } from "@/lib/toast";
import { ADMIN_EVENT_TYPES, getEventTypeLabel } from "@/lib/event-types";

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
    hostedBy: initial?.hostedBy ?? "",
    collaborations: initial?.collaborations ?? "",
    type: initial?.type ?? "COMMUNITY_SERVICE",
    status: initial?.status ?? "UPCOMING",
    clubId: lockedClub?.id ?? initial?.clubId ?? "",
    attendees:
      initial?.attendees != null && initial.attendees > 0
        ? String(initial.attendees)
        : "",
    maxAttendees:
      initial?.maxAttendees != null ? String(initial.maxAttendees) : "",
    registrationOpensAt: initial?.registrationOpensAt
      ? initial.registrationOpensAt.slice(0, 16)
      : "",
    registrationClosesAt: initial?.registrationClosesAt
      ? initial.registrationClosesAt.slice(0, 16)
      : "",
    onSiteRegistration: initial?.onSiteRegistration ?? false,
    forDistrictNewsletter: initial?.forDistrictNewsletter ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const attendance =
        form.attendees.trim() === "" ? undefined : Number(form.attendees);
      const capacity =
        form.maxAttendees.trim() === "" ? null : Number(form.maxAttendees);

      if (attendance != null && Number.isNaN(attendance)) {
        setError("Attendance must be a valid number.");
        setLoading(false);
        return;
      }
      if (capacity != null && (Number.isNaN(capacity) || capacity < 1)) {
        setError("Max attendees must be at least 1, or leave blank for no limit.");
        setLoading(false);
        return;
      }

      await onSubmit({
        title: form.title,
        description: form.description || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        location: form.location || undefined,
        hostedBy: form.hostedBy.trim() || undefined,
        collaborations: form.collaborations.trim() || undefined,
        type: form.type,
        status: form.status,
        clubId: form.clubId || undefined,
        attendees: attendance,
        maxAttendees: capacity,
        registrationOpensAt: form.registrationOpensAt
          ? new Date(form.registrationOpensAt).toISOString()
          : undefined,
        registrationClosesAt: form.registrationClosesAt
          ? new Date(form.registrationClosesAt).toISOString()
          : undefined,
        onSiteRegistration: form.onSiteRegistration,
        forDistrictNewsletter: form.forDistrictNewsletter,
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
        <div className="space-y-2"><Label>Start</Label><DateTimeField value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} /></div>
        <div className="space-y-2"><Label>End</Label><DateTimeField value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} /></div>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Hosted By</Label>
          <Input
            value={form.hostedBy}
            onChange={(e) => setForm({ ...form, hostedBy: e.target.value })}
            placeholder="Hosted By"
          />
        </div>
        <div className="space-y-2">
          <Label>Collaborations</Label>
          <Input
            value={form.collaborations}
            onChange={(e) => setForm({ ...form, collaborations: e.target.value })}
            placeholder="Collaborations"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2"><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(ADMIN_EVENT_TYPES.some((t) => t.value === form.type)
                ? ADMIN_EVENT_TYPES
                : [{ value: form.type, label: getEventTypeLabel(form.type) }, ...ADMIN_EVENT_TYPES]
              ).map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["UPCOMING","ONGOING","COMPLETED","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Attendance</Label>
          <Input
            type="number"
            min={0}
            placeholder="How many attended"
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">Actual headcount for this event</p>
        </div>
        <div className="space-y-2">
          <Label>Max attendees</Label>
          <Input
            type="number"
            min={1}
            placeholder="No limit"
            value={form.maxAttendees}
            onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">Registration capacity (optional)</p>
        </div>
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
            <DateTimeField
              value={form.registrationOpensAt}
              onChange={(v) => setForm({ ...form, registrationOpensAt: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Registration closes</Label>
            <DateTimeField
              value={form.registrationClosesAt}
              onChange={(v) => setForm({ ...form, registrationClosesAt: v })}
            />
          </div>
          </div>
        </div>
      )}
      <label className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.forDistrictNewsletter}
          onChange={(e) =>
            setForm({ ...form, forDistrictNewsletter: e.target.checked })
          }
        />
        <span>
          <span className="font-medium text-foreground">
            Submit this event for the district newsletter later
          </span>
          <span className="mt-1 block text-muted-foreground">
            Flag this event so district can pull it into the newsletter.
          </span>
        </span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
