import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAuditEvent, AuditActions } from "@/components/audit-logger";
import logger from "@/components/logger";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const protectedRoutes = ["/reset-password/verify", "/dashboard"];

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0].trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      await logAuditEvent({
        action: AuditActions.FAILED_LOGIN,
        resource: "middleware-auth-check",
        details: { pathname },
        ipAddress,
        userAgent,
      });

      return NextResponse.redirect(new URL("/login", request.url));
    }

    await logAuditEvent({
      action: AuditActions.VIEW,
      resource: pathname,
      userId: token.id ? Number(token.id) : null,
      details: { message: "Middleware authentication success" },
      ipAddress,
      userAgent,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reset-password/verify/:path*", "/dashboard/:path*"],
};
