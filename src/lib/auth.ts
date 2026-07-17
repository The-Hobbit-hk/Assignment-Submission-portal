import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types/auth";
import { clearRateLimit, isRateLimited, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type UserClaims = {
  clubId: string | null;
  role: UserRole;
  mustChangePassword: boolean;
};

/**
 * In-process cache of role/club claims. auth() runs the jwt callback on every
 * API call and page render; without this, each one is a user lookup. Server
 * instances stay warm on Vercel Fluid, so this cuts most of those queries.
 */
const CLAIMS_TTL_MS = 5 * 60 * 1000;
const claimsCache = new Map<string, { claims: UserClaims; expiresAt: number }>();

async function getUserClaims(userId: string): Promise<UserClaims | null> {
  const cached = claimsCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.claims;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { clubId: true, role: true, mustChangePassword: true },
  });
  if (!dbUser) return null;

  const claims: UserClaims = {
    clubId: dbUser.clubId ?? null,
    role: dbUser.role as UserRole,
    mustChangePassword: dbUser.mustChangePassword,
  };

  if (claimsCache.size > 2000) claimsCache.clear();
  claimsCache.set(userId, { claims, expiresAt: Date.now() + CLAIMS_TTL_MS });
  return claims;
}

/** Call after changing a user's role/club/password flags so auth() sees it immediately. */
export function invalidateUserClaims(userId: string) {
  claimsCache.delete(userId);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as UserRole;
        token.clubId = user.clubId ?? null;
        token.mustChangePassword = user.mustChangePassword ?? false;
        claimsCache.delete(user.id!);
      } else if (token.id) {
        const claims = await getUserClaims(token.id as string);
        if (claims) {
          token.clubId = claims.clubId;
          token.role = claims.role;
          token.mustChangePassword = claims.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.clubId = (token.clubId as string | null) ?? null;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const emailKey = email.toLowerCase().trim();

        const locked = isRateLimited(
          `login-fail:${emailKey}`,
          RATE_LIMITS.loginFailed.limit,
          RATE_LIMITS.loginFailed.windowMs
        );
        if (!locked.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: emailKey },
        });

        if (!user?.password) {
          rateLimit(
            `login-fail:${emailKey}`,
            RATE_LIMITS.loginFailed.limit,
            RATE_LIMITS.loginFailed.windowMs
          );
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          rateLimit(
            `login-fail:${emailKey}`,
            RATE_LIMITS.loginFailed.limit,
            RATE_LIMITS.loginFailed.windowMs
          );
          return null;
        }

        clearRateLimit(`login-fail:${emailKey}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          clubId: user.clubId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
