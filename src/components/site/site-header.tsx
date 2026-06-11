"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SITE_NAV, type SiteNavItem } from "@/config/site-navigation";
import { cn } from "@/lib/utils";

function NavDropdown({ item }: { item: SiteNavItem }) {
  const [open, setOpen] = useState(false);

  if (!item.children?.length) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-zinc-700 transition hover:text-accent"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[15rem] pt-2">
          <div className="rounded-md border border-zinc-200 bg-white py-2 shadow-lg">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href!}
                className="block px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-accent"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
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
          className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-zinc-700"
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
                className="block rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-accent"
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
      className="block rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-accent"
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-zinc-200",
        transparent ? "bg-white/90 backdrop-blur-md" : "bg-white shadow-sm"
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <BrandLogo variant="full" size="nav" priority />

        <nav className="hidden items-center gap-5 xl:flex">
          {SITE_NAV.map((item) =>
            item.children?.length ? (
              <NavDropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "text-sm transition hover:text-accent",
                  pathname === item.href ? "font-medium text-accent" : "text-zinc-700"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent/90 sm:inline-flex"
          >
            Login
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 xl:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-zinc-200 bg-white xl:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          {SITE_NAV.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              onClose={() => setMobileOpen(false)}
            />
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-2 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-white"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
