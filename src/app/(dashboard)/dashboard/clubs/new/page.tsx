"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubForm } from "@/components/clubs/club-form";
import { useCreateClub } from "@/hooks/use-clubs";

export default function NewClubPage() {
  const router = useRouter();
  const createMutation = useCreateClub();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clubs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Club</h1>
          <p className="text-muted-foreground">
            Register a new Rotaract club in the district.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ClubForm
            submitLabel="Create Club"
            onSubmit={async (data) => {
              const club = await createMutation.mutateAsync(data);
              router.push(`/dashboard/clubs/${club.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
