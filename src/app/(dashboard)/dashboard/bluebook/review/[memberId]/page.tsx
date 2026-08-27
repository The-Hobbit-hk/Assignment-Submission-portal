import { CouncilMemberReview } from "@/components/bluebook/council-member-review";

function safeOverviewReturn(from: string | undefined, month: number, year: number) {
  const fallback = `/dashboard/bluebook/council-overview?month=${month}&year=${year}`;
  if (!from) return fallback;
  try {
    const decoded = decodeURIComponent(from);
    if (
      decoded.startsWith("/dashboard/bluebook/council-overview") &&
      !decoded.includes("//") &&
      !decoded.includes(":")
    ) {
      return decoded;
    }
  } catch {
    // ignore malformed encoding
  }
  return fallback;
}

export default async function CouncilReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ month?: string; year?: string; from?: string }>;
}) {
  const { memberId } = await params;
  const sp = await searchParams;
  const now = new Date();
  const month = parseInt(sp.month ?? String(now.getMonth() + 1), 10);
  const year = parseInt(sp.year ?? String(now.getFullYear()), 10);

  return (
    <CouncilMemberReview
      memberId={memberId}
      month={month}
      year={year}
      returnTo={safeOverviewReturn(sp.from, month, year)}
    />
  );
}
