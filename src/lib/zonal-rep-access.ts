import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isZonalRepOnly, ZONAL_REP_HOME_PATH } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

/**
 * Redirect pure zonal reps away from club monthly reporting / events edit surfaces
 * back to their zone reporting dashboard.
 */
export async function redirectIfZonalRepBlocked() {
  const session = await auth();
  if (!session?.user) return;

  const role = session.user.role as UserRole;
  const email = session.user.email;
  if (isZonalRepOnly(role, email)) {
    redirect(ZONAL_REP_HOME_PATH);
  }
}
