"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ImageUpload } from "@/components/shared/image-upload";
import { useUploadMemberAvatar } from "@/hooks/use-members";
import type { MemberDetail } from "@/types/member";
import { formErrorMessage, toast } from "@/lib/toast";

interface MemberFormProps {
  clubs: { id: string; name: string }[];
  initialData?: Partial<MemberDetail>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  lockClubId?: string;
  /** When editing an existing member, enables the profile-photo uploader. */
  memberId?: string;
  /** Self-service edit: hide club / role / status controls. */
  selfRestricted?: boolean;
}

export function MemberForm({
  clubs,
  initialData,
  onSubmit,
  submitLabel = "Save Member",
  lockClubId,
  memberId,
  selfRestricted = false,
}: MemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const uploadAvatar = useUploadMemberAvatar(memberId ?? "");
  const [form, setForm] = useState({
    clubId: lockClubId ?? initialData?.club?.id ?? "",
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    role: initialData?.role ?? "MEMBER",
    status: initialData?.status ?? "ACTIVE",
    riId: initialData?.riId ?? "",
    profession: initialData?.profession ?? "",
    bio: initialData?.bio ?? "",
    points: initialData?.points ?? 0,
  });

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        riId: form.riId || undefined,
        profession: form.profession || undefined,
        bio: form.bio || undefined,
      };
      if (!selfRestricted) {
        payload.clubId = form.clubId;
        payload.role = form.role;
        payload.status = form.status;
        payload.points = Number(form.points);
      }
      await onSubmit(payload);
      toast.success(
        initialData?.id ? "Member updated successfully" : "Member created successfully"
      );
    } catch (err) {
      setError(formErrorMessage(err, "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {memberId && (
        <div className="space-y-2">
          <Label>Profile photo</Label>
          <ImageUpload
            value={initialData?.avatar}
            shape="circle"
            label="Upload photo"
            onUpload={async (file) => (await uploadAvatar.mutateAsync(file)).avatar}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Club</Label>
          {lockClubId ? (
            <Input
              value={clubs.find((club) => club.id === lockClubId)?.name ?? "Your club"}
              disabled
            />
          ) : (
            <Select
              value={form.clubId}
              onValueChange={(v) => update("clubId", v)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="riId">RI ID</Label>
          {form.status === "PROSPECTIVE" ? (
            <Input
              id="riId"
              value="Auto-generated Prospective ID"
              disabled
              className="bg-zinc-50 text-zinc-500 italic"
            />
          ) : (
            <Input
              id="riId"
              value={form.riId}
              onChange={(e) => update("riId", e.target.value)}
            />
          )}
        </div>
      </div>

      <div className={selfRestricted ? "space-y-2" : "grid gap-4 sm:grid-cols-3"}>
        {!selfRestricted && (
          <>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESIDENT">President</SelectItem>
                  <SelectItem value="SECRETARY">Secretary</SelectItem>
                  <SelectItem value="TREASURER">Treasurer</SelectItem>
                  <SelectItem value="DIRECTOR">Director</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={form.profession}
            onChange={(e) => update("profession", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
