import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { rewriteFileUrls } from "@/lib/storage/public-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
  });

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const result = await query(args);
          return rewriteFileUrls(result);
        },
      },
    },
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient() as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma;
