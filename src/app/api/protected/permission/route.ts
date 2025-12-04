import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function GET() {
  const { allowed, response } = await requirePermission("read:permissions");
  if (!allowed) return response!;

  const permissions = await db.permission.findMany({
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
    message: "Permissions fetched successfully",
    data: permissions,
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("add:permissions");
  if (!allowed) return response!;

  const body = await req.json();
  const { name, description } = body;

  const permission = await db.permission.create({
    data: {
      name,
      description,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Permission created successfully",
    data: permission,
  });
}
