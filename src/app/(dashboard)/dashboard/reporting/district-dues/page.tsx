import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";
import { DistrictDuesView } from "@/components/reporting/district-dues-view";

export const metadata = { title: "District Dues" };

export default async function DistrictDuesPage() {
  await redirectIfZonalRepBlocked();
  return <DistrictDuesView />;
}
