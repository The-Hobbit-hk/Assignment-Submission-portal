import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CommandCenterView } from "@/components/command-center/command-center-view";
import { getDistrictCommandCenter } from "@/lib/district-command-center";
import { getActiveReportPeriod } from "@/lib/reporting";
import { canViewDistrictCommandCenter } from "@/lib/roles";
import { getCurrentRotaryYear, rotaryMonthOptions, withMonthOption } from "@/lib/rotary-year";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "District Command Center" };

const SORTS = ["rank", "points", "completion", "pending"] as const;

export default async function DistrictCommandCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; zone?: string; q?: string; sort?: string; page?: string }>;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  if (!canViewDistrictCommandCenter(role, session?.user?.email)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const active = getActiveReportPeriod();
  const optionOpts = { long: true, withYear: true } as const;
  const monthOptions = withMonthOption(
    rotaryMonthOptions(getCurrentRotaryYear().startYear, optionOpts),
    active.month,
    active.year,
    optionOpts
  );

  const [rawMonth, rawYear] = (params.period ?? `${active.month}-${active.year}`).split("-").map(Number);
  const known = monthOptions.some((option) => option.value === `${rawMonth}-${rawYear}`);
  const month = known ? rawMonth : active.month;
  const year = known ? rawYear : active.year;
  const sort = SORTS.includes(params.sort as (typeof SORTS)[number]) ? (params.sort as (typeof SORTS)[number]) : "rank";
  const page = Number.parseInt(params.page ?? "1", 10);

  const data = await getDistrictCommandCenter({
    month,
    year,
    zone: params.zone || undefined,
    query: params.q,
    sort,
    page: Number.isFinite(page) ? page : 1,
  });

  return (
    <CommandCenterView
      data={data}
      monthOptions={monthOptions}
      filters={{ zone: params.zone ?? "", query: params.q ?? "", sort }}
    />
  );
}
