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
import type { ClubDetail } from "@/types/club";

interface ClubFormProps {
  initialData?: Partial<ClubDetail>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
}

export function ClubForm({
  initialData,
  onSubmit,
  submitLabel = "Save Club",
}: ClubFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    charterNumber: initialData?.charterNumber ?? "",
    city: initialData?.city ?? "",
    zone: initialData?.zone ?? "",
    status: initialData?.status ?? "ACTIVE",
    description: initialData?.description ?? "",
    serviceHours: initialData?.serviceHours ?? 0,
  });

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({
        ...form,
        charterNumber: form.charterNumber || undefined,
        city: form.city || undefined,
        zone: form.zone || undefined,
        description: form.description || undefined,
        serviceHours: Number(form.serviceHours),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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

      <div className="space-y-2">
        <Label htmlFor="name">Club name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="charterNumber">Charter number</Label>
          <Input
            id="charterNumber"
            value={form.charterNumber}
            onChange={(e) => update("charterNumber", e.target.value)}
          />
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
              <SelectItem value="PROVISIONAL">Provisional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zone">Zone</Label>
          <Input
            id="zone"
            value={form.zone}
            onChange={(e) => update("zone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
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
