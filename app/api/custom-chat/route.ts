import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const role = session.user.role;

    const where = role === "admin" ? {} : { user_id: userId };

    const customChats = await prisma.customChat.findMany({
      where,
      include: {
        user: { select: { nama: true } },
        aspirasi: { select: { id: true, nomor_tiket: true, status: true } },
        messages: {
          orderBy: { dibuat_pada: "desc" },
          take: 1,
        },
      },
      orderBy: { diperbarui_pada: "desc" },
    });

    return NextResponse.json({ customChats });
  } catch (error) {
    console.error("Error fetching custom chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { judul, pesan_awal } = body;

    if (!judul || !pesan_awal) {
      return NextResponse.json(
        { error: "Judul dan pesan awal wajib diisi" },
        { status: 400 },
      );
    }

    // Create custom chat
    const customChat = await prisma.customChat.create({
      data: {
        user_id: userId,
        judul: judul.trim(),
        status: "open",
        prioritas: "normal",
      },
    });

    // Add initial message from user
    const message = await prisma.customChatMessage.create({
      data: {
        custom_chat_id: customChat.id,
        sender_id: userId,
        sender_role: "user",
        konten: pesan_awal.trim(),
      },
    });

    // Notify all admins about new custom chat
    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    for (const admin of admins) {
      await prisma.notifikasi.create({
        data: {
          penerima_id: admin.id,
          jenis: "custom_chat_new",
          pesan: `Pertanyaan baru dari ${session.user.name}: "${judul}"`,
          custom_chat_id: customChat.id,
        },
      });
    }

    // Trigger Pusher event for admins (if Pusher is configured)
    if (pusherServer) {
      try {
        await pusherServer.trigger("admin-custom-chats", "new-chat", {
          customChat: { ...customChat, firstMessage: message },
        });
      } catch (e) {
        console.error("Pusher trigger error:", e);
      }
    }

    return NextResponse.json({
      customChat: { ...customChat, messages: [message] },
    });
  } catch (error) {
    console.error("Error creating custom chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
