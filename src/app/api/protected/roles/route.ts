import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function GET() {
  const { allowed, response } = await requirePermission("read:roles");
  if (!allowed) return response!;

  const roles = await db.role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Roles fetched successfully",
    data: roles,
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("add:roles");
  if (!allowed) return response!;

  const body = await req.json();
  const { name, description } = body;

  const role = await db.role.create({
    data: {
      name,
      description,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Role created successfully",
    data: role,
  });
}
