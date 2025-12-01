import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const VerifyTokenSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = VerifyTokenSchema.parse(body);

    // Verify token exists and is not expired
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid reset link" },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { message: "Reset link has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Token verified",
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid token format" },
        { status: 400 }
      );
    }

    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify token" },
      { status: 500 }
    );
  }
}
