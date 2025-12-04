import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { checkSlugUnique } from "@/lib/check-slug";

export async function GET() {
  const { allowed, response } = await requirePermission("read:pages");
  if (!allowed) return response!;

  const pages = await db.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      staticText: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Pages fetched successfully",
    data: pages,
  });
}

export async function POST(req: Request) {
  const { allowed, response } = await requirePermission("add:pages");
  if (!allowed) return response!;

  const body = await req.json();
  const { title, slug, staticText } = body;

  const slugCheck = await checkSlugUnique("page", slug);
  if (slugCheck instanceof NextResponse) return slugCheck;

  const page = await db.page.create({
    data: {
      title,
      slug,
      staticText,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Page created successfully",
    data: page,
  });
}
