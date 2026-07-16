"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useUpdateTask } from "@/hooks/use-council-assignments";
import { formErrorMessage, notifyValidation, toast } from "@/lib/toast";

const CATEGORIES = [
  "Reporting",
  "Service",
  "Membership",
  "Governance",
  "Administration",
  "Events",
  "Professional Development",
];

export type EditableTask = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  maxScore: number;
  dueDate: string;
};

interface EditTaskDialogProps {
  task: EditableTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const updateTask = useUpdateTask();
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reporting");
  const [maxScore, setMaxScore] = useState("50");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setCategory(task.category);
    setMaxScore(String(task.maxScore));
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setError("");
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!task) return;
    if (!title.trim() || !dueDate) {
      setError(notifyValidation("Title and due date are required."));
      return;
    }

    const due = new Date(`${dueDate}T23:59:59`);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        category,
        maxScore: parseInt(maxScore, 10) || 50,
        dueDate: due.toISOString(),
      });
      toast.success("Task updated");
      onOpenChange(false);
    } catch (err) {
      setError(formErrorMessage(err, "Something went wrong."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit bluebook task</DialogTitle>
          <DialogDescription>
            Update the task details. Changes apply to everyone this task is assigned to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Task title</Label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description (optional)</Label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <Label htmlFor="edit-max-score">Max score</Label>
              <Input
                id="edit-max-score"
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
            <Label htmlFor="edit-due-date">Due date</Label>
            <Input
              id="edit-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
