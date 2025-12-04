import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requirePermission(permissionName: string) {
  const session = await getServerSession();

  if (!session || !session.user?.id) {
    return {
      allowed: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const userId = Number(session.user.id);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          permissions: {
            select: { name: true },
          },
        },
      },
    },
  });

  const hasPermission =
    user?.role?.permissions.some((p) => p.name === permissionName) ?? false;

  return {
    allowed: hasPermission,
    response: hasPermission
      ? undefined
      : NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        ),
  };
}
