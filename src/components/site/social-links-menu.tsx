"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Share2 } from "lucide-react";
import { SOCIAL_LINKS } from "@/config/site-navigation";
import { SocialIcon } from "@/components/site/social-links";
import { cn } from "@/lib/utils";

export function SocialLinksMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:text-accent xl:px-3"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Follow us on social media"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">Follow</span>
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close social links menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 min-w-[11.5rem] pt-2">
            <div className="depth-popover rounded-xl py-1.5" role="menu">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  <SocialIcon label={social.label} className="h-4 w-4 shrink-0" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
