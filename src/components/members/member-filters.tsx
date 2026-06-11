"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberFilters } from "@/types/member";

interface MemberFiltersBarProps {
  filters: MemberFilters;
  onChange: (filters: MemberFilters) => void;
  clubs: { id: string; name: string }[];
}

export function MemberFiltersBar({
  filters,
  onChange,
  clubs,
}: MemberFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, RI ID..."
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      <Select
        value={filters.clubId ?? "all"}
        onValueChange={(v) =>
          onChange({ ...filters, clubId: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All clubs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clubs</SelectItem>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={club.id}>
              {club.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.role ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            role: v === "all" ? undefined : (v as MemberFilters["role"]),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="PRESIDENT">President</SelectItem>
          <SelectItem value="SECRETARY">Secretary</SelectItem>
          <SelectItem value="TREASURER">Treasurer</SelectItem>
          <SelectItem value="DIRECTOR">Director</SelectItem>
          <SelectItem value="MEMBER">Member</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            status: v === "all" ? undefined : (v as MemberFilters["status"]),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="ALUMNI">Alumni</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
