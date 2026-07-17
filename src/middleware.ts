import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getClientIp, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

function rateLimitResponse(retryAfterSec?: number) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (retryAfterSec) {
    headers["Retry-After"] = String(retryAfterSec);
  }
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
    }),
    { status: 429, headers }
  );
}

function checkPostRateLimit(pathname: string, headers: Headers) {
  if (/^\/api\/events\/[^/]+\/public-register$/.test(pathname)) {
    const ip = getClientIp(headers);
    return rateLimit(
      `event-register:${ip}`,
      RATE_LIMITS.register.limit,
      RATE_LIMITS.register.windowMs
    );
  }

  if (pathname === "/api/auth/callback/credentials") {
    const ip = getClientIp(headers);
    return rateLimit(
      `login-ip:${ip}`,
      RATE_LIMITS.loginIp.limit,
      RATE_LIMITS.loginIp.windowMs
    );
  }

  return { success: true as const };
}

const PUBLIC_PREFIXES = [
  "/about",
  "/resources",
  "/events",
  "/calendar",
  "/council",
  "/contact",
  "/clubs",
  "/sponsorship",
];

function isPublicContentRoute(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  if (req.method === "POST") {
    const limited = checkPostRateLimit(pathname, req.headers);
    if (!limited.success) {
      return rateLimitResponse(limited.retryAfterSec);
    }
  }

  const isHome = pathname === "/";
  const isPublicRoute = isHome || isPublicContentRoute(pathname);

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicApiRoute = pathname === "/api/contact";

  if (isApiAuthRoute || isPublicApiRoute) {
    return;
  }

  if (isPublicRoute) {
    if (isLoggedIn && isHome) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
