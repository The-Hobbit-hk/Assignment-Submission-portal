import { MemberProfileCard } from "@/components/members/member-profile-card";

export const metadata = { title: "Member Profile" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <MemberProfileCard memberId={id} />;
}
