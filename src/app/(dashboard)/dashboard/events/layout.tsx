import { redirectIfZonalRepBlocked } from "@/lib/zonal-rep-access";

export default async function EventsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfZonalRepBlocked();
  return children;
}
