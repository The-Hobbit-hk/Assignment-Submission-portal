"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { footerNavigation } from "@/config/navigation";
import { useRoleNavigation } from "@/hooks/use-navigation";
import { Separator } from "@/components/ui/separator";
import type { NavItem } from "@/types/navigation";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.href) {
    if (item.href === "/dashboard") return pathname === item.href;
    return pathname.startsWith(item.href);
  }
  return item.children?.some((child) => isItemActive(pathname, child)) ?? false;
}

function NavLink({
  item,
  pathname,
  onNavigate,
  nested,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  const Icon = item.icon;
  const active = item.href ? isItemActive(pathname, item) : false;

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md py-1.5 text-[13px] transition-colors",
        nested ? "px-2.5 pl-8" : "px-2.5",
        active
          ? "depth-nav-item-active text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:shadow-sm",
        item.disabled && "pointer-events-none opacity-40"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
      <span>{item.title}</span>
    </Link>
  );
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainNavigation = useRoleNavigation();

  return (
    <aside
      className={cn(
        "depth-sidebar flex h-full w-[var(--sidebar-width)] flex-col border-r border-border/60",
        className
      )}
    >
      <div className="flex h-[var(--navbar-height)] items-center border-b border-border/30 px-4">
        <BrandLogo variant="sidebar" href="/dashboard" onClick={onNavigate} />
      </div>

      <Separator className="bg-border/40" />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-1.5 py-2">
        {mainNavigation.map((item) => {
          if (item.children?.length) {
            const groupActive = isItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <div key={item.title} className="space-y-0.5">
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]",
                    groupActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="flex-1 font-medium">{item.title}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </div>
                <div className="space-y-0.5">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.href ?? child.title}
                      item={child}
                      pathname={pathname}
                      onNavigate={onNavigate}
                      nested
                    />
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.href ?? item.title}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Separator className="mb-2 bg-border/40" />
        {footerNavigation.map((item) => {
          const Icon = item.icon;

          if (item.action === "signout") {
            return (
              <button
                key={item.title}
                type="button"
                onClick={async () => {
                  onNavigate?.();
                  await signOut({ redirect: false });
                  router.push("/login");
                  router.refresh();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span>{item.title}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
