import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClubProfile } from "@/components/clubs/club-profile";
import { canAccessClubRecord } from "@/lib/club-access";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Club Profile" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubProfilePage({ params }: PageProps) {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;
  const { id } = await params;

  if (!canAccessClubRecord({ role, clubId: session?.user?.clubId }, id)) {
    if (session?.user?.clubId) {
      redirect(`/dashboard/clubs/${session.user.clubId}`);
    }
    redirect("/dashboard");
  }

  return <ClubProfile clubId={id} />;
}
