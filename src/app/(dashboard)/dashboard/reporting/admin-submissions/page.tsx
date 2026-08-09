import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";
import { AdminSubmissionsView } from "@/components/reporting/admin-submissions-view";

export const metadata = { title: "Admin Submissions" };

export default async function AdminSubmissionsPage() {
  await redirectIfZonalRepBlocked();
  return <AdminSubmissionsView />;
}
