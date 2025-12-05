import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";
import { requirePermission } from "@/lib/require-permission";
import { checkSlugUnique } from "@/lib/check-slug";

export async function GET(req: Request) {
  const { allowed, response } = await requirePermission("read:pages");
  if (!allowed) return response!;

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";

  // Build search filter
  const where: Prisma.PageWhereInput = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            slug: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            staticText: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
    : {};

  if (type === "all") {
    const pages = await db.page.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        staticText: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "All pages fetched successfully",
      data: pages,
      meta: {
        total: pages.length,
        page: 1,
        limit: pages.length,
        totalPages: 1,
      },
    });
  }

  const skip = (page - 1) * limit;

  const [pages, total] = await Promise.all([
    db.page.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        staticText: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    db.page.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Pages fetched successfully",
    data: pages,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
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
