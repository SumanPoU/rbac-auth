import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expecting an array of roles
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Expected an array of roles" },
        { status: 400 }
      );
    }

    // Filter valid roles
    const validRoles = body.filter(
      (r: any) => typeof r.name === "string" && r.name.trim() !== ""
    );

    if (validRoles.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid roles provided" },
        { status: 400 }
      );
    }

    // Bulk insert using createMany to avoid unique constraint issues
    const createdRoles = await db.role.createMany({
      data: validRoles,
      skipDuplicates: true, // avoids inserting duplicate role names
    });

    return NextResponse.json({
      success: true,
      message: "Roles created successfully",
      data: createdRoles, // returns { count: X }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
