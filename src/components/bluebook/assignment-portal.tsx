"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateTaskDialog } from "@/components/bluebook/create-task-dialog";
import { BluebookCycleForm } from "@/components/bluebook/bluebook-cycle-form";
import { useAssignTasks, useAssignmentPortal, useDeleteAssignment, useBatchDeleteAssignments } from "@/hooks/use-council-assignments";
import { notifyValidation, toast } from "@/lib/toast";
import { QueryErrorState } from "@/components/ui/query-error-state";

export function AssignmentPortal() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, isFetching, isError, error } = useAssignmentPortal(month, year);
  const assign = useAssignTasks();
  const batchDeleteMutation = useBatchDeleteAssignments();

  const [taskId, setTaskId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }
    setDeletingId(id);
    try {
      await batchDeleteMutation.mutateAsync([id]);
      toast.success("Assignment deleted successfully");
      setSelectedAssignments((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      toast.error("Failed to delete assignment");
    } finally {
      setDeletingId("");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedAssignments.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedAssignments.length} selected assignment(s)?`)) {
      return;
    }
    try {
      await batchDeleteMutation.mutateAsync(selectedAssignments);
      toast.success("Assignments deleted successfully");
      setSelectedAssignments([]);
    } catch (err) {
      toast.error("Failed to delete assignments");
    }
  };

  const tasks = data?.tasks ?? [];
  const members = data?.members ?? [];
  const assignments = data?.assignments ?? [];
  const loadingDropdowns = isFetching && tasks.length === 0 && members.length === 0;

  const handleAssign = async () => {
    if (!taskId || !assigneeId) {
      notifyValidation("Select a task and council member to assign.");
      return;
    }
    await assign.mutateAsync({ taskId, assigneeIds: [assigneeId] });
    setAssigneeId("");
    toast.success("Task assigned successfully");
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title="Bluebook Task Assignment"
        subtitle="Create new bluebook tasks and assign them to council members."
        action={<CreateTaskDialog members={members} month={month} year={year} />}
      />

      <BluebookCycleForm month={month} year={year} />

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
        <QueryErrorState error={error} title="Failed to load assignments" />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Current assignments</h2>
          {selectedAssignments.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleBulkDelete}
              disabled={batchDeleteMutation.isPending}
            >
              {batchDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-3.5 w-3.5" />
              )}
              Delete Selected ({selectedAssignments.length})
            </Button>
          )}
        </div>
        <div className="table-scroll rounded-xl border border-border/50 bg-card">
          <Table className="ref-table min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={assignments.length > 0 && selectedAssignments.length === assignments.length}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedAssignments.length > 0 && selectedAssignments.length < assignments.length;
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignments(assignments.map((a) => a.id));
                      } else {
                        setSelectedAssignments([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-border accent-accent"
                  />
                </TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-accent" />
                    Loading assignments…
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No assignments yet. Create a task or assign an existing one above.
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id} className={selectedAssignments.includes(a.id) ? "bg-accent/5" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedAssignments.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssignments((prev) => [...prev, a.id]);
                          } else {
                            setSelectedAssignments((prev) => prev.filter((id) => id !== a.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-border accent-accent"
                      />
                    </TableCell>
                    <TableCell>{a.assigneeName}</TableCell>
                    <TableCell className="font-medium align-top">{a.task?.title ?? "—"}</TableCell>
                    <TableCell className="max-w-md align-top text-sm text-muted-foreground">
                      {a.task?.description ? (
                        <p className="whitespace-pre-wrap">{a.task.description}</p>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden align-top sm:table-cell">
                      {a.task?.dueDate ? new Date(a.task.dueDate).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell className="align-top">{a.status}</TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(a.id)}
                        disabled={batchDeleteMutation.isPending}
                      >
                        {batchDeleteMutation.isPending && deletingId === a.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
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
