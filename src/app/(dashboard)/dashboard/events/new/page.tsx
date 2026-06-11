"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/events/event-form";
import { useCreateEvent } from "@/hooks/use-events";
import { useClubsList } from "@/hooks/use-clubs";

export default function NewEventPage() {
  const router = useRouter();
  const create = useCreateEvent();
  const { data: clubs } = useClubsList();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/events"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">Add Event</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
        <CardContent>
          <EventForm
            clubs={clubs?.data?.map((c) => ({ id: c.id, name: c.name })) ?? []}
            onSubmit={async (data) => {
              const e = await create.mutateAsync(data);
              router.push(`/dashboard/events/${e.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
