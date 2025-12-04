import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

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
    },
  });

  if (!role)
    return NextResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );

  return NextResponse.json({
    success: true,
    message: "Role fetched successfully",
    data: role,
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
  const { name, description } = body;

  const role = await db.role.update({
    where: { id: roleId },
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
    message: "Role updated successfully",
    data: role,
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
