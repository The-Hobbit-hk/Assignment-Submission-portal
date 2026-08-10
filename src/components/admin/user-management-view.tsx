"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Copy, KeyRound, Search, ShieldAlert } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ADMIN_USER_ROLE_OPTIONS,
  useAdminUsers,
  useResetUserPassword,
} from "@/hooks/use-admin-users";
import { canResetUserPassword, formatUserRole, type ManagedUser } from "@/lib/admin-users";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import type { UserRole } from "@/types/auth";

function PasswordStatusBadge({ user }: { user: ManagedUser }) {
  if (!user.hasPassword) {
    return <Badge variant="outline">No password</Badge>;
  }
  if (user.mustChangePassword) {
    return <Badge variant="warning">Must reset on login</Badge>;
  }
  return <Badge variant="success">Password set</Badge>;
}

export function UserManagementView() {
  const { data: session } = useSession();
  const actorRole = (session?.user?.role ?? "MEMBER") as UserRole;

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [confirmUser, setConfirmUser] = useState<ManagedUser | null>(null);
  const [resultCreds, setResultCreds] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const filters = useMemo(
    () => ({ search, role, passwordStatus, page, limit: 25 }),
    [search, role, passwordStatus, page]
  );

  const { data, isLoading, isError } = useAdminUsers(filters);
  const resetMutation = useResetUserPassword();

  async function handleReset() {
    if (!confirmUser) return;
    try {
      const result = await resetMutation.mutateAsync({ userId: confirmUser.id });
      setConfirmUser(null);
      setResultCreds({
        email: result.user.email,
        temporaryPassword: result.temporaryPassword,
      });
      toast.success("Password reset. Share the temporary password securely.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reset password."));
    }
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title="User Management"
        subtitle="Reset portal passwords and see who still must change password after first login."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total users
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {data?.summary.totalUsers ?? "—"}
          </p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Must reset on login
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">
            {data?.summary.mustChangeCount ?? "—"}
          </p>
        </div>
        <div className="depth-card rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Showing
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {data?.pagination.total ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <form
          className="relative min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email, or club…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          {ADMIN_USER_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={passwordStatus}
          onChange={(e) => {
            setPasswordStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All password states</option>
          <option value="must_change">Must reset on login</option>
          <option value="ready">Password set</option>
          <option value="no_password">No password</option>
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load users.</p>
      ) : !data?.data.length ? (
        <p className="rounded-xl border border-border/50 py-10 text-center text-sm text-muted-foreground">
          No users match these filters.
        </p>
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Club</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password status</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user) => {
                const canReset = canResetUserPassword(actorRole, user.role);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {user.name ?? "Unnamed"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {user.clubName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatUserRole(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <PasswordStatusBadge user={user} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canReset || resetMutation.isPending}
                        onClick={() => setConfirmUser(user)}
                        title={
                          canReset
                            ? "Reset password"
                            : "You cannot reset this account"
                        }
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={Boolean(confirmUser)} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password?</DialogTitle>
            <DialogDescription>
              This sets a temporary password for{" "}
              <span className="font-medium text-foreground">
                {confirmUser?.name ?? confirmUser?.email}
              </span>{" "}
              and marks them as <strong>Must reset on login</strong>. Share the temporary password
              privately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              They will be forced to choose a new password the next time they sign in.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleReset} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? "Resetting…" : "Reset password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resultCreds)} onOpenChange={(open) => !open && setResultCreds(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Temporary password ready
            </DialogTitle>
            <DialogDescription>
              Copy and send these credentials to the user. They must change the password on first
              login.
            </DialogDescription>
          </DialogHeader>
          {resultCreds && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Email</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="break-all text-sm">{resultCreds.email}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyText("Email", resultCreds.email)}
                    aria-label="Copy email"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Temporary password</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="break-all text-sm">{resultCreds.temporaryPassword}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyText("Password", resultCreds.temporaryPassword)}
                    aria-label="Copy password"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setResultCreds(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
