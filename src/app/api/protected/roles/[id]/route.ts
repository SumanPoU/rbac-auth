import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { formatDate } from "@/lib/formate-date";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  const { allowed, response } = await requirePermission("read:roles-details");
  if (!allowed) return response!;

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      pages: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
        orderBy: {
          id: "asc",
        },
      },
      permissions: {
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!role)
    return NextResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );

  const formattedRole = {
    ...role,
    createdAt: formatDate(role.createdAt),
    updatedAt: formatDate(role.updatedAt),
  };

  return NextResponse.json({
    success: true,
    message: "Role fetched successfully",
    data: formattedRole,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  const { allowed, response } = await requirePermission("update:roles");
  if (!allowed) return response!;

  const body = await req.json();
  const { name, description, isDefault } = body;

  // Start a transaction to ensure atomic updates
  const updatedRole = await db.$transaction(async (tx) => {
    if (isDefault) {
      // Reset all other roles to not default
      await tx.role.updateMany({
        where: { id: { not: roleId } },
        data: { isDefault: false },
      });
    }

    // Update the current role
    const role = await tx.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return role;
  });

  return NextResponse.json({
    success: true,
    message: "Role updated successfully",
    data: updatedRole,
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  const { allowed, response } = await requirePermission("delete:roles");
  if (!allowed) return response!;

  await db.role.delete({
    where: { id: roleId },
  });

  return NextResponse.json({
    success: true,
    message: "Role deleted successfully",
  });
}
