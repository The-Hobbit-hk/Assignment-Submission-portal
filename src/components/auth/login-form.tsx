"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortalId } from "@/config/portals";
import { reportError, toast } from "@/lib/toast";

type PortalMeta = {
  id: PortalId;
  title: string;
  description: string;
  loginHint: string;
} | null;

export function LoginForm({ portal }: { portal?: PortalMeta }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").trim(),
        redirect: false,
      });

      if (result?.error) {
        const err = result.error.toLowerCase();
        const rateLimited =
          err.includes("rate_limited") ||
          err.includes("too many") ||
          err.includes("accessdenied");
        setError(
          reportError(
            rateLimited
              ? "Too many failed login attempts for this account. Wait about 15 minutes, or ask a district admin to reset your password in User Management (that also clears the lockout)."
              : "Invalid email or password. Tip: paste carefully with no extra spaces. If an admin just reset you, use the temporary password, then change it when prompted."
          )
        );
        return;
      }

      toast.success("Signed in successfully");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(reportError(err, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {portal && <p className="text-sm text-muted-foreground">{portal.description}</p>}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={portal?.loginHint ?? "you@rotaract3131.org"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="animate-spin" />}
        Login
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
