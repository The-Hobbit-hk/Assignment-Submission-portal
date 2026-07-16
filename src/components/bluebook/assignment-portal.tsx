"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateTaskDialog } from "@/components/bluebook/create-task-dialog";
import { EditTaskDialog, type EditableTask } from "@/components/bluebook/edit-task-dialog";
import { useAssignTasks, useAssignmentPortal, useBatchDeleteAssignments } from "@/hooks/use-council-assignments";
import { notifyValidation, toast } from "@/lib/toast";
import { QueryErrorState } from "@/components/ui/query-error-state";

const PAGE_SIZE = 10;

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

  const [memberFilter, setMemberFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editTask, setEditTask] = useState<EditableTask | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const tasks = data?.tasks ?? [];
  const members = data?.members ?? [];
  const assignments = useMemo(() => data?.assignments ?? [], [data]);
  const loadingDropdowns = isFetching && tasks.length === 0 && members.length === 0;

  const filteredAssignments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      if (memberFilter && a.assigneeId !== memberFilter) return false;
      if (taskFilter && a.taskId !== taskFilter) return false;
      if (q) {
        const hay = `${a.task?.title ?? ""} ${a.task?.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [assignments, memberFilter, taskFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAssignments = filteredAssignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [memberFilter, taskFilter, search]);

  const filteredIds = filteredAssignments.map((a) => a.id);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedAssignments.includes(id));

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }
    setDeletingId(id);
    try {
      await batchDeleteMutation.mutateAsync([id]);
      toast.success("Assignment deleted successfully");
      setSelectedAssignments((prev) => prev.filter((x) => x !== id));
    } catch {
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
    } catch {
      toast.error("Failed to delete assignments");
    }
  };

  const handleAssign = async () => {
    if (!taskId || !assigneeId) {
      notifyValidation("Select a task and council member to assign.");
      return;
    }
    await assign.mutateAsync({ taskId, assigneeIds: [assigneeId] });
    setAssigneeId("");
    toast.success("Task assigned successfully");
  };

  const openEdit = (a: (typeof assignments)[number]) => {
    if (!a.task) return;
    setEditTask({
      id: a.task.id,
      title: a.task.title,
      description: a.task.description,
      category: a.task.category,
      maxScore: a.task.maxScore,
      dueDate: a.task.dueDate,
    });
    setEditOpen(true);
  };

  return (
    <div className="space-y-4">
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

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 bg-card p-4">
          <div className="min-w-[180px] flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Search task</p>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task title or description…"
            />
          </div>
          <div className="min-w-[180px] space-y-1">
            <p className="text-xs text-muted-foreground">Filter by member</p>
            <Select value={memberFilter || "all"} onValueChange={(v) => setMemberFilter(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name ?? m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px] space-y-1">
            <p className="text-xs text-muted-foreground">Filter by task</p>
            <Select value={taskFilter || "all"} onValueChange={(v) => setTaskFilter(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(memberFilter || taskFilter || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setMemberFilter("");
                setTaskFilter("");
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="table-scroll rounded-xl border border-border/50 bg-card">
          <Table className="ref-table min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) {
                        const selectedVisible = filteredIds.filter((id) =>
                          selectedAssignments.includes(id)
                        ).length;
                        el.indeterminate =
                          selectedVisible > 0 && selectedVisible < filteredIds.length;
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignments((prev) =>
                          Array.from(new Set([...prev, ...filteredIds]))
                        );
                      } else {
                        setSelectedAssignments((prev) =>
                          prev.filter((id) => !filteredIds.includes(id))
                        );
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
                <TableHead className="w-[110px] text-right">Actions</TableHead>
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
              ) : filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {assignments.length === 0
                      ? "No assignments yet. Create a task or assign an existing one above."
                      : "No assignments match the current filters."}
                  </TableCell>
                </TableRow>
              ) : (
                pagedAssignments.map((a) => (
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(a)}
                          disabled={!a.task}
                          title="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(a.id)}
                          disabled={batchDeleteMutation.isPending}
                          title="Delete assignment"
                        >
                          {batchDeleteMutation.isPending && deletingId === a.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredAssignments.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredAssignments.length)} of{" "}
              {filteredAssignments.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditTaskDialog task={editTask} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
