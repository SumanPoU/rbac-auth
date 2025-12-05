import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        password: true,
        createdAt: true,
        updatedAt: true,

        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            pages: {
              select: {
                id: true,
                title: true,
                slug: true,
                staticText: true,
              },
            },
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Determine credentials login
    const isCredentials = !!user.password;

    // remove password from response
    const { password, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        ...safeUser,
        isCredentials,
      },
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const body = await req.json();
    const { name, username, image, password } = body;

    if (!name && !username && !image && !password) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    // Fetch logged-in user + accounts
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user logged in using Credentials provider
    const isCredentialsUser =
      user.password !== null ||
      user.accounts.some((acc) => acc.provider === "credentials");

    let dataToUpdate: any = {
      name: name || undefined,
      username: username || undefined,
      image: image || undefined,
    };

    // Handle username duplicate checking
    if (username) {
      const existing = await db.user.findUnique({ where: { username } });

      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { success: false, message: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Only allow password update if user is credentials user
    if (password) {
      if (!isCredentialsUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Password cannot be updated for social login accounts",
          },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(password, 12);
      dataToUpdate.password = hashed;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
