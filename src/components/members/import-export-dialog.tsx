"use client";

import { useRef, useState } from "react";
import { FileDown, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useImportMembers } from "@/hooks/use-members";

interface ImportExportDialogProps {
  clubs: { id: string; name: string }[];
}

export function ImportExportDialog({ clubs }: ImportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [clubId, setClubId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportMembers();

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file || !clubId) return;

    setResult(null);
    try {
      const res = await importMutation.mutateAsync({ file, clubId });
      setResult(`Imported ${res.imported} members (${res.skipped} skipped)`);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Import failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4" />
          Import / Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import / Export Members</DialogTitle>
          <DialogDescription>
            Export all members as CSV or import from a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export</Label>
            <Button variant="glass" asChild className="w-full">
              <a href="/api/members/export" download>
                <FileDown className="h-4 w-4" />
                Download CSV Export
              </a>
            </Button>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-4">
            <Label>Import CSV</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-accent/20 file:px-4 file:py-2 file:text-sm file:text-accent"
            />
            <Button
              onClick={handleImport}
              disabled={!clubId || importMutation.isPending}
              className="w-full"
            >
              {importMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Import Members
            </Button>
            {result && (
              <p className="text-sm text-muted-foreground">{result}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
