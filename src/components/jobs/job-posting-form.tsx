"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJobPosting } from "@/hooks/use-jobs";
import { notifyValidation, toast } from "@/lib/toast";

export function JobPostingForm({ onSuccess }: { onSuccess?: () => void }) {
  const create = useCreateJobPosting();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || !company.trim() || !recruiterEmail.trim() || !description.trim()) {
      notifyValidation("Title, company, recruiter email, and description are required.");
      return;
    }

    try {
      await create.mutateAsync({
        title,
        company,
        location: location || null,
        recruiterName: recruiterName || null,
        recruiterEmail,
        description,
        status: "OPEN",
      });
      toast.success("Job posted successfully.");
      setTitle("");
      setCompany("");
      setLocation("");
      setRecruiterName("");
      setRecruiterEmail("");
      setDescription("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post job.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="job-title">Job title</Label>
        <Input
          id="job-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Marketing Intern"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-company">Company</Label>
        <Input
          id="job-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-location">Location</Label>
        <Input
          id="job-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Pune / Remote"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-recruiter-name">Recruiter name</Label>
        <Input
          id="job-recruiter-name"
          value={recruiterName}
          onChange={(e) => setRecruiterName(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-recruiter-email">Recruiter email</Label>
        <Input
          id="job-recruiter-email"
          type="email"
          value={recruiterEmail}
          onChange={(e) => setRecruiterEmail(e.target.value)}
          placeholder="recruiter@company.com"
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="job-description">Description</Label>
        <Textarea
          id="job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Role summary, requirements, and how to apply…"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Posting…" : "Post job"}
        </Button>
      </div>
    </form>
  );
}
