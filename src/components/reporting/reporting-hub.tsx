"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList } from "lucide-react";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";

const links = [
  {
    href: "/dashboard/reporting/events",
    title: "Events Reporting",
    description:
      "Document club events, upload minutes and photos, and report district participation.",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/reporting/admin",
    title: "Admin Reporting",
    description:
      "Submit monthly club administration, finance, bylaws, and member updates.",
    icon: ClipboardList,
  },
];

export function ReportingHub() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-foreground">
          Monthly Reporting
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Club reporting for Rotaract District 3131. Tell the story of your work with proper proof
          and structure.
        </p>
      </div>

      <ReportingWindowBanner month={month} year={year} />

      <div className="space-y-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground group-hover:text-accent">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </div>
  );
}
