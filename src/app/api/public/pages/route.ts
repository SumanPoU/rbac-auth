import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkSlugUnique } from "@/lib/check-slug";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expecting an array of pages
    // Each page should have: { title: string, slug: string, staticText?: string }
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Expected an array of pages" },
        { status: 400 }
      );
    }

    // Filter out invalid pages
    const validPages = body.filter(
      (p: any) => typeof p.title === "string" && typeof p.slug === "string"
    );

    if (validPages.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid pages provided" },
        { status: 400 }
      );
    }

    const createdPages = [];

    // Create pages one by one to check unique slugs
    for (const page of validPages) {
      const slugCheck = await checkSlugUnique("page", page.slug);
      if (slugCheck instanceof NextResponse) continue; // skip duplicate slugs

      const created = await db.page.create({
        data: {
          title: page.title,
          slug: page.slug,
          staticText: page.staticText || "",
        },
      });
      createdPages.push(created);
    }

    return NextResponse.json({
      success: true,
      message: "Pages created successfully",
      data: createdPages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
