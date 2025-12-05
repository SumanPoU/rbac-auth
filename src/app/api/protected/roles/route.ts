import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";
import { requirePermission } from "@/lib/require-permission";

export async function GET(req: Request) {
  const { allowed, response } = await requirePermission("read:roles");
  if (!allowed) return response!;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.RoleWhereInput = search
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

  const [roles, total] = await Promise.all([
    db.role.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    db.role.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Roles fetched successfully",
    data: roles,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("add:roles");
  if (!allowed) return response!;

  const body = await req.json();
  const { name, description, isDefault } = body;

  // Check if role with same name exists
  const existingRole = await db.role.findUnique({ where: { name } });
  if (existingRole) {
    return NextResponse.json(
      {
        success: false,
        message: "Role with this name already exists.",
      },
      { status: 400 }
    );
  }

  // If isDefault is true, check if another default role exists
  if (isDefault) {
    const existingDefault = await db.role.findFirst({
      where: { isDefault: true },
    });
    if (existingDefault) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot create role as default. Another default role already exists.",
        },
        { status: 400 }
      );
    }
  }

  const role = await db.role.create({
    data: {
      name,
      description,
      isDefault: !!isDefault,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Role created successfully",
    data: role,
  });
}
