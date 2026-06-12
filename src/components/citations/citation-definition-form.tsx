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
import { useCreateCitationDefinition } from "@/hooks/use-citations";
import type { CitationCadence } from "@/generated/prisma/client";
import { formErrorMessage, notifyValidation, toast } from "@/lib/toast";

interface CitationDefinitionFormProps {
  onSuccess?: () => void;
}

export function CitationDefinitionForm({ onSuccess }: CitationDefinitionFormProps) {
  const create = useCreateCitationDefinition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("10");
  const [cadence, setCadence] = useState<CitationCadence>("MONTHLY");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pts = parseInt(points, 10);
    if (!title.trim() || !Number.isFinite(pts) || pts < 1) {
      const msg = "Title and valid points are required.";
      setError(msg);
      notifyValidation(msg);
      return;
    }

    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        points: pts,
        cadence,
      },
      {
        onSuccess: () => {
          toast.success("Citation definition created");
          setTitle("");
          setDescription("");
          setPoints("10");
          setCadence("MONTHLY");
          onSuccess?.();
        },
        onError: (err) => setError(formErrorMessage(err, "Failed to create citation.")),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="citation-title">Title</Label>
        <Input
          id="citation-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Monthly bulletin submission"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="citation-description">Description</Label>
        <Textarea
          id="citation-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What clubs must complete for this citation"
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="citation-points">Points</Label>
          <Input
            id="citation-points"
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Cadence</Label>
          <Select value={cadence} onValueChange={(v) => setCadence(v as CitationCadence)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly (RIY)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={create.isPending} className="w-full sm:w-auto">
        {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Create citation
      </Button>
    </form>
  );
}
