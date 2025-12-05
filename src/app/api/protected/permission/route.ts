import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";
import { requirePermission } from "@/lib/require-permission";

export async function GET(req: Request) {
  const { allowed, response } = await requirePermission("read:permissions");
  if (!allowed) return response!;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.PermissionWhereInput = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  const [permissions, total] = await Promise.all([
    db.permission.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),

    db.permission.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Permissions fetched successfully",
    data: permissions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
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
