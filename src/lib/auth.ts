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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Strip copy/paste junk that commonly breaks bcrypt compares. */
function normalizePassword(value: string) {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
}

export function loginFailKey(email: string) {
  return `login-fail:${normalizeEmail(email)}`;
}

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

/** Clear failed-login lockout after an admin password reset. */
export function clearLoginFailLimit(email: string) {
  clearRateLimit(loginFailKey(email));
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
        const rawEmail =
          typeof credentials?.email === "string" ? normalizeEmail(credentials.email) : "";
        const rawPassword =
          typeof credentials?.password === "string"
            ? normalizePassword(credentials.password)
            : "";

        const parsed = credentialsSchema.safeParse({
          email: rawEmail,
          password: rawPassword,
        });
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const failKey = loginFailKey(email);

        const locked = isRateLimited(
          failKey,
          RATE_LIMITS.loginFailed.limit,
          RATE_LIMITS.loginFailed.windowMs
        );
        if (!locked.success) {
          // Distinct from wrong-password so the login form can show a clear message.
          throw new Error("RATE_LIMITED");
        }

        // Prefer exact match (emails are stored lowercased), then insensitive fallback.
        let user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });
        }

        if (!user?.password) {
          rateLimit(
            failKey,
            RATE_LIMITS.loginFailed.limit,
            RATE_LIMITS.loginFailed.windowMs
          );
          return null;
        }

        // Normalize stored email if it was saved with mixed case historically.
        if (user.email !== email) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { email },
            });
            user = { ...user, email };
          } catch {
            // Unique conflict — keep looking up by insensitive match only.
          }
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          rateLimit(
            failKey,
            RATE_LIMITS.loginFailed.limit,
            RATE_LIMITS.loginFailed.windowMs
          );
          return null;
        }

        clearRateLimit(failKey);

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
