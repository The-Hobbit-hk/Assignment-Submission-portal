"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, LayoutGrid, Map, Search } from "lucide-react";
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
import { ClubsByZoneView } from "@/components/clubs/clubs-by-zone-view";
import { ClubsGrid } from "@/components/clubs/clubs-grid";
import { useClubsList } from "@/hooks/use-clubs";
import { cn } from "@/lib/utils";

export function ClubsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [zone, setZone] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "zones">("zones");

  const listQuery = useClubsList({
    search: search || undefined,
    status,
    zone,
    page: view === "grid" ? page : 1,
    limit: view === "zones" ? 100 : 9,
  });

  const zonesForFilter = Array.from(
    new Set(
      (listQuery.data?.data ?? [])
        .map((c) => c.zone)
        .filter((z): z is string => Boolean(z?.trim()))
    )
  ).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Clubs</h1>
          <p className="text-muted-foreground">
            Manage Rotaract clubs across District 3131 — browse by zone or grid.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clubs/new">
            <Building2 className="h-4 w-4" />
            Add Club
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-lg border border-border/60 p-1">
          <button
            type="button"
            onClick={() => setView("zones")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
              view === "zones" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">By Zone</span>
            <span className="sm:hidden">Zones</span>
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
              view === "grid" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Grid</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
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
            value={zone ?? "all"}
            onValueChange={(v) => {
              setZone(v === "all" ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              {zonesForFilter.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {view === "zones" ? (
        <ClubsByZoneView clubs={listQuery.data?.data ?? []} isLoading={listQuery.isLoading} />
      ) : (
        <>
          <ClubsGrid clubs={listQuery.data?.data ?? []} isLoading={listQuery.isLoading} />
          {listQuery.data && listQuery.data.pagination.totalPages > 1 && (
            <Pagination
              page={listQuery.data.pagination.page}
              totalPages={listQuery.data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
