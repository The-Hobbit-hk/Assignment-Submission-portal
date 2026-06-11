"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportingEventForm } from "@/components/reporting/reporting-event-form";
import { useCreateReportingEvent } from "@/hooks/use-reporting";

interface AddReportingEventDialogProps {
  clubId: string;
  clubName: string;
  reportingMonth?: number;
  reportingYear?: number;
  disabled?: boolean;
}

export function AddReportingEventDialog({
  clubId,
  clubName,
  reportingMonth,
  reportingYear,
  disabled,
}: AddReportingEventDialogProps) {
  const [open, setOpen] = useState(false);
  const create = useCreateReportingEvent();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Events Reporting</DialogTitle>
          <DialogDescription>
            Add an event for {clubName} to include in this month&apos;s reporting.
          </DialogDescription>
        </DialogHeader>
        <ReportingEventForm
          clubId={clubId}
          reportingMonth={reportingMonth}
          reportingYear={reportingYear}
          disabled={disabled}
          onCancel={() => setOpen(false)}
          onSubmit={async (formData) => {
            await create.mutateAsync(formData);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
