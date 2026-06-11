import type { UserRole } from "@/types/auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      clubId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    clubId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    clubId: string | null;
  }
}
