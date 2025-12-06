import { db } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

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
          include: {
            role: {
              include: {
                permissions: true,
                pages: true,
              },
            },
          },
        });

        // Email not found or deleted
        if (!user) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "Email is invalid or account does not exist",
            })
          );
        }

        // Check if account is disabled
        if (user.isDisabled) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "This account has been disabled. Contact support.",
            })
          );
        }

        // soft deleted
        if (user.isDeleted) {
          throw new Error(
            JSON.stringify({
              success: false,
              message: "This account has been deleted. Contact support.",
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

        // Ensure password is set
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
          image: user.image,
          role: user.role?.name ?? "READ_ONLY",
          permissions: user.role?.permissions.map((p) => p.name) ?? [],
          pages:
            user.role?.pages.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
            })) ?? [],
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

        if (existing) {
          if (existing.isDisabled || existing.isDeleted) {
            return false;
          }

          // If email is not verified, set it to verified
          if (!existing.emailVerified) {
            await db.user.update({
              where: { id: existing.id },
              data: { emailVerified: new Date() },
            });
          }
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      let userId = token.id as string | undefined;

      if (user) {
        // Initial sign-in - get user ID and fetch from database
        userId = String(user.id);
        token.id = userId;
      }

      // Fetch fresh data from database for both initial login and token refresh
      if (userId) {
        const dbUser = await db.user.findUnique({
          where: { id: Number.parseInt(userId) },
          include: {
            role: {
              include: {
                permissions: true,
                pages: true,
              },
            },
          },
        });

        if (dbUser?.role) {
          token.role = dbUser.role.name;
          token.permissions = dbUser.role.permissions.map((p) => p.name);
          token.pages = dbUser.role.pages.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
          }));
        } else {
          // No role assigned - set defaults
          token.role = "READ_ONLY";
          token.permissions = [];
          token.pages = [];
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.pages = token.pages;
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

      // Assign default role if user has no role
      const defaultRole = await db.role.findFirst({
        where: { isDefault: true },
      });

      if (defaultRole) {
        await db.user.update({
          where: { id: user.id },
          data: { roleId: defaultRole.id },
        });
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
