"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppNavbar() {
  const { data: session } = useSession();
  const { setMobileSidebarOpen } = useUIStore();

  return (
    <header className="depth-nav sticky top-0 z-40 flex h-[var(--navbar-height)] items-center gap-2 border-b border-border/60 bg-white/95 px-3 backdrop-blur-md sm:gap-3 lg:px-4">
      <Sheet onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100vw,var(--sidebar-width))] border-border bg-white p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1 lg:hidden">
        <BrandLogo variant="full" size="nav" linked={false} className="max-h-9 w-auto" />
      </div>

      <p className="hidden max-w-[40%] truncate text-xs text-muted-foreground sm:block sm:max-w-none sm:text-sm lg:ml-auto">
        {session?.user?.email ?? "dsr@rotaract3131.org"}
      </p>
    </header>
  );
}
