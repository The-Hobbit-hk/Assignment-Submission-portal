import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DISTRICT_ZONE_META } from "@/lib/district-clubs-data";
import type { CommandCenterPayload } from "@/lib/district-command-center";
import type { RotaryMonthOption } from "@/lib/rotary-year";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function dash(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  return value;
}

function Kpi({
  label,
  value,
  detail,
  unavailable,
}: {
  label: string;
  value: string;
  detail: string;
  unavailable?: boolean;
}) {
  return (
    <section className="depth-card rounded-xl p-4" aria-label={label}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h2>
      <p className="mt-2 text-2xl font-bold text-foreground">{unavailable ? "—" : value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </section>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
      {message}
    </p>
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
    <div className="space-y-8">
      <PageHeading
        title="District Command Center"
        subtitle="Rotaract District 3131 | RIY 2026–27"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">Updated {data.generatedAtLabel} IST</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(data.citations?.page ?? 1)}>Refresh</Link>
            </Button>
          </div>
        }
      />

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Reporting period</span>
          <select
            name="period"
            defaultValue={periodValue}
            aria-label="Reporting period"
            className="flex h-9 w-full min-w-[12rem] rounded-md border border-input bg-background px-3 text-sm"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted-foreground sm:pb-2">
          {data.period.label}. Submission window {data.period.windowLabel} IST.
        </p>
        {filters.zone ? <input type="hidden" name="zone" value={filters.zone} /> : null}
        {filters.query ? <input type="hidden" name="q" value={filters.query} /> : null}
        <input type="hidden" name="sort" value={filters.sort} />
        <Button type="submit" size="sm" variant="secondary">
          Apply period
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
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
        <Link href={duesHref} className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <Kpi
            label="District dues flags"
            unavailable={data.errors.reporting}
            value={
              data.districtDues
                ? `${data.districtDues.clubsFullyMarkedPaid} paid`
                : "—"
            }
            detail={
              data.errors.reporting || !data.districtDues
                ? "District dues could not be loaded."
                : `${data.districtDues.clubsMarkedUnpaid} marked unpaid, ${data.districtDues.clubsNotMarked} not marked. Opens the district dues page.`
            }
          />
        </Link>
      </div>

      <section className="space-y-3" aria-labelledby="zone-reporting-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="zone-reporting-heading" className="text-base font-semibold">Zone reporting</h2>
            <p className="text-xs text-muted-foreground">
              Complete means both the admin report and the events report are submitted. Monthly reports are not approved or returned.
            </p>
          </div>
          <Link href={reportingHref} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
            Open club reports
          </Link>
        </div>
        {data.errors.reporting ? (
          <SectionError message="Zone reporting could not be loaded. The rest of this page is unchanged." />
        ) : (
          <div className="space-y-4">
            <ul className="grid gap-3 md:grid-cols-2">
              {(data.zones ?? []).map((zone) => (
                <li key={zone.zone}>
                  <Link
                    href={`${reportingHref}&zone=${encodeURIComponent(zone.zone)}`}
                    className="depth-card block rounded-xl p-3 hover:bg-accent/5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{zone.zone}</span>
                      <span className="text-sm tabular-nums">
                        {zone.completionPercent == null ? "No eligible clubs" : `${zone.completionPercent}%`}
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={
                        zone.completionPercent == null
                          ? `${zone.zone} has no eligible clubs`
                          : `${zone.zone} ${zone.completed} of ${zone.eligible} clubs complete, ${zone.completionPercent} percent`
                      }
                    >
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${zone.completionPercent ?? 0}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {zone.eligible} eligible · {zone.completed} complete · {zone.adminSubmitted} admin submitted · {zone.eventsSubmitted} events submitted · {zone.stillOpen} still open
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Eligible</TableHead>
                    <TableHead>Complete</TableHead>
                    <TableHead>Admin submitted</TableHead>
                    <TableHead>Events submitted</TableHead>
                    <TableHead>Still open</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.zones ?? []).map((zone) => (
                    <TableRow key={zone.zone}>
                      <TableCell>{zone.zone}</TableCell>
                      <TableCell>{zone.eligible}</TableCell>
                      <TableCell>{zone.completed}</TableCell>
                      <TableCell>{zone.adminSubmitted}</TableCell>
                      <TableCell>{zone.eventsSubmitted}</TableCell>
                      <TableCell>{zone.stillOpen}</TableCell>
                      <TableCell>{zone.completionPercent == null ? "—" : `${zone.completionPercent}%`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="depth-card space-y-3 rounded-xl p-4" aria-labelledby="ri-dues-heading">
          <h2 id="ri-dues-heading" className="text-base font-semibold">RI dues</h2>
          <p className="text-sm text-muted-foreground">
            Assessed, collected, and outstanding amounts are unavailable. The district does not store an RI dues ledger or a USD balance. Club progress for “100% payment of RI dues” is tracked only as a citation.
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Assessed</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Collected</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Outstanding</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Collection</dt>
              <dd>—</dd>
            </div>
          </dl>
          <Link href="/dashboard/citations/review" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
            Open citation review
          </Link>
        </section>

        <section className="depth-card space-y-3 rounded-xl p-4" aria-labelledby="district-dues-heading">
          <div className="flex items-start justify-between gap-3">
            <h2 id="district-dues-heading" className="text-base font-semibold">District dues</h2>
            <Link href={duesHref} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
              Open district dues
            </Link>
          </div>
          {data.errors.reporting || !data.districtDues ? (
            <SectionError message="District dues could not be loaded." />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Counts come from the admin report flag for {data.period.label}. There is no assessed amount, so collection percentage and outstanding balance are not calculated. Partial payments are not recorded.
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Marked paid</dt>
                  <dd className="text-lg font-semibold">{data.districtDues.clubsFullyMarkedPaid}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Marked unpaid</dt>
                  <dd className="text-lg font-semibold">{data.districtDues.clubsMarkedUnpaid}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Not marked</dt>
                  <dd className="text-lg font-semibold">{data.districtDues.clubsNotMarked}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Declared amount (INR)</dt>
                  <dd className="text-lg font-semibold">
                    {data.districtDues.declaredAmountAvailable && data.districtDues.declaredAmountInr != null
                      ? inr.format(data.districtDues.declaredAmountInr)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3" aria-labelledby="events-heading">
          <div className="flex items-end justify-between gap-2">
            <h2 id="events-heading" className="text-base font-semibold">Upcoming events</h2>
            <Link href="/dashboard/events" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
              Open events
            </Link>
          </div>
          {data.errors.events ? (
            <SectionError message="Upcoming events could not be loaded." />
          ) : data.upcomingEvents && data.upcomingEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No upcoming district events.
            </p>
          ) : (
            <ul className="space-y-2">
              {(data.upcomingEvents ?? []).map((event) => (
                <li key={event.id}>
                  <Link href={`/events/${event.id}`} className="depth-card flex gap-3 rounded-xl p-3 hover:bg-accent/5">
                    {event.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.bannerUrl} alt="" className="h-14 w-20 rounded-md object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
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

        <section className="space-y-3" aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="text-base font-semibold">Operational alerts</h2>
          {data.alerts == null ? (
            <SectionError message="Alerts could not be loaded." />
          ) : data.alerts.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
              No outstanding alerts for this period.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.alerts.map((alert) => (
                <li key={alert.id}>
                  <Link href={alert.href} className="depth-card block rounded-xl p-3 hover:bg-accent/5">
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
                      <span className="text-xs text-muted-foreground">{alert.category}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3" aria-labelledby="citations-heading">
        <div>
          <h2 id="citations-heading" className="text-base font-semibold">Club citation standings</h2>
          <p className="text-xs text-muted-foreground">
            {data.citations?.periodLabel ?? "RIY 2026–27"}. Approved points are the points already awarded. Pending means submitted and not yet reviewed. Rejected is the review outcome; there is no separate returned status. Equal approved points share a rank.
          </p>
        </div>
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <input type="hidden" name="period" value={periodValue} />
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Zone</span>
            <select
              name="zone"
              defaultValue={filters.zone}
              aria-label="Filter by zone"
              className="flex h-9 w-full min-w-[9rem] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All zones</option>
              {DISTRICT_ZONE_META.map((zone) => (
                <option key={zone.zone} value={zone.zone}>
                  {zone.zone}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Club</span>
            <input
              name="q"
              defaultValue={filters.query}
              aria-label="Search by club name"
              placeholder="Search club name"
              className="flex h-9 w-full min-w-[12rem] rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Sort</span>
            <select
              name="sort"
              defaultValue={filters.sort}
              aria-label="Sort citation standings"
              className="flex h-9 w-full min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="rank">Rank</option>
              <option value="points">Approved points</option>
              <option value="completion">Completion</option>
              <option value="pending">Pending criteria</option>
            </select>
          </label>
          <Button type="submit" size="sm" variant="secondary">
            Apply
          </Button>
        </form>
        {data.errors.citations || !data.citations ? (
          <SectionError message="Citation standings could not be loaded." />
        ) : data.citations.total === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No clubs match these filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Eligible points</TableHead>
                    <TableHead>Approved points</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Approved criteria</TableHead>
                    <TableHead>Applicable</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.citations.rows.map((row) => (
                    <TableRow key={row.clubId}>
                      <TableCell>{row.rank}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/citations/review?club=${row.clubId}`} className="font-medium hover:underline">
                          {row.clubName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.zone ?? "—"}</TableCell>
                      <TableCell>{row.eligiblePoints}</TableCell>
                      <TableCell>{row.approvedPoints}</TableCell>
                      <TableCell>{row.pendingCount}</TableCell>
                      <TableCell>{row.rejectedCount}</TableCell>
                      <TableCell>{row.approvedCount}</TableCell>
                      <TableCell>{row.applicableCount}</TableCell>
                      <TableCell>{row.completionPercent == null ? "—" : `${row.completionPercent}%`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                {data.citations.total} clubs · page {data.citations.page} of {pages}
              </p>
              <div className="flex gap-2">
                {data.citations.page > 1 ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageHref(data.citations.page - 1)}>Previous</Link>
                  </Button>
                ) : null}
                {data.citations.page < pages ? (
                  <Button variant="outline" size="sm" asChild>
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
