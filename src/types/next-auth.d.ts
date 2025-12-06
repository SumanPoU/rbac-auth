import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    role: string;
    permissions?: string[];
    pages?: Array<{ id: number; title: string; slug: string }>;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      permissions?: string[];
      pages?: Array<{ id: number; title: string; slug: string }>;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions?: string[];
    pages?: Array<{ id: number; title: string; slug: string }>;
  }
}
