import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/services/password-reset";
import { randomBytes } from "crypto";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset is only available for accounts registered via email and password.",
        },
        { status: 400 }
      );
    }

    // Delete old tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Generate reset token (1 hour expiry)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      token,
      user.name || "User"
    );

    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
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

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process reset request" },
      { status: 500 }
    );
  }
}
