"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, FileBarChart2 } from "lucide-react";
import { ReportingWindowBanner } from "@/components/reporting/reporting-window-banner";

const links = [
  {
    href: "/dashboard/reporting/events",
    title: "Events Reporting",
    description:
      "Document club events, upload minutes and photos, and report district participation.",
    icon: CalendarDays,
    accent: "from-rose-500 to-accent",
    iconBg: "bg-rose-500/10 text-accent",
  },
  {
    href: "/dashboard/reporting/admin",
    title: "Admin Reporting",
    description:
      "Submit monthly club administration, finance, bylaws, and member updates.",
    icon: ClipboardList,
    accent: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
];

export function ReportingHub() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const periodLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="reporting-hero relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent shadow-sm">
            <FileBarChart2 className="h-3.5 w-3.5" />
            {periodLabel}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Monthly Reporting
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Club reporting for Rotaract District 3131. Tell the story of your work with proper
            proof and structure — events, administration, and member updates in one place.
          </p>
        </div>
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(217,30,92,0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      <ReportingWindowBanner month={month} year={year} />

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="depth-card depth-card-interactive group relative overflow-hidden rounded-2xl p-5 sm:p-6"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
            />
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${item.iconBg}`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="depth-btn-surface flex h-9 w-9 items-center justify-center rounded-full border-0">
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground group-hover:text-accent">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent opacity-0 transition group-hover:opacity-100">
                Open reporting →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="depth-card rounded-xl px-4 py-3 text-center text-xs text-muted-foreground sm:text-sm">
        Reporting is accepted from the <span className="font-medium text-foreground">1st to 10th</span>{" "}
        of each month. Use the links above when the window is open.
      </div>
    </div>
  );
}
