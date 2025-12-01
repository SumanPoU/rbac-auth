import { db } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { redirect } from "next/dist/server/api-utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    // Email Magic Link
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
      },
      from: process.env.EMAIL_FROM,
    }),

    // Credentials Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "Email and password are required",
            })
          );
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // Email not found
        if (!user) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "Email is invalid",
            })
          );
        }

        // Email not verified
        if (!user.emailVerified) {
          throw new Error(
            JSON.stringify({
              success: false,
              message:
                "Email not verified. Please verify your email before logging in.",
              redirect: "/verify-email",
            })
          );
        }

        // Ensure password is not null
        if (!user.password) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "Password not set for this account",
            })
          );
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "Password is incorrect",
            })
          );
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Set emailVerified for social logins (not credentials)
      if (account?.provider !== "credentials" && user.email) {
        const existing = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existing && !existing.emailVerified) {
          await db.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date() },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id.toString();
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Automatically verify email for OAuth users
      if (user.email && user.emailVerified === null) {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
