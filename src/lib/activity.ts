import type { ActivityType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

interface LogActivityInput {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  memberId?: string;
  clubId?: string;
  userId?: string;
}

export async function logActivity(input: LogActivityInput) {
  return prisma.activity.create({ data: input });
}
