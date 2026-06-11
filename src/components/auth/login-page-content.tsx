"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PORTAL_OPTIONS, getPortalMeta } from "@/config/portals";

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const portalId = searchParams.get("portal");
  const portal = getPortalMeta(portalId);

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">Sign in</h2>
        {portal ? (
          <p className="mt-1 text-sm text-accent">{portal.title} Portal</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">Welcome to Rotaract District 3131</p>
        )}
      </div>

      <LoginForm portal={portal} />

      <div className="mt-8 space-y-3 border-t border-zinc-200 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Other portals
        </p>
        <div className="flex flex-wrap gap-2">
          {PORTAL_OPTIONS.filter((p) => p.id !== portalId).map((p) => (
            <Link
              key={p.id}
              href={`/login?portal=${p.id}`}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 transition hover:border-accent/40 hover:text-accent"
            >
              {p.title}
            </Link>
          ))}
        </div>
        <Link href="/" className="inline-block pt-1 text-xs text-zinc-500 hover:text-accent">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
