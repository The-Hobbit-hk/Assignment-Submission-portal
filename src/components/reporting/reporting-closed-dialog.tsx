"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportingClosedDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="depth-panel max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Reporting window is closed</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            {message ??
              "Submissions are accepted only from the 1st to the 10th of each month. Please return when the window opens."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <Button className="depth-btn-accent w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
