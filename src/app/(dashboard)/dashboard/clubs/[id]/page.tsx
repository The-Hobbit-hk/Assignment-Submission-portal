import { ClubProfile } from "@/components/clubs/club-profile";

export const metadata = { title: "Club Profile" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <ClubProfile clubId={id} />;
}
