"use client";

import Link from "next/link";
import { KeyRound, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Self-serve email reset is not wired yet. Clubs must use the temporary password
 * from district admin (User Management) — the previous fake "email sent" flow
 * caused many "wrong password" reports after clubs thought they had reset.
 */
export function ForgotPasswordForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Club portal passwords are reset by district admins — not by email yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="space-y-1 text-foreground">
            <p className="font-medium">Contact your district admin or ZR</p>
            <p className="text-muted-foreground">
              Ask them to open <strong>User Management</strong> and click{" "}
              <strong>Reset</strong> for your club login. They will get a temporary
              password to share with you.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            After login with the temporary password, you will be asked to set your own
            password. Use that new password from then on — not the temporary one.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
