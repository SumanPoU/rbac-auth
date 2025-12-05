// /app/api/protected/user/permissions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * GET: fetch all permissions for the user with id = params.id
 * POST: check if the user has a specific permission { permission: string }
 */

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 }
    );
  }

  // fetch user with role and permissions
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: {
        select: {
          permissions: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const permissions = user.role?.permissions.map((p) => p.name) || [];

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name },
    permissions,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 }
    );
  }

  const { permission } = await req.json();
  if (!permission) {
    return NextResponse.json(
      { success: false, message: "Permission name is required" },
      { status: 400 }
    );
  }

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

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const hasPermission =
    user.role?.permissions.some((p) => p.name === permission) ?? false;

  if (!hasPermission) {
    return NextResponse.json(
      { success: false, message: "User does not have the required permission" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User has permission: ${permission}`,
  });
}
