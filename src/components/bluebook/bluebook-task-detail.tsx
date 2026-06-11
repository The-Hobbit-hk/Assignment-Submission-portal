"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBluebookTask, useCreateSubmission, useReviewSubmission, useSubmitBluebook, uploadProof } from "@/hooks/use-bluebook";
import { useClubsList } from "@/hooks/use-clubs";
import { useQueryClient } from "@tanstack/react-query";

export function BluebookTaskDetail({ taskId }: { taskId: string }) {
  const { data: task, isLoading } = useBluebookTask(taskId);
  const { data: clubs } = useClubsList();
  const [clubId, setClubId] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const createSub = useCreateSubmission();
  const submitSub = useSubmitBluebook(submissionId);
  const reviewSub = useReviewSubmission(submissionId);
  const proofRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  if (isLoading) return <Skeleton className="h-96" />;
  if (!task) return <p className="text-destructive">Task not found.</p>;

  const sub = task.submissions?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/bluebook"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground">{task.category} · Max {task.maxScore} pts</p>
        </div>
        {task.isExpired && <Badge variant="destructive">Expired</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Task Details</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>{task.description ?? "No description."}</p>
          <p>Due: {new Date(task.dueDate).toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Submission</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Club</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger>
              <SelectContent>{clubs?.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button disabled={!clubId} onClick={() => createSub.mutate({ taskId, clubId }, { onSuccess: (s) => setSubmissionId(s.id) })}>
            Start submission
          </Button>

          {(submissionId || sub) && (
            <div className="space-y-3 border-t border-border/40 pt-4">
              <input ref={proofRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={async () => {
                const file = proofRef.current?.files?.[0];
                if (file) { await uploadProof(submissionId || sub!.id, file); qc.invalidateQueries({ queryKey: ["bluebook"] }); }
              }} />
              <Button variant="outline" onClick={() => proofRef.current?.click()}><Upload className="h-4 w-4" />Upload proof</Button>
              {sub?.proofUrl && <a href={sub.proofUrl} className="text-sm text-accent hover:underline" target="_blank">View proof</a>}
              <Button onClick={() => submitSub.mutate()} disabled={task.isExpired}>Submit for review</Button>

              <div className="space-y-2 pt-4">
                <Label>Reviewer — allocate score</Label>
                <Input type="number" max={task.maxScore} value={score} onChange={(e) => setScore(Number(e.target.value))} />
                <Textarea placeholder="Reviewer comments" value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={() => reviewSub.mutate({ allocatedScore: score, reviewerComment: comment, status: "APPROVED" })}>Approve</Button>
                  <Button variant="destructive" onClick={() => reviewSub.mutate({ allocatedScore: 0, reviewerComment: comment, status: "REJECTED" })}>Reject</Button>
                </div>
                {sub?.reviewerComment && <p className="text-sm text-muted-foreground">Comment: {sub.reviewerComment}</p>}
                {sub?.allocatedScore != null && <p className="text-sm">Score: <strong className="text-accent">{sub.allocatedScore}</strong></p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
