import { CouncilMemberReview } from "@/components/bluebook/council-member-review";

export default async function CouncilReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { memberId } = await params;
  const sp = await searchParams;
  const now = new Date();
  const month = parseInt(sp.month ?? String(now.getMonth() + 1), 10);
  const year = parseInt(sp.year ?? String(now.getFullYear()), 10);

  return <CouncilMemberReview memberId={memberId} month={month} year={year} />;
}
