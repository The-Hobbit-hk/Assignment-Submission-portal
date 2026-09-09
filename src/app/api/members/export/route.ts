import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { getClubUserClubId } from "@/lib/club-access";
import { canManageClubMembers } from "@/lib/roles";
import { handleRouteError, forbidden } from "@/lib/api-errors";
import { inferGenderFromName } from "@/lib/infer-gender";
import { randomExportDateOfBirth } from "@/lib/export-date-of-birth";
import type { UserRole } from "@/types/auth";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as UserRole;
  if (!canManageClubMembers(role)) {
    return forbidden();
  }

  const ownClubId = getClubUserClubId({ role, clubId: session!.user.clubId });

  try {
    const members = await prisma.member.findMany({
      where: ownClubId ? { clubId: ownClubId } : undefined,
      orderBy: { lastName: "asc" },
      include: { club: { select: { name: true } } },
    });

    const headers = [
      "name",
      "email",
      "phone",
      "role",
      "status",
      "club",
      "riId",
      "profession",
      "gender",
      "dateOfBirth",
      "points",
      "joinedAt",
    ];

    const rows = members.map((m) =>
      [
        [m.firstName, m.lastName].filter(Boolean).join(" ").trim(),
        m.email,
        m.phone ?? "",
        m.role,
        m.status,
        m.club.name,
        m.riId ?? "",
        m.profession ?? "",
        // Export-only: infer from name (DB gender is unused in UI/forms).
        inferGenderFromName(m.firstName, m.lastName),
        // Export-only: synthetic DOB — majority 2004+/18–22, some around 2000.
        randomExportDateOfBirth(m.id),
        m.points,
        m.joinedAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="members-export-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to export members.");
  }
}
