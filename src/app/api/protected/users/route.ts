import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";
import { requirePermission } from "@/lib/require-permission";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const { allowed, response } = await requirePermission("read:users");
  if (!allowed) return response!;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            username: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        deletedAt: true,
        isDisabled: true,
        role: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Users fetched successfully",
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("create:users");
  if (!allowed) return response!;

  const { name, email, username, password, roleId, image } = await req.json();

  const existingEmail = await db.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return NextResponse.json(
      { success: false, message: "Email already exists" },
      { status: 400 }
    );
  }

  if (username) {
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }
  }

  // --- HASH PASSWORD ---
  const hashed = await bcrypt.hash(password, 12);

  // --- CREATE USER ---
  const user = await db.user.create({
    data: {
      name,
      email,
      username,
      password: hashed,
      roleId,
      image,
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "User created successfully",
    data: user,
  });
}
