import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { UserManagementView } from "@/components/admin/user-management-view";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "User Management" };

export default async function UserManagementPage() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role as UserRole)) {
    redirect("/dashboard");
  }

  return <UserManagementView />;
}
