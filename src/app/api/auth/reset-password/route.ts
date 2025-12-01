import { db } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } =
      ResetPasswordSchema.parse(body);

    // Verify token and get email from database
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
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { message: "Reset link has expired" },
        { status: 400 }
      );
    }

    // Get email from database (not from client)
    const email = verificationToken.identifier;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used token
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
