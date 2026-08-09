"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportingFileUpload } from "@/components/reporting/reporting-file-upload";
import { DateTimeField } from "@/components/ui/date-time-field";
import { formErrorMessage, notifyValidation, toast } from "@/lib/toast";
import { CLUB_EVENT_AVENUES } from "@/lib/event-types";

const EVENT_TYPES = CLUB_EVENT_AVENUES;

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultReportingStart(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();
  const isCurrent = now.getMonth() + 1 === m && now.getFullYear() === y;
  const day = isCurrent ? now.getDate() : 15;
  return toDatetimeLocalValue(new Date(y, m - 1, day, 10, 0));
}

interface ReportingEventFormProps {
  clubId: string;
  reportingMonth?: number;
  reportingYear?: number;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export function ReportingEventForm({
  clubId,
  reportingMonth,
  reportingYear,
  onSubmit,
  onCancel,
  submitLabel = "Add",
  disabled,
}: ReportingEventFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(EVENT_TYPES[0].value);
  const [location, setLocation] = useState("");
  const [hostedBy, setHostedBy] = useState("");
  const [collaborations, setCollaborations] = useState("");
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");
  const [forDistrictNewsletter, setForDistrictNewsletter] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    defaultReportingStart(reportingMonth, reportingYear)
  );
  const [endDate, setEndDate] = useState("");
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !startDate) {
      setError(notifyValidation("Event name and start date are required."));
      return;
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      setError(notifyValidation("Invalid start date."));
      return;
    }

    if (reportingMonth && reportingYear) {
      const inMonth =
        start.getMonth() + 1 === reportingMonth && start.getFullYear() === reportingYear;
      if (!inMonth) {
        setError(
          notifyValidation(
            `Event date must fall within ${reportingMonth}/${reportingYear} to appear in this month's reporting.`
          )
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        location: location.trim() || undefined,
        hostedBy: hostedBy.trim() || undefined,
        collaborations: collaborations.trim() || undefined,
        attendees: attendees ? parseInt(attendees, 10) : undefined,
        description: description.trim() || undefined,
        startDate: start.toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        clubId,
        forDistrictNewsletter,
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      if (minutesFile) fd.append("minutes", minutesFile);
      if (imageFile) fd.append("image", imageFile);

      await onSubmit(fd);
      toast.success("Event added successfully");
    } catch (err) {
      setError(formErrorMessage(err, "Failed to add event."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Event Name</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Name"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Event Type</label>
          <Select value={type} onValueChange={setType} disabled={disabled || loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Event Venue</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Event Venue"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Hosted By</label>
          <Input
            value={hostedBy}
            onChange={(e) => setHostedBy(e.target.value)}
            placeholder="Hosted By"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Collaborations</label>
          <Input
            value={collaborations}
            onChange={(e) => setCollaborations(e.target.value)}
            placeholder="Collaborations"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Attendance</label>
          <Input
            type="number"
            min={0}
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Attendance"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Description"
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Event Start Date</label>
          <DateTimeField
            value={startDate}
            onChange={setStartDate}
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Event End Date</label>
          <DateTimeField
            value={endDate}
            onChange={setEndDate}
            disabled={disabled || loading}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <ReportingFileUpload
            label="Add Minutes of Meetings (pdf) (max size: 2MB)"
            fileUrl={minutesFile ? "pending" : null}
            disabled={disabled || loading}
            accept=".pdf"
            hint="PDF only, max 2MB. Uploads go directly to storage."
            onUpload={async (file) => {
              if (file.size > 2 * 1024 * 1024) throw new Error("File exceeds 2MB limit.");
              setMinutesFile(file);
            }}
            onClear={() => setMinutesFile(null)}
            pendingLabel={minutesFile?.name}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <ReportingFileUpload
            label="Add Image (max size: 2MB)"
            fileUrl={imageFile ? "pending" : null}
            disabled={disabled || loading}
            accept=".jpg,.jpeg,.png,.webp"
            hint="Image, max 2MB. Uploads go directly to storage."
            onUpload={async (file) => {
              if (file.size > 2 * 1024 * 1024) throw new Error("File exceeds 2MB limit.");
              setImageFile(file);
            }}
            onClear={() => setImageFile(null)}
            pendingLabel={imageFile?.name}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={forDistrictNewsletter}
          onChange={(e) => setForDistrictNewsletter(e.target.checked)}
          disabled={disabled || loading}
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

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="submit"
          disabled={disabled || loading}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Adding…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
