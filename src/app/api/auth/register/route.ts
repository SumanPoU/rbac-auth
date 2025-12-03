import { db } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/services/email-verification";
import { randomBytes } from "crypto";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = RegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Find default role
    const defaultRole = await db.role.findFirst({
      where: { isDefault: true },
    });

    // Create user with default role
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        roleId: defaultRole?.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        roleId: true,
      },
    });

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, name);

    if (!emailSent) {
      // Clean up user if email fails
      await db.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { message: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
