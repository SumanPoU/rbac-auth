import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

interface BulkRolePermissionsBody {
  roleId: number;
  permissionIds: number[];
}

export async function POST(req: Request) {
  try {
    const body: BulkRolePermissionsBody[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Expected an array of role-permission assignments",
        },
        { status: 400 }
      );
    }

    const results = [];

    for (const assignment of body) {
      const { roleId, permissionIds } = assignment;

      // Validate input
      if (
        typeof roleId !== "number" ||
        !Array.isArray(permissionIds) ||
        permissionIds.some((id) => typeof id !== "number")
      ) {
        continue; // skip invalid assignments
      }

      // Check if role exists
      const roleExists = await db.role.findUnique({ where: { id: roleId } });
      if (!roleExists) continue;

      // Check if all permissions exist
      const permissions = await db.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) continue;

      // Assign permissions to the role
      const updatedRole = await db.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            set: permissionIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });

      results.push(updatedRole);
    }

    return NextResponse.json({
      success: true,
      message: "Permissions assigned to roles successfully",
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
