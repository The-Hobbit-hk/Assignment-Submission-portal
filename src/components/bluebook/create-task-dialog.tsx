"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAndAssignTask } from "@/hooks/use-council-assignments";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Reporting",
  "Service",
  "Membership",
  "Governance",
  "Administration",
  "Events",
  "Professional Development",
];

type Member = { id: string; name: string | null; email: string };

interface CreateTaskDialogProps {
  members: Member[];
  month: number;
  year: number;
}

export function CreateTaskDialog({ members, month, year }: CreateTaskDialogProps) {
  const createAndAssign = useCreateAndAssignTask();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reporting");
  const [maxScore, setMaxScore] = useState("50");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Reporting");
    setMaxScore("50");
    setDueDate("");
    setNotes("");
    setSelectedMembers([]);
    setError("");
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !dueDate || selectedMembers.length === 0) {
      setError("Title, due date, and at least one council member are required.");
      return;
    }

    const due = new Date(`${dueDate}T23:59:59`);

    try {
      await createAndAssign.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        maxScore: parseInt(maxScore, 10) || 50,
        dueDate: due.toISOString(),
        month: due.getMonth() + 1,
        year: due.getFullYear(),
        assigneeIds: selectedMembers,
        notes: notes.trim() || undefined,
      });
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create & Assign Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create bluebook task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to one or more council members for{" "}
            {month}/{year}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Submit monthly council report"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or details for the council member"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-score">Max score</Label>
              <Input
                id="max-score"
                type="number"
                min={1}
                max={1000}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Assign to council members</Label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-black/20 p-2">
              {members.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No council members found.
                </p>
              ) : (
                members.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm transition hover:bg-white/5",
                      selectedMembers.includes(m.id) && "bg-accent/10"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {m.name ?? m.email}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes for assignees (optional)</Label>
            <Input
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAndAssign.isPending}>
              {createAndAssign.isPending && <Loader2 className="animate-spin" />}
              Create & Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
