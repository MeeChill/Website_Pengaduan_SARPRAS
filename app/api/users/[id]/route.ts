import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PATCH update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    const { nama, username, password, role, nisn, kelas } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check username uniqueness if changed
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (nama) updateData.nama = nama;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (nisn !== undefined) updateData.nisn = nisn;
    if (kelas !== undefined) updateData.kelas = kelas;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        nama: updatedUser.nama,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the currently logged-in admin
    const sessionUserId = parseInt(
      (session.user as { id?: string })?.id ?? "0",
    );
    if (sessionUserId === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
