import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST add a message to a chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, konten } = await req.json();
    const { id } = await params;
    const chatId = parseInt(id);

    if (!role || !konten) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

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

    const message = await prisma.chatMessage.create({
      data: {
        chat_id: chatId,
        role,
        konten,
      },
    });

    // Update chat's updated_at timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { diperbarui_pada: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
