import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validationError, handleRouteError, apiError } from "@/lib/api-errors";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
});

/**
 * Public self-registration is DISABLED by default: this is an invite-only
 * district ERP where accounts are provisioned by admins/seed. Without this
 * gate, anyone could create an account and reach authenticated endpoints.
 * Set ALLOW_SELF_REGISTRATION="true" to re-enable.
 */
function isSelfRegistrationEnabled() {
  return process.env.ALLOW_SELF_REGISTRATION === "true";
}

export async function POST(request: Request) {
  if (!isSelfRegistrationEnabled()) {
    return apiError("Self-registration is disabled. Contact your district administrator.", 403);
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiError("An account with this email already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (err) {
    const fallback =
      err instanceof Error && err.message.includes("Authentication failed")
        ? "Database connection failed. Ensure PostgreSQL is running and DATABASE_URL is set."
        : undefined;
    return handleRouteError(err, fallback);
  }
}
