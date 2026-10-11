import type { ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import type { CommandCenterPayload } from "@/lib/district-command-center";
import type { RotaryMonthOption } from "@/lib/rotary-year";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const fieldClass =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900";

function dash(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  return value;
}

function Kpi({
  label,
  value,
  detail,
  unavailable,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  unavailable?: boolean;
  icon: typeof Building2;
}) {
  return (
    <section className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5" aria-label={label}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-sm font-medium text-zinc-600">{label}</h2>
      </div>
      <p className="mt-4 text-2xl font-semibold leading-none text-zinc-950">
        {unavailable ? "—" : value}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{detail}</p>
    </section>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

function SectionTitle({
  id,
  title,
  detail,
  action,
}: {
  id: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-semibold text-zinc-950">
          {title}
        </h2>
        {detail ? <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-600">{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="shrink-0 text-sm font-medium text-accent underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function CommandCenterView({
  data,
  monthOptions,
  filters,
}: {
  data: CommandCenterPayload;
  monthOptions: RotaryMonthOption[];
  filters: { zone: string; query: string; sort: string };
}) {
  const periodValue = `${data.period.month}-${data.period.year}`;
  const reportingHref = `/dashboard/reporting/club-reports?month=${data.period.month}&year=${data.period.year}`;
  const duesHref = `/dashboard/reporting/district-dues?month=${data.period.month}&year=${data.period.year}`;
  const pages = data.citations ? Math.max(1, Math.ceil(data.citations.total / data.citations.pageSize)) : 1;

  function pageHref(page: number) {
    const params = new URLSearchParams({
      period: periodValue,
      sort: filters.sort,
      page: String(page),
    });
    if (filters.zone) params.set("zone", filters.zone);
    if (filters.query) params.set("q", filters.query);
    return `/dashboard/command-center?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 text-zinc-900 lg:px-2">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-zinc-950">District Command Center</h1>
          <p className="mt-1 text-sm text-zinc-600">Rotaract District 3131 | RIY 2026–27</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="min-w-[11rem] space-y-1">
              <span className="text-sm font-medium text-zinc-600">Reporting period</span>
              <select name="period" defaultValue={periodValue} aria-label="Reporting period" className={fieldClass}>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-600 sm:max-w-xs sm:pb-1">
              {data.period.label}. Window {data.period.windowLabel} IST.
            </p>
            {filters.zone ? <input type="hidden" name="zone" value={filters.zone} /> : null}
            {filters.query ? <input type="hidden" name="q" value={filters.query} /> : null}
            <input type="hidden" name="sort" value={filters.sort} />
            <Button type="submit">
              Apply period
            </Button>
          </form>
          <div className="flex items-center gap-2 sm:pb-0.5">
            <p className="text-sm text-zinc-600">Updated {data.generatedAtLabel} IST</p>
            <Button variant="outline" asChild>
              <Link href={pageHref(data.citations?.page ?? 1)}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Refresh
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Building2}
          label="Active clubs"
          unavailable={data.errors.clubs}
          value={String(dash(data.kpis.activeClubs))}
          detail={
            data.errors.clubs
              ? "Club totals could not be loaded."
              : `${dash(data.kpis.totalClubs)} official clubs on the district list`
          }
        />
        <Kpi
          icon={Users}
          label="Active Rotaractors"
          unavailable={data.errors.members}
          value={String(dash(data.kpis.activeRotaractors))}
          detail={
            data.errors.members
              ? "Membership totals could not be loaded."
              : "Active members of official clubs. Prospects, inactive, alumni, and the district council roster are excluded."
          }
        />
        <Kpi
          icon={ClipboardCheck}
          label="Reporting completion"
          unavailable={data.errors.reporting}
          value={data.kpis.reportingPercent == null ? "—" : `${data.kpis.reportingPercent}%`}
          detail={
            data.errors.reporting
              ? "Reporting totals could not be loaded."
              : data.kpis.reportingEligible
                ? `${data.kpis.reportingCompleted} of ${data.kpis.reportingEligible} active clubs submitted both reports`
                : "No eligible active clubs for this period."
          }
        />
        <Link
          href={duesHref}
          className="block h-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Kpi
            icon={Wallet}
            label="District dues status"
            unavailable={data.errors.reporting}
            value={data.districtDues ? `${data.districtDues.clubsFullyMarkedPaid} paid` : "—"}
            detail={
              data.errors.reporting || !data.districtDues
                ? "District dues could not be loaded."
                : `${data.districtDues.clubsMarkedUnpaid} marked unpaid, ${data.districtDues.clubsNotMarked} not marked. Opens district dues.`
            }
          />
        </Link>
      </div>

      <section className="space-y-4" aria-labelledby="zone-reporting-heading">
        <SectionTitle
          id="zone-reporting-heading"
          title="Zone reporting"
          detail="Complete means both the admin report and the events report are submitted. Monthly reports are not approved or returned."
          action={<TextLink href={reportingHref}>Open club reports</TextLink>}
        />
        {data.errors.reporting ? (
          <SectionError message="Zone reporting could not be loaded. The rest of this page is unchanged." />
        ) : (
          <div className="space-y-4">
            <ul className="grid gap-4 md:grid-cols-2">
              {(data.zones ?? []).map((zone) => (
                <li key={zone.zone} className="min-w-0">
                  <Link
                    href={`${reportingHref}&zone=${encodeURIComponent(zone.zone)}`}
                    className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-300"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-semibold text-zinc-950">{zone.zone}</span>
                      <span className="text-xl font-semibold tabular-nums text-zinc-950">
                        {zone.completionPercent == null ? "No eligible clubs" : `${zone.completionPercent}%`}
                      </span>
                    </div>
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100"
                      role="img"
                      aria-label={
                        zone.completionPercent == null
                          ? `${zone.zone} has no eligible clubs`
                          : `${zone.zone} ${zone.completed} of ${zone.eligible} clubs complete, ${zone.completionPercent} percent`
                      }
                    >
                      <div className="h-full bg-accent" style={{ width: `${zone.completionPercent ?? 0}%` }} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                      <div>
                        <dt className="text-zinc-400">Eligible</dt>
                        <dd className="font-medium tabular-nums text-zinc-800">{zone.eligible}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Complete</dt>
                        <dd className="font-medium tabular-nums text-zinc-800">{zone.completed}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Admin</dt>
                        <dd className="font-medium tabular-nums text-zinc-800">{zone.adminSubmitted}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Events</dt>
                        <dd className="font-medium tabular-nums text-zinc-800">{zone.eventsSubmitted}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Open</dt>
                        <dd className="font-medium tabular-nums text-zinc-800">{zone.stillOpen}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Zone reporting summary for {data.period.label}</caption>
                <thead>
                  <tr className="border-b border-zinc-200 text-sm text-zinc-600">
                    <th className="px-4 py-3 font-medium">Zone</th>
                    <th className="px-4 py-3 text-right font-medium">Eligible</th>
                    <th className="px-4 py-3 text-right font-medium">Complete</th>
                    <th className="px-4 py-3 text-right font-medium">Admin submitted</th>
                    <th className="px-4 py-3 text-right font-medium">Events submitted</th>
                    <th className="px-4 py-3 text-right font-medium">Still open</th>
                    <th className="px-4 py-3 text-right font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.zones ?? []).map((zone) => (
                    <tr key={zone.zone} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        <Link href={`${reportingHref}&zone=${encodeURIComponent(zone.zone)}`} className="hover:underline">
                          {zone.zone}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{zone.eligible}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{zone.completed}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{zone.adminSubmitted}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{zone.eventsSubmitted}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{zone.stillOpen}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {zone.completionPercent == null ? "—" : `${zone.completionPercent}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <section className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5" aria-labelledby="ri-dues-heading">
          <div className="flex items-start justify-between gap-3">
            <h2 id="ri-dues-heading" className="text-lg font-semibold text-zinc-950">
              RI dues
            </h2>
            <TextLink href="/dashboard/citations/review">Open citation review</TextLink>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            Monetary amounts are unavailable. This application does not keep an RI dues ledger or a USD balance, so assessed, collected, outstanding, and collection figures are not shown.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Club progress for “100% payment of RI dues” is tracked only as a citation, not as a payment.
          </p>
        </section>

        <section className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5" aria-labelledby="district-dues-heading">
          <div className="flex items-start justify-between gap-3">
            <h2 id="district-dues-heading" className="text-lg font-semibold text-zinc-950">
              District dues
            </h2>
            <TextLink href={duesHref}>Open district dues</TextLink>
          </div>
          {data.errors.reporting || !data.districtDues ? (
            <div className="mt-3">
              <SectionError message="District dues could not be loaded." />
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-zinc-600">{data.period.label} admin report flags</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <dt className="text-sm text-zinc-600">Marked paid</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">{data.districtDues.clubsFullyMarkedPaid}</dd>
                </div>
                <div className="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <dt className="text-sm text-zinc-600">Marked unpaid</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">{data.districtDues.clubsMarkedUnpaid}</dd>
                </div>
                <div className="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <dt className="text-sm text-zinc-600">Not marked</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">{data.districtDues.clubsNotMarked}</dd>
                </div>
                <div className="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <dt className="text-sm text-zinc-600">Declared amount</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">
                    {data.districtDues.declaredAmountAvailable && data.districtDues.declaredAmountInr != null
                      ? inr.format(data.districtDues.declaredAmountInr)
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                The declared amount is what clubs entered when they marked dues paid. There is no assessed total, so collection percentage and outstanding balance are not calculated. Partial payments are not recorded.
              </p>
            </>
          )}
        </section>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="space-y-4" aria-labelledby="events-heading">
          <SectionTitle
            id="events-heading"
            title="Upcoming events"
            action={<TextLink href="/dashboard/events">Open events</TextLink>}
          />
          {data.errors.events ? (
            <SectionError message="Upcoming events could not be loaded." />
          ) : data.upcomingEvents && data.upcomingEvents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 bg-white px-3 py-5 text-sm text-zinc-500">
              No upcoming district events.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
              {(data.upcomingEvents ?? []).map((event) => (
                <li key={event.id}>
                  <Link href={`/events/${event.id}`} className="flex gap-4 px-4 py-4 hover:bg-zinc-50">
                    {event.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.bannerUrl} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-zinc-950">{event.title}</p>
                      <p className="text-sm text-zinc-600">
                        {event.startLabel} · {event.timeLabel} IST
                        {event.venue ? ` · ${event.venue}` : ""}
                      </p>
                      <Badge variant="outline" className="mt-1">{event.status}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4" aria-labelledby="alerts-heading">
          <SectionTitle id="alerts-heading" title="Operational alerts" />
          {data.alerts == null ? (
            <SectionError message="Alerts could not be loaded." />
          ) : data.alerts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 bg-white px-3 py-5 text-sm text-zinc-500">
              No outstanding alerts for this period.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
              {data.alerts.map((alert) => (
                <li key={alert.id}>
                  <Link href={alert.href} className="block px-4 py-4 hover:bg-zinc-50">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          alert.severity === "overdue"
                            ? "destructive"
                            : alert.severity === "due_soon"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {alert.severity === "due_soon" ? "Due soon" : alert.severity === "overdue" ? "Overdue" : "Pending"}
                      </Badge>
                      <span className="text-sm text-zinc-600">{alert.category}</span>
                    </div>
                    <p className="mt-1 text-base font-medium text-zinc-950">{alert.title}</p>
                    <p className="text-sm text-zinc-600">{alert.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-4" aria-labelledby="citations-heading">
        <SectionTitle
          id="citations-heading"
          title="Club citation standings"
          detail={`${data.citations?.periodLabel ?? "RIY 2026–27"}. Approved points are already awarded. Pending means submitted and not yet reviewed. Rejected is the review outcome. Equal approved points share a rank.`}
        />
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <input type="hidden" name="period" value={periodValue} />
          <label className="min-w-[8.5rem] space-y-1">
            <span className="text-sm font-medium text-zinc-600">Zone</span>
            <select name="zone" defaultValue={filters.zone} aria-label="Filter by zone" className={fieldClass}>
              <option value="">All zones</option>
              {DISTRICT_ZONE_META.map((zone) => (
                <option key={zone.zone} value={zone.zone}>
                  {zone.zone}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[12rem] flex-1 space-y-1">
            <span className="text-sm font-medium text-zinc-600">Club</span>
            <input
              name="q"
              defaultValue={filters.query}
              aria-label="Search by club name"
              placeholder="Search club name"
              className={fieldClass}
            />
          </label>
          <label className="min-w-[10rem] space-y-1">
            <span className="text-sm font-medium text-zinc-600">Sort</span>
            <select name="sort" defaultValue={filters.sort} aria-label="Sort citation standings" className={fieldClass}>
              <option value="rank">Rank</option>
              <option value="points">Approved points</option>
              <option value="completion">Completion</option>
              <option value="pending">Pending criteria</option>
            </select>
          </label>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        {data.errors.citations || !data.citations ? (
          <SectionError message="Citation standings could not be loaded." />
        ) : data.citations.total === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-white px-3 py-5 text-sm text-zinc-500">
            No clubs match these filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <caption className="sr-only">Club citation standings</caption>
                <thead>
                  <tr className="border-b border-zinc-200 text-sm text-zinc-600">
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Club</th>
                    <th className="px-4 py-3 font-medium">Zone</th>
                    <th className="px-4 py-3 text-right font-medium">Eligible points</th>
                    <th className="px-4 py-3 text-right font-medium">Approved points</th>
                    <th className="px-4 py-3 text-right font-medium">Pending</th>
                    <th className="px-4 py-3 text-right font-medium">Rejected</th>
                    <th className="px-4 py-3 text-right font-medium">Approved criteria</th>
                    <th className="px-4 py-3 text-right font-medium">Applicable</th>
                    <th className="px-4 py-3 text-right font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.citations.rows.map((row) => (
                    <tr key={row.clubId} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                      <td className="px-4 py-3 tabular-nums">{row.rank}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/citations/review?club=${row.clubId}`} className="font-medium text-zinc-950 hover:underline">
                          {row.clubName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{row.zone ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.eligiblePoints}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.approvedPoints}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.pendingCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.rejectedCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.approvedCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.applicableCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.completionPercent == null ? "—" : `${row.completionPercent}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-zinc-500">
                {data.citations.total} clubs · page {data.citations.page} of {pages}
              </p>
              <div className="flex gap-2">
                {data.citations.page > 1 ? (
                  <Button variant="outline" asChild>
                    <Link href={pageHref(data.citations.page - 1)}>Previous</Link>
                  </Button>
                ) : null}
                {data.citations.page < pages ? (
                  <Button variant="outline" asChild>
                    <Link href={pageHref(data.citations.page + 1)}>Next</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
