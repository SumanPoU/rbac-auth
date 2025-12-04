import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requirePermission } from "@/lib/require-permission";

export async function GET() {
  const { allowed, response } = await requirePermission("read:users");
  if (!allowed) return response!;

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      createdAt: true,
      role: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("create:users");
  if (!allowed) return response!;

  const { name, email, username, password, roleId } = await req.json();
  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      username,
      password: hashed,
      roleId,
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "User created successfully",
    data: user,
  });
}
