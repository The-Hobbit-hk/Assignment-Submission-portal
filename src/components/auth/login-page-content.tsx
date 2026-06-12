"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getPortalMeta } from "@/config/portals";

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const portalId = searchParams.get("portal");
  const portal = getPortalMeta(portalId);

  return (
    <div className="depth-card w-full max-w-md rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">Sign in</h2>
        {portal ? (
          <p className="mt-1 text-sm text-accent">{portal.title} Portal</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">Welcome to Rotaract District 3131</p>
        )}
      </div>

      <LoginForm portal={portal} />

      <Link
        href="/"
        className="mt-6 inline-block text-xs text-zinc-500 hover:text-accent"
      >
        ← Back to home
      </Link>
    </div>
  );
}
