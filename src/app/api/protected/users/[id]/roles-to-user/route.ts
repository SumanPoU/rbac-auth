import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("update:users-role");
  if (!allowed) return response!;

  const body = await req.json();
  const { roleId } = body;

  // A user must always have one role
  if (roleId === null || roleId === undefined) {
    return NextResponse.json(
      {
        success: false,
        message: "A user must have one role. roleId is required.",
      },
      { status: 400 }
    );
  }

  if (typeof roleId !== "number") {
    return NextResponse.json(
      { success: false, message: "roleId must be a number" },
      { status: 400 }
    );
  }

  // Verify the role exists
  const roleExists = await db.role.findUnique({ where: { id: roleId } });
  if (!roleExists) {
    return NextResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }

  // Update user's role
  const user = await db.user.update({
    where: { id: userId },
    data: {
      roleId,
    },
    include: { role: true },
  });

  return NextResponse.json({
    success: true,
    message: `Role '${user.role?.name}' assigned to user successfully`,
    data: user,
  });
}
