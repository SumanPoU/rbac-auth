import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  const { allowed, response } = await requirePermission(
    "update:roles-permissions"
  );
  if (!allowed) return response!;

  const body = await req.json();
  const { permissionIds } = body;

  // Validate input
  if (
    !Array.isArray(permissionIds) ||
    permissionIds.some((id) => typeof id !== "number")
  ) {
    return NextResponse.json(
      { success: false, message: "permissionIds must be an array of numbers" },
      { status: 400 }
    );
  }

  // Check if role exists
  const roleExists = await db.role.findUnique({ where: { id: roleId } });
  if (!roleExists) {
    return NextResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }

  // Check if all permissions exist
  const permissions = await db.permission.findMany({
    where: { id: { in: permissionIds } },
  });

  if (permissions.length !== permissionIds.length) {
    return NextResponse.json(
      { success: false, message: "One or more permissions do not exist" },
      { status: 404 }
    );
  }

  // Update permissions for the role
  const updatedRole = await db.role.update({
    where: { id: roleId },
    data: {
      permissions: {
        set: permissionIds.map((id) => ({ id })),
      },
    },
    include: { permissions: true },
  });

  return NextResponse.json({
    success: true,
    message: "Permissions assigned to role successfully",
    data: updatedRole,
  });
}
