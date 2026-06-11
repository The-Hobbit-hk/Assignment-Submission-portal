"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { ClubsGrid } from "@/components/clubs/clubs-grid";
import { useClubsList } from "@/hooks/use-clubs";

export function ClubsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useClubsList({
    search: search || undefined,
    status,
    page,
    limit: 9,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clubs
          </h1>
          <p className="text-muted-foreground">
            Manage Rotaract clubs across District 3131.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clubs/new">
            <Building2 className="h-4 w-4" />
            Add Club
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PROVISIONAL">Provisional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ClubsGrid clubs={data?.data ?? []} isLoading={isLoading} />

      {data && data.pagination.totalPages > 1 && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
