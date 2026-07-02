"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClubForm } from "@/components/clubs/club-form";
import { ImageUpload } from "@/components/shared/image-upload";
import { useUpdateClub, useUploadClubLogo } from "@/hooks/use-clubs";
import type { ClubDetail } from "@/types/club";

interface ClubEditDialogProps {
  club: ClubDetail;
  /** District managers can edit every field; club logins edit their profile only. */
  fullControl?: boolean;
}

export function ClubEditDialog({ club, fullControl = false }: ClubEditDialogProps) {
  const [open, setOpen] = useState(false);
  const updateClub = useUpdateClub(club.id);
  const uploadLogo = useUploadClubLogo(club.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Edit club
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit club profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-medium">Club logo</p>
          <ImageUpload
            value={club.logo}
            shape="square"
            label="Upload logo"
            onUpload={async (file) => (await uploadLogo.mutateAsync(file)).logo}
          />
        </div>

        <ClubForm
          initialData={club}
          fullControl={fullControl}
          submitLabel="Save changes"
          onSubmit={async (data) => {
            await updateClub.mutateAsync(data);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
