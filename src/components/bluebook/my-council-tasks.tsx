"use client";

import { useRef } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  uploadCouncilProof,
  useMyCouncilTasks,
  useSubmitCouncilAssignment,
} from "@/hooks/use-council-assignments";
import { useQueryClient } from "@tanstack/react-query";

type CouncilTask = {
  id: string;
  task?: {
    title: string;
    description: string | null;
    dueDate: string;
    maxScore: number;
    isExpired: boolean;
  };
  status: string;
  proofUrl: string | null;
};

export function MyCouncilTasks() {
  const { data: tasks, isLoading } = useMyCouncilTasks();

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <PageHeading title="My Bluebook Tasks" subtitle="Tasks assigned to you by the District Secretary." />
      <div className="space-y-3">
        {(tasks as CouncilTask[] | undefined)?.length ? (
          (tasks as CouncilTask[]).map((t) => <TaskCard key={t.id} task={t} />)
        ) : (
          <p className="text-muted-foreground">No tasks assigned yet.</p>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: CouncilTask }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const submit = useSubmitCouncilAssignment(task.id);

  const handleUpload = async (file: File) => {
    await uploadCouncilProof(task.id, file);
    qc.invalidateQueries({ queryKey: ["bluebook", "my-tasks"] });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/40 bg-card/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{task.task?.title ?? "Task"}</h3>
          <p className="text-xs text-muted-foreground">
            Due {task.task?.dueDate ? new Date(task.task.dueDate).toLocaleDateString() : "—"} ·{" "}
            {task.task?.maxScore ?? 0} pts
          </p>
        </div>
        <Badge variant={task.task?.isExpired ? "destructive" : "default"}>{task.status}</Badge>
      </div>
      {task.task?.description && (
        <p className="text-sm text-muted-foreground">{task.task.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />Upload Proof
        </Button>
        {task.proofUrl && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={task.proofUrl} target="_blank">View Proof</Link>
          </Button>
        )}
        <Button
          size="sm"
          className="bg-accent text-accent-foreground"
          disabled={submit.isPending || task.status === "SUBMITTED"}
          onClick={() => submit.mutate()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
