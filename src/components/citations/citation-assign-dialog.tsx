"use client";

import { useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignCitations } from "@/hooks/use-citations";
import { useClubsList } from "@/hooks/use-clubs";
import { siteConfig } from "@/config/site";
import type { SerializedCitationDefinition } from "@/lib/citations-shared";
import { formatCitationTitle } from "@/lib/citations-shared";
import type { CitationCadence } from "@/generated/prisma/client";
import { ROTARY_MONTH_ORDER, rotaryQuarterOfMonth } from "@/lib/rotary-year";
import { cn } from "@/lib/utils";
import { formErrorMessage, notifyValidation, toast } from "@/lib/toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CitationAssignDialogProps {
  definition: SerializedCitationDefinition;
}

export function CitationAssignDialog({ definition }: CitationAssignDialogProps) {
  const assign = useAssignCitations();
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [assignAll, setAssignAll] = useState(true);
  const { data: clubsData } = useClubsList(
    { limit: 150, status: "ACTIVE", minimal: true },
    { enabled: open && !assignAll }
  );
  const clubs = clubsData?.data ?? [];
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [quarter, setQuarter] = useState(String(rotaryQuarterOfMonth(now.getMonth() + 1)));
  const [rotaryYear, setRotaryYear] = useState<string>(siteConfig.rotaryYear);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const cadence = definition.cadence as CitationCadence;

  const periodPreview = useMemo(() => {
    if (cadence === "MONTHLY") return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
    if (cadence === "QUARTERLY") return `Q${quarter} ${year}`;
    return `RIY ${rotaryYear}`;
  }, [cadence, month, year, quarter, rotaryYear]);

  const toggleClub = (id: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!assignAll && selectedClubIds.length === 0) {
      const msg = "Select at least one club or choose all clubs.";
      setError(msg);
      notifyValidation(msg);
      return;
    }

    assign.mutate(
      {
        definitionId: definition.id,
        assignAllClubs: assignAll,
        clubIds: assignAll ? undefined : selectedClubIds,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        year: parseInt(year, 10),
        month: cadence === "MONTHLY" ? parseInt(month, 10) : undefined,
        quarter: cadence === "QUARTERLY" ? parseInt(quarter, 10) : undefined,
        rotaryYearLabel: cadence === "YEARLY" ? rotaryYear : undefined,
      },
      {
        onSuccess: (result) => {
          toast.success(
            `Assigned to ${result.assignedCount} club(s) for ${periodPreview}` +
              (result.createdCount < result.assignedCount
                ? ` (${result.createdCount} new)`
                : "")
          );
          setOpen(false);
        },
        onError: (err) => setError(formErrorMessage(err, "Assignment failed.")),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Users className="h-4 w-4" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign citation</DialogTitle>
          <DialogDescription>
            {formatCitationTitle(definition.title)} · {definition.points} pts · {periodPreview}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {cadence === "MONTHLY" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROTARY_MONTH_ORDER.map((m) => (
                      <SelectItem key={m} value={String(m)}>{MONTHS[m - 1]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" />
              </div>
            </div>
          )}

          {cadence === "QUARTERLY" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((q) => (
                      <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" />
              </div>
            </div>
          )}

          {cadence === "YEARLY" && (
            <div className="space-y-2">
              <Label>Rotary year</Label>
              <Input value={rotaryYear} onChange={(e) => setRotaryYear(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="due-date">Due date (optional)</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Clubs</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={assignAll ? "default" : "outline"}
                onClick={() => setAssignAll(true)}
              >
                All official clubs
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!assignAll ? "default" : "outline"}
                onClick={() => setAssignAll(false)}
              >
                Selected clubs
              </Button>
            </div>
          </div>

          {!assignAll && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/50 p-2">
              {clubs.map((club) => (
                <label
                  key={club.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60",
                    selectedClubIds.includes(club.id) && "bg-accent/10"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedClubIds.includes(club.id)}
                    onChange={() => toggleClub(club.id)}
                  />
                  <span className="truncate">{club.name}</span>
                </label>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={assign.isPending} className="w-full">
            {assign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Assign to clubs
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
