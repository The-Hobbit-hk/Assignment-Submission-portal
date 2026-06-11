"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportingFileUpload } from "@/components/reporting/reporting-file-upload";
import { YesNoSelect } from "@/components/reporting/yes-no-select";
import { useCreateMember } from "@/hooks/use-members";

const MEMBER_ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "PRESIDENT", label: "President" },
  { value: "SECRETARY", label: "Secretary" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "DIRECTOR", label: "Director" },
];

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

interface ManageReportingMemberFormProps {
  clubId: string;
  disabled?: boolean;
  onAdded?: () => void;
}

export function ManageReportingMemberForm({
  clubId,
  disabled,
  onAdded,
}: ManageReportingMemberFormProps) {
  const create = useCreateMember();
  const [error, setError] = useState("");
  const [duesPaid, setDuesPaid] = useState("no");
  const [duesProofFile, setDuesProofFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    riId: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "MEMBER",
    gender: "",
    dateOfBirth: "",
    profession: "",
    bloodGroup: "",
    whatsapp: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setForm({
      riId: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "MEMBER",
      gender: "",
      dateOfBirth: "",
      profession: "",
      bloodGroup: "",
      whatsapp: "",
    });
    setDuesPaid("no");
    setDuesProofFile(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.email.trim()) {
      setError("Member name and email are required.");
      return;
    }

    if (duesPaid === "yes" && !duesProofFile) {
      setError("Please upload proof of dues payment.");
      return;
    }

    try {
      const member = await create.mutateAsync({
        clubId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || form.firstName.trim(),
        email: form.email.trim(),
        role: form.role,
        riId: form.riId.trim() || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
        duesPaid,
        profession: form.profession.trim() || undefined,
        bloodGroup: form.bloodGroup.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
      });

      if (duesPaid === "yes" && duesProofFile && member?.id) {
        const fd = new FormData();
        fd.append("file", duesProofFile);
        const res = await fetch(`/api/members/${member.id}/dues-proof`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Failed to upload dues proof.");
        }
      }

      reset();
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border/40 bg-muted/50 p-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member RID</label>
          <Input
            value={form.riId}
            onChange={(e) => update("riId", e.target.value)}
            placeholder="Member RID"
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Name</label>
          <Input
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            placeholder="Member Name"
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Member Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter Email"
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Designation</label>
          <Select
            value={form.role}
            onValueChange={(v) => update("role", v)}
            disabled={disabled || create.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMBER_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Gender</label>
          <Select
            value={form.gender || undefined}
            onValueChange={(v) => update("gender", v)}
            disabled={disabled || create.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Date of birth</label>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Dues Paid?</label>
          <YesNoSelect
            value={duesPaid}
            onChange={(v) => {
              setDuesPaid(v);
              if (v !== "yes") setDuesProofFile(null);
            }}
          />
          {duesPaid === "yes" && (
            <ReportingFileUpload
              label="Upload proof of dues payment (max 5MB)"
              fileUrl={duesProofFile ? "pending" : null}
              disabled={disabled || create.isPending}
              onUpload={async (file) => setDuesProofFile(file)}
              onClear={() => setDuesProofFile(null)}
              pendingLabel={duesProofFile?.name}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Occupation</label>
          <Input
            value={form.profession}
            onChange={(e) => update("profession", e.target.value)}
            placeholder="Member Occupation"
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Member Blood Group</label>
          <Input
            value={form.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
            placeholder="Member Blood Group"
            disabled={disabled || create.isPending}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Member Whatsapp Number</label>
          <Input
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="Enter Whatsapp Number"
            disabled={disabled || create.isPending}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={disabled || create.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {create.isPending ? "Adding…" : "Add"}
        </Button>
        <Button type="button" variant="outline" onClick={reset} disabled={create.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
