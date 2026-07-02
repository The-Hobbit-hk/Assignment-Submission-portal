"use client";

import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

export function ProfileContent() {
  const { data, isLoading } = useProfile();
  const member = data?.member;
  const user = data?.user;

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />;

  const displayName = member
    ? `Rtr. ${member.firstName} ${member.lastName}`
    : (user?.name ?? "District Member");

  const fields = [
    { label: "Designation", value: member?.role?.replace("_", " ") ?? "District Member" },
    { label: "Council ID", value: member?.riId ?? "—" },
    { label: "Contact No.", value: member?.phone ?? "—" },
    { label: "Email", value: member?.email ?? user?.email ?? "—" },
    { label: "Club Name", value: member?.club?.name ?? "—" },
    { label: "Blood Group", value: "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeading title="My Profile" />

      <div className="rounded-xl border border-border/40 bg-card/80 p-4 md:p-5">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:w-48">
            <Avatar className="h-28 w-28 border-2 border-border/40">
              <AvatarImage src={member?.avatar ?? user?.image ?? undefined} />
              <AvatarFallback className="bg-muted text-2xl">
                {displayName
                  .replace("Rtr. ", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="text-center text-lg font-semibold">{displayName}</p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.value}</p>
                </div>
              ))}
            </div>

            {member && (
              <div className="flex justify-center pt-2">
                <Button
                  asChild
                  className="bg-accent px-12 text-accent-foreground hover:bg-accent/90"
                >
                  <Link href={`/dashboard/members/${member.id}/edit`}>Edit</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
