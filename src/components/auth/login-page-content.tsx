"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/auth/login-form";
import { PORTAL_OPTIONS, getPortalMeta } from "@/config/portals";

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const portalId = searchParams.get("portal");
  const portal = getPortalMeta(portalId);

  return (
    <div className="flex min-h-screen bg-black">
      <div
        className="relative hidden w-[42%] flex-col justify-between border-r border-white/10 p-10 lg:flex"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 20%, rgba(217, 30, 92, 0.2), transparent 55%), #000",
        }}
      >
        <BrandLogo variant="full" size="lg" href="/" />
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold leading-tight text-white">
            District 3131 ERP
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            One platform for council bluebook tasks, club reporting, events, and
            district operations.
          </p>
        </div>
        <p className="text-xs text-white/35">© Rotaract District 3131</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 lg:hidden">
          <BrandLogo variant="full" size="md" href="/" />
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Sign in</h2>
            {portal ? (
              <p className="mt-1 text-sm text-accent">{portal.title} Portal</p>
            ) : (
              <p className="mt-1 text-sm text-white/50">
                Welcome to Rotaract District 3131
              </p>
            )}
          </div>

          <LoginForm portal={portal} />

          <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">
              Other portals
            </p>
            <div className="flex flex-wrap gap-2">
              {PORTAL_OPTIONS.filter((p) => p.id !== portalId).map((p) => (
                <Link
                  key={p.id}
                  href={`/login?portal=${p.id}`}
                  className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/65 transition hover:border-accent/40 hover:text-white"
                >
                  {p.title}
                </Link>
              ))}
            </div>
            <Link
              href="/"
              className="inline-block pt-1 text-xs text-white/45 hover:text-white"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
