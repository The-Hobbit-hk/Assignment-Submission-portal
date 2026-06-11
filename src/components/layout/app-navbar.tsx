"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-[var(--navbar-height)] items-center justify-between border-b border-border/40 bg-[#121214]/95 px-4 backdrop-blur-sm lg:px-6">
      <Sheet onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[var(--sidebar-width)] border-border/40 bg-[#121214] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden flex-1 lg:block" />

      <p className="truncate text-xs text-muted-foreground sm:text-sm">
        {session?.user?.email ?? "dsr@rotaract3131.org"}
      </p>
    </header>
  );
}
