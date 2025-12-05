import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Expected an array of permissions" },
        { status: 400 }
      );
    }

    // Filter out invalid items
    const validPermissions = body.filter(
      (p: any) => typeof p.name === "string" && p.name.trim() !== ""
    );

    if (validPermissions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid permissions provided" },
        { status: 400 }
      );
    }

    // Create multiple permissions at once
    const createdPermissions = await db.permission.createMany({
      data: validPermissions,
      skipDuplicates: true, // avoids duplicate names
    });

    return NextResponse.json({
      success: true,
      message: "Permissions created successfully",
      data: createdPermissions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
