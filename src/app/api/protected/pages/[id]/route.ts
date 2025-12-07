import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { checkSlugUnique } from "@/lib/check-slug";
import { formatDate } from "@/lib/formate-date";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pageId = Number(id);

  const { allowed, response } = await requirePermission("read:pages-details");
  if (!allowed) return response!;

  const page = await db.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      title: true,
      slug: true,
      staticText: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!page)
    return NextResponse.json(
      { success: false, message: "Page not found" },
      { status: 404 }
    );

  const formattedPage = {
    ...page,
    createdAt: formatDate(page.createdAt),
    updatedAt: formatDate(page.updatedAt),
  };

  return NextResponse.json({
    success: true,
    message: "Page fetched successfully",
    data: formattedPage,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pageId = Number(id);

  const { allowed, response } = await requirePermission("update:pages");
  if (!allowed) return response!;

  const body = await req.json();
  const { title, slug, staticText } = body;

  const currentPage = await db.page.findUnique({ where: { id: pageId } });
  if (!currentPage) {
    return NextResponse.json(
      { success: false, message: "Page not found" },
      { status: 404 }
    );
  }

  if (slug && slug !== currentPage.slug) {
    const slugCheck = await checkSlugUnique("page", slug, pageId);
    if (slugCheck instanceof NextResponse) return slugCheck;
  }

  const page = await db.page.update({
    where: { id: pageId },
    data: {
      title,
      slug,
      staticText,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      staticText: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Page updated successfully",
    data: page,
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pageId = Number(id);

  const { allowed, response } = await requirePermission("delete:pages");
  if (!allowed) return response!;

  await db.page.delete({
    where: { id: pageId },
  });

  return NextResponse.json({
    success: true,
    message: "Page deleted successfully",
  });
}
