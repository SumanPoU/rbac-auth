import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAuditEvent, AuditActions } from "@/components/audit-logger";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Authentication-protected routes
  const authProtected = [
    "/dashboard",
    "/api/protected",
    "/reset-password/verify",
  ];

  const requiresAuth = authProtected.some((route) =>
    pathname.startsWith(route)
  );

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0].trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  //  Require token for protected paths
  if (requiresAuth) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Log failed authentication
      await logAuditEvent({
        action: AuditActions.FAILED_LOGIN,
        resource: "middleware-auth-check",
        details: { pathname },
        ipAddress,
        userAgent,
      });

      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Log successful authentication
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
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/reset-password/verify/:path*",
  ],
};
