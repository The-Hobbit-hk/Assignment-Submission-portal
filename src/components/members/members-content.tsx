"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { MemberFiltersBar } from "@/components/members/member-filters";
import { MembersTable } from "@/components/members/members-table";
import { ImportExportDialog } from "@/components/members/import-export-dialog";
import { useMembers } from "@/hooks/use-members";
import { useClubsList } from "@/hooks/use-clubs";
import type { MemberFilters } from "@/types/member";

export function MembersContent() {
  const searchParams = useSearchParams();
  const initialClubId = searchParams.get("clubId") ?? undefined;
  const [filters, setFilters] = useState<MemberFilters>({
    page: 1,
    limit: 10,
    clubId: initialClubId,
  });
  const { data, isLoading } = useMembers(filters);
  const { data: clubsData } = useClubsList();

  const clubs = clubsData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Members
          </h1>
          <p className="text-xs text-muted-foreground">
            View and manage district and club members.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExportDialog clubs={clubs} />
          <Button asChild>
            <Link href="/dashboard/members/new">
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
