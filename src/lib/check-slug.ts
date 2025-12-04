import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function checkSlugUnique(
  model: string,
  slug: string,
  ignoreId?: number
) {
  const existing = await (db as any)[model].findFirst({
    where: ignoreId
      ? {
          slug,
          NOT: { id: ignoreId },
        }
      : { slug },
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: "Slug already exists. Please choose a unique slug.",
      },
      { status: 400 }
    );
  }

  return { ok: true };
}
