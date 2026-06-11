"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateTaskDialog } from "@/components/bluebook/create-task-dialog";
import { useAssignTasks, useAssignmentPortal } from "@/hooks/use-council-assignments";

export function AssignmentPortal() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, isFetching, isError, error } = useAssignmentPortal(month, year);
  const assign = useAssignTasks();

  const [taskId, setTaskId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const tasks = data?.tasks ?? [];
  const members = data?.members ?? [];
  const assignments = data?.assignments ?? [];
  const loadingDropdowns = isFetching && tasks.length === 0 && members.length === 0;

  const handleAssign = async () => {
    if (!taskId || !assigneeId) return;
    await assign.mutateAsync({ taskId, assigneeIds: [assigneeId] });
    setAssigneeId("");
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Bluebook Task Assignment"
        subtitle="Create new bluebook tasks and assign them to council members."
        action={<CreateTaskDialog members={members} month={month} year={year} />}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Assign existing task</h2>
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border/50 bg-card p-5">
          <div className="min-w-[200px] flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Task</p>
            <Select value={taskId} onValueChange={setTaskId} disabled={loadingDropdowns}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDropdowns ? "Loading tasks…" : "Select task"} />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px] flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Council Member</p>
            <Select value={assigneeId} onValueChange={setAssigneeId} disabled={loadingDropdowns}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDropdowns ? "Loading members…" : "Select member"} />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name ?? m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={assign.isPending || !taskId || !assigneeId}
          >
            {assign.isPending && <Loader2 className="animate-spin" />}
            Assign Task
          </Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(error as Error)?.message ?? "Failed to load assignments. Please refresh the page."}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Current assignments</h2>
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          <Table className="ref-table">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-accent" />
                    Loading assignments…
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No assignments yet. Create a task or assign an existing one above.
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.assigneeName}</TableCell>
                    <TableCell>{a.task?.title ?? "—"}</TableCell>
                    <TableCell>
                      {a.task?.dueDate ? new Date(a.task.dueDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>{a.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
