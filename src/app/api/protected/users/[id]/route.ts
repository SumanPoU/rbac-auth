import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("read:users-details");
  if (!allowed) return response!;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user)
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );

  return NextResponse.json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("update:users");
  if (!allowed) return response!;

  const body = await req.json();

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      username: body.username,
      image: body.image,
    },
  });

  return NextResponse.json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const { allowed, response } = await requirePermission("hard-delete:users");
  if (!allowed) return response!;

  await db.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({
    success: true,
    message: "User deleted successfully",
  });
}
