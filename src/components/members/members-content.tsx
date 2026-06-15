"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { MemberFiltersBar } from "@/components/members/member-filters";
import { MembersTable } from "@/components/members/members-table";
import { ImportExportDialog } from "@/components/members/import-export-dialog";
import { useMembers } from "@/hooks/use-members";
import { useClubsList } from "@/hooks/use-clubs";
import { isClubUser } from "@/lib/roles";
import type { MemberFilters } from "@/types/member";
import type { UserRole } from "@/types/auth";

export function MembersContent() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const clubUser = isClubUser(role);
  const ownClubId = clubUser ? session?.user?.clubId ?? undefined : undefined;

  const searchParams = useSearchParams();
  const initialClubId = ownClubId ?? searchParams.get("clubId") ?? undefined;
  const [filters, setFilters] = useState<MemberFilters>({
    page: 1,
    limit: 10,
    clubId: initialClubId,
  });
  const { data, isLoading } = useMembers(filters);
  const { data: clubsData } = useClubsList({ limit: 100 }, { enabled: !clubUser });

  const clubs = useMemo(() => {
    if (clubUser && ownClubId) {
      const clubName =
        data?.data.find((member) => member.club.id === ownClubId)?.club.name ??
        "Your club";
      return [{ id: ownClubId, name: clubName }];
    }
    return clubsData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];
  }, [clubUser, ownClubId, clubsData?.data, data?.data]);

  const addMemberHref = ownClubId
    ? `/dashboard/members/new?clubId=${ownClubId}`
    : "/dashboard/members/new";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {clubUser ? "Club Members" : "Members"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {clubUser
              ? "Add and manage members in your club."
              : "View and manage district and club members."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!clubUser && <ImportExportDialog clubs={clubs} />}
          <Button asChild>
            <Link href={addMemberHref}>
              <UserPlus className="h-4 w-4" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      <MemberFiltersBar
        filters={filters}
        onChange={setFilters}
        clubs={clubs}
        hideClubFilter={clubUser}
      />

      <MembersTable members={data?.data ?? []} isLoading={isLoading} />

      {data && data.pagination.totalPages > 1 && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      )}

      {data && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total} members
        </p>
      )}
    </div>
  );
}
