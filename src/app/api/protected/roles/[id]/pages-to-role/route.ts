import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  // Check permission
  const { allowed, response } = await requirePermission("update:roles-pages");
  if (!allowed) return response!;

  const body = await req.json();
  const { pageIds } = body;

  // Validate input
  if (!Array.isArray(pageIds) || pageIds.some((id) => typeof id !== "number")) {
    return NextResponse.json(
      { success: false, message: "pageIds must be an array of numbers" },
      { status: 400 }
    );
  }

  // Check if role exists
  const roleExists = await db.role.findUnique({
    where: { id: roleId },
  });

  if (!roleExists) {
    return NextResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }

  // Validate all pages exist
  const pages = await db.page.findMany({
    where: { id: { in: pageIds } },
  });

  if (pages.length !== pageIds.length) {
    return NextResponse.json(
      { success: false, message: "One or more pages do not exist" },
      { status: 404 }
    );
  }

  // Update the relation
  const updatedRole = await db.role.update({
    where: { id: roleId },
    data: {
      pages: {
        set: pageIds.map((id) => ({ id })),
      },
    },
    include: { pages: true },
  });

  return NextResponse.json({
    success: true,
    message: "Pages assigned to role successfully",
    data: updatedRole,
  });
}
