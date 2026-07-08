"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { canViewEventPublicRegistrations } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

type PublicRegistration = {
  id: string;
  name: string;
  clubName: string;
  riId: string;
  registeredAt: string;
};

export function PublicEventRegistrationsPanel({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const role = session?.user?.role as UserRole | undefined;
  const canView = !!role && canViewEventPublicRegistrations(role);

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", eventId, "public-registrations"],
    queryFn: () =>
      apiJson<{
        registrations: PublicRegistration[];
        total: number;
      }>(`/api/events/${eventId}/public-registrations`),
    enabled: !!eventId && canView,
  });

  if (!canView) {
    return null;
  }

  const registrations = data?.registrations ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">
            Public registrations ({data?.total ?? 0})
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            On-site form submissions — visible to district admins only.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild disabled={!registrations.length}>
          <a href={`/api/events/${eventId}/public-registrations/export`}>
            <Download className="h-4 w-4" />
            Export Excel
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading submissions…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">Could not load registrations.</p>
        )}
        {!isLoading && !error && registrations.length === 0 && (
          <p className="text-sm text-muted-foreground">No public registrations yet.</p>
        )}
        <div className="space-y-2">
          {registrations.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-border/40 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium">
                  {r.name}{" "}
                  <Badge variant="outline" className="ml-1 font-normal">
                    {r.riId}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{r.clubName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.registeredAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/events/${eventId}/public-registrations/${r.id}/payment-proof`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Payment
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/events/${eventId}/public-registrations/${r.id}/government-id`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Govt ID
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
