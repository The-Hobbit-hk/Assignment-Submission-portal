"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventForm } from "@/components/events/event-form";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useClubsList } from "@/hooks/use-clubs";
import { canManageEventRecord } from "@/lib/club-access";
import type { UserRole } from "@/types/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: event, isLoading } = useEvent(id);
  const update = useUpdateEvent(id);
  const { data: clubs } = useClubsList();

  if (isLoading || status === "loading") {
    return <Skeleton className="mx-auto h-96 max-w-2xl" />;
  }
  if (!event) return <p className="text-destructive">Not found.</p>;

  const canManage =
    !!session?.user &&
    canManageEventRecord(
      {
        role: session.user.role as UserRole,
        clubId: session.user.clubId,
      },
      event.clubId
    );

  if (!canManage) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/events/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">View only</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          You can view this event, but editing is limited to the host club and district event
          managers.
        </p>
        <Button asChild>
          <Link href={`/dashboard/events/${id}`}>Back to event</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/events/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Event</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            clubs={clubs?.data?.map((c) => ({ id: c.id, name: c.name })) ?? []}
            initial={event}
            submitLabel="Save Changes"
            onSubmit={async (data) => {
              await update.mutateAsync(data);
              router.push(`/dashboard/events/${id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
