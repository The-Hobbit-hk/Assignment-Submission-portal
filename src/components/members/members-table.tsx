"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberRoleBadge, MemberStatusBadge, MemberDuesBadge } from "@/components/members/member-status-badge";
import { useDeleteMember } from "@/hooks/use-members";
import type { MemberListItem } from "@/types/member";

interface MembersTableProps {
  members: MemberListItem[];
  isLoading?: boolean;
}

export function MembersTable({ members, isLoading }: MembersTableProps) {
  const deleteMutation = useDeleteMember();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 py-12 text-center text-muted-foreground">
        No members found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden md:table-cell">Club</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dues</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Link
                  href={`/dashboard/members/${member.id}`}
                  className="flex items-center gap-3 hover:text-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-xs">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {member.club.name}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <MemberRoleBadge role={member.role} />
              </TableCell>
              <TableCell>
                <MemberStatusBadge status={member.status} />
              </TableCell>
              <TableCell>
                <MemberDuesBadge duesPaid={member.duesPaid} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/members/${member.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        View profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/members/${member.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this member?")) {
                          deleteMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
