"use client";

import { usePathname } from "next/navigation";
import { SiteWelcomeBar } from "@/components/site/site-welcome-bar";

export function SitePageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="site-page-root">
      <SiteWelcomeBar pathname={pathname} />
      <div key={pathname} className="site-page-enter site-page-stagger">
        {children}
      </div>
    </div>
  );
}
