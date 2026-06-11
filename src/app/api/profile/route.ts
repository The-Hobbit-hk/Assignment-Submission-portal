import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { jsonCached } from "@/lib/api-response";
import { serializeMemberListItem } from "@/lib/member";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const email = session!.user.email;
    if (!email) {
      return jsonCached({ user: session!.user, member: null }, { maxAge: 300 });
    }

    const member = await prisma.member.findFirst({
      where: { email },
      include: { club: { select: { id: true, name: true } } },
    });

    return jsonCached(
      {
        user: session!.user,
        member: member ? serializeMemberListItem(member) : null,
      },
      { maxAge: 300 }
    );
  } catch {
    return jsonCached({ error: "Failed to load profile." }, { status: 500, maxAge: 0 });
  }
}
