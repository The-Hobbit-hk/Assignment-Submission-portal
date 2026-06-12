"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SocialLinks } from "@/components/site/social-links";
import { SITE_NAV, type SiteNavItem } from "@/config/site-navigation";
import { cn } from "@/lib/utils";

function NavDropdown({ item }: { item: SiteNavItem }) {
  const [open, setOpen] = useState(false);

  if (!item.children?.length) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-1 py-1.5 text-xs text-zinc-700 transition hover:text-accent lg:text-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 min-w-[15rem] pt-2">
            <div className="depth-popover rounded-xl py-2">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href!}
                  className="block px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: SiteNavItem;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (item.children?.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm text-zinc-700"
        >
          {item.label}
          <ChevronDown className={cn("h-4 w-4", open && "rotate-180")} />
        </button>
        {open && (
          <div className="ml-3 border-l border-zinc-200 pl-2">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href!}
                onClick={onClose}
                className="block rounded-md px-3 py-2.5 text-sm text-zinc-600 hover:text-accent"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      onClick={onClose}
      className="block rounded-md px-3 py-3 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-accent"
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "depth-nav fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80",
        transparent ? "bg-white/92 backdrop-blur-md" : "bg-white/98 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-[var(--site-header-height)] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 lg:px-8">
        <BrandLogo variant="full" size="nav" priority />

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-3 2xl:gap-4">
          {SITE_NAV.map((item) =>
            item.children?.length ? (
              <NavDropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "whitespace-nowrap rounded-md px-1 py-1.5 text-xs transition hover:text-accent xl:text-sm",
                  pathname === item.href ? "font-medium text-accent" : "text-zinc-700"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-2 lg:border-l lg:border-zinc-200/80 lg:pl-3 xl:gap-2.5 xl:pl-4">
          <Link
            href="/login"
            className="depth-btn-accent hidden rounded-full px-3.5 py-1.5 text-sm font-medium text-white sm:inline-flex lg:px-4 xl:px-5 xl:py-2"
          >
            Login
          </Link>
          <SocialLinks variant="compact" className="hidden lg:flex" />
          <button
            type="button"
            className="rounded-lg p-2.5 text-zinc-700 hover:bg-zinc-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-zinc-200 bg-white lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-h-[calc(100dvh-var(--site-header-height))] max-w-7xl flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-3 pb-6">
          {SITE_NAV.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              onClose={() => setMobileOpen(false)}
            />
          ))}
          <div className="mt-2 flex flex-col gap-3 sm:hidden">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="depth-btn-accent rounded-full px-5 py-3 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
            <SocialLinks className="justify-center" />
          </div>
        </nav>
      </div>
    </header>
  );
}
