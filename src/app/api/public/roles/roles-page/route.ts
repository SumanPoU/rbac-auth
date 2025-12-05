import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

interface BulkRolePagesBody {
  roleId: number;
  pageIds: number[];
}

export async function POST(req: Request) {
  try {
    const body: BulkRolePagesBody[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Expected an array of role-page assignments",
        },
        { status: 400 }
      );
    }

    const results = [];

    for (const assignment of body) {
      const { roleId, pageIds } = assignment;

      // Validate roleId and pageIds
      if (
        typeof roleId !== "number" ||
        !Array.isArray(pageIds) ||
        pageIds.some((id) => typeof id !== "number")
      ) {
        continue; // skip invalid assignments
      }

      // Check if role exists
      const roleExists = await db.role.findUnique({ where: { id: roleId } });
      if (!roleExists) continue;

      // Check all pages exist
      const pages = await db.page.findMany({
        where: { id: { in: pageIds } },
      });
      if (pages.length !== pageIds.length) continue;

      // Update the role-pages relation
      const updatedRole = await db.role.update({
        where: { id: roleId },
        data: {
          pages: {
            set: pageIds.map((id) => ({ id })),
          },
        },
        include: { pages: true },
      });

      results.push(updatedRole);
    }

    return NextResponse.json({
      success: true,
      message: "Roles assigned to pages successfully",
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
