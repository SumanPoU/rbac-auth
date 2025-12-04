import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("soft-delete:users");
  if (!allowed) return response!;

  const body = await req.json();
  const { isDeleted } = body;

  if (typeof isDeleted !== "boolean") {
    return NextResponse.json(
      { success: false, message: "isDeleted must be true or false" },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id: userId },
    data: {
      isDeleted,
      deletedAt: isDeleted ? new Date() : null,
    },
  });

  return NextResponse.json({
    success: true,
    message: `User has been ${
      isDeleted ? "soft-deleted" : "restored"
    } successfully`,
    data: user,
  });
}
