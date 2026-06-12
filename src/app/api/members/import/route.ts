import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity";
import { handleRouteError, apiError, notFound } from "@/lib/api-errors";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/("([^"]|"")*"|[^,]*)/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((header, j) => {
      row[header] = (values[j] ?? "").replace(/^"|"$/g, "").replace(/""/g, '"').trim();
    });
    if (row.email) rows.push(row);
  }

  return rows;
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clubId = formData.get("clubId") as string | null;

    if (!file || !clubId) {
      return apiError("File and clubId are required.", 400);
    }

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return notFound("Club not found.");
    }

    const text = await file.text();
    const rows = parseCSV(text);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const email = row.email;
      if (!email || !row.firstName || !row.lastName) {
        skipped++;
        continue;
      }

      const existing = await prisma.member.findUnique({
        where: { email_clubId: { email, clubId } },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.member.create({
        data: {
          clubId,
          firstName: row.firstName,
          lastName: row.lastName,
          email,
          phone: row.phone || undefined,
          role: (row.role as "MEMBER") || "MEMBER",
          status: (row.status as "ACTIVE") || "ACTIVE",
          riId: row.riId || undefined,
          profession: row.profession || undefined,
          points: parseInt(row.points ?? "0", 10) || 0,
        },
      });
      imported++;
    }

    await logActivity({
      type: "MEMBER_JOINED",
      title: `Bulk import: ${imported} members added to ${club.name}`,
      description: `${skipped} records skipped`,
      clubId,
      userId: session!.user.id,
    });

    return NextResponse.json({ imported, skipped, total: rows.length });
  } catch (err) {
    return handleRouteError(err, "Failed to import members.");
  }
}
