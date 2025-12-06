import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { status: false, message: "You are not logged in" },
      { status: 401 }
    );
  }

  const user = (session as any).user || (session as any).session?.user || null;

  return NextResponse.json({
    authenticated: !!session,
    user: {
      ...user,
      role: session.user.role,
      permissions: session.user.permissions,
      pages: session.user.pages,
    },
    rawSession: session,
  });
}
