import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClubsContent } from "@/components/clubs/clubs-content";
import { isClubUser } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Clubs" };

export default async function ClubsPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (isClubUser(role) && session?.user?.clubId) {
    redirect(`/dashboard/clubs/${session.user.clubId}`);
  }

  return <ClubsContent />;
}
