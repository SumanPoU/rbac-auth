import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("disable:users");
  if (!allowed) return response!;

  const body = await req.json();
  const { isDisabled } = body;

  if (typeof isDisabled !== "boolean") {
    return NextResponse.json(
      { success: false, message: "isDisabled must be true or false" },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { isDisabled },
  });

  return NextResponse.json({
    success: true,
    message: `User has been ${
      isDisabled ? "disabled" : "enabled"
    } successfully`,
    data: user,
  });
}
