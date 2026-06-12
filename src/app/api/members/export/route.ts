import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { handleRouteError } from "@/lib/api-errors";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const members = await prisma.member.findMany({
      orderBy: { lastName: "asc" },
      include: { club: { select: { name: true } } },
    });

    const headers = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "role",
      "status",
      "club",
      "riId",
      "profession",
      "points",
      "joinedAt",
    ];

    const rows = members.map((m) =>
      [
        m.firstName,
        m.lastName,
        m.email,
        m.phone ?? "",
        m.role,
        m.status,
        m.club.name,
        m.riId ?? "",
        m.profession ?? "",
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
