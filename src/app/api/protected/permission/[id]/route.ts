import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { formatDate } from "@/lib/formate-date";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const permissionId = Number(id);

  const { allowed, response } = await requirePermission(
    "read:permissions-details"
  );
  if (!allowed) return response!;

  const permission = await db.permission.findUnique({
    where: { id: permissionId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!permission)
    return NextResponse.json(
      { success: false, message: "Permission not found" },
      { status: 404 }
    );

  const formattedPermission = {
    ...permission,
    createdAt: formatDate(permission.createdAt),
    updatedAt: formatDate(permission.updatedAt),
  };

  return NextResponse.json({
    success: true,
    message: "Permission fetched successfully",
    data: formattedPermission,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const permissionId = Number(id);

  const { allowed, response } = await requirePermission("update:permissions");
  if (!allowed) return response!;

  const body = await req.json();
  const { name, description } = body;

  const permission = await db.permission.update({
    where: { id: permissionId },
    data: {
      name,
      description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Permission updated successfully",
    data: permission,
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const permissionId = Number(id);

  const { allowed, response } = await requirePermission("delete:permissions");
  if (!allowed) return response!;

  await db.permission.delete({
    where: { id: permissionId },
  });

  return NextResponse.json({
    success: true,
    message: "Permission deleted successfully",
  });
}
