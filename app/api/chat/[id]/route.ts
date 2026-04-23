import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const chatId = parseInt(id);

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        user_id: parseInt(session.user.id as string),
      },
      include: {
        messages: {
          orderBy: { dibuat_pada: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH update chat title
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const chatId = parseInt(id);
    const { judul } = await req.json();

    if (!judul || typeof judul !== "string") {
      return NextResponse.json({ error: "Judul tidak valid" }, { status: 400 });
    }

    // Pastikan chat milik user yang sedang login
    const existing = await prisma.chat.findFirst({
      where: {
        id: chatId,
        user_id: parseInt(session.user.id as string),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { judul: judul.trim() },
    });

    return NextResponse.json({ chat: updated });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE a chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const chatId = parseInt(id);

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        user_id: parseInt(session.user.id as string),
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
