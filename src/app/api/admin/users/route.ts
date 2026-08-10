import { NextResponse } from "next/server";
import type { Prisma, UserRole as PrismaUserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { DISTRICT_ROLES, canManageUsers } from "@/lib/roles";
import { serializeManagedUser } from "@/lib/admin-users";
import { getPaginationParams, buildPaginatedResult } from "@/lib/pagination";
import { handleRouteError, forbidden } from "@/lib/api-errors";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

const ALL_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "DISTRICT_ADMIN",
  "DISTRICT_SECRETARY",
  "REPORTING_SECRETARY",
  "COUNCIL_MEMBER",
  "CLUB_PRESIDENT",
  "CLUB_SECRETARY",
  "MEMBER",
];

export async function GET(request: Request) {
  const { session, error } = await requireRole([...DISTRICT_ROLES]);
  if (error) return error;

  if (!canManageUsers(session!.user.role as UserRole)) {
    return forbidden();
  }

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams, 25);
    const search = searchParams.get("search")?.trim() ?? "";
    const role = searchParams.get("role")?.trim() ?? "";
    const passwordStatus = searchParams.get("passwordStatus")?.trim() ?? "all";

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { club: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (role && ALL_ROLES.includes(role as UserRole)) {
      where.role = role as PrismaUserRole;
    }

    if (passwordStatus === "must_change") {
      where.mustChangePassword = true;
      where.password = { not: null };
    } else if (passwordStatus === "ready") {
      where.mustChangePassword = false;
      where.password = { not: null };
    } else if (passwordStatus === "no_password") {
      where.password = null;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: [{ mustChangePassword: "desc" }, { name: "asc" }, { email: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          clubId: true,
          password: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
          club: { select: { name: true } },
        },
      }),
    ]);

    const data = users.map((user) =>
      serializeManagedUser({
        ...user,
        role: user.role as UserRole,
      })
    );

    const mustChangeCount = await prisma.user.count({
      where: { mustChangePassword: true, password: { not: null } },
    });

    return NextResponse.json({
      ...buildPaginatedResult(data, total, page, limit),
      summary: {
        mustChangeCount,
        totalUsers: await prisma.user.count(),
      },
    });
  } catch (err) {
    return handleRouteError(err, "Failed to load users.");
  }
}
