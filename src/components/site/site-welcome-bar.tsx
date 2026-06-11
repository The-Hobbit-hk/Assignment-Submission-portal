"use client";

import { Sparkles } from "lucide-react";
import { getSiteWelcomeMessage } from "@/lib/site-page-messages";

export function SiteWelcomeBar({ pathname }: { pathname: string }) {
  const message = getSiteWelcomeMessage(pathname);

  return (
    <div className="site-welcome-bar border-b border-accent/10 bg-gradient-to-r from-rose-50/90 via-white to-indigo-50/80">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center lg:px-8">
        <Sparkles className="site-welcome-spark h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
        <p className="site-welcome-text text-xs font-medium tracking-wide text-zinc-700 sm:text-sm">
          {message}
        </p>
        <Sparkles
          className="site-welcome-spark hidden h-3.5 w-3.5 shrink-0 text-accent sm:block"
          aria-hidden
        />
      </div>
    </div>
  );
}
