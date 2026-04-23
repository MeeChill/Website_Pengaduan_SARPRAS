import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const chatId = parseInt(id)

    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })
    }

    // Verify user has access to this chat
    const customChat = await prisma.customChat.findUnique({
      where: { id: chatId },
      select: {
        user_id: true,
        id: true,
      },
    })

    if (!customChat) {
      return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
    }

    const userId = parseInt(session.user.id)
    const role = session.user.role

    // Users can only see their own chats, admins can see all
    if (role === 'user' && customChat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await prisma.customChatMessage.findMany({
      where: { custom_chat_id: chatId },
      orderBy: { dibuat_pada: 'asc' },
      include: {
        sender: {
          select: { id: true, nama: true, username: true, role: true },
        },
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[GET /api/custom-chat/[id]/messages] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const chatId = parseInt(id)

    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })
    }

    const senderId = parseInt(session.user.id)
    const senderRole = session.user.role as 'user' | 'admin'
    const senderName = session.user.name ?? 'Pengguna'

    // Parse body as JSON
    const body = await request.json() as {
      konten?: string
      foto_url?: string
    }

    const { konten, foto_url } = body

    if (!konten || konten.trim() === '') {
      return NextResponse.json(
        { error: 'konten pesan wajib diisi' },
        { status: 400 }
      )
    }

    // Fetch the custom chat to verify it exists and get metadata
    const customChat = await prisma.customChat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        judul: true,
        user_id: true,
        admin_id: true,
        status: true,
      },
    })

    if (!customChat) {
      return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
    }

    // Users can only send messages to their own chats
    if (senderRole === 'user' && customChat.user_id !== senderId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent messages on closed chats (optional guard)
    if (customChat.status === 'closed') {
      return NextResponse.json(
        { error: 'Chat sudah ditutup, tidak dapat mengirim pesan baru' },
        { status: 409 }
      )
    }

    // Save the new message
    const newMessage = await prisma.customChatMessage.create({
      data: {
        custom_chat_id: chatId,
        sender_id: senderId,
        sender_role: senderRole,
        konten: konten.trim(),
        foto_url: foto_url ?? null,
      },
      include: {
        sender: {
          select: { id: true, nama: true, username: true, role: true },
        },
      },
    })

    // Touch diperbarui_pada on the parent chat
    const updatedChat = await prisma.customChat.update({
      where: { id: chatId },
      data: { diperbarui_pada: new Date() },
      include: {
        user: { select: { id: true, nama: true, username: true } },
        admin: { select: { id: true, nama: true, username: true } },
        messages: {
          orderBy: { dibuat_pada: 'desc' },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    })

    // ─── Notifications ───────────────────────────────────────────────────────

    if (senderRole === 'admin') {
      // Notify the chat owner (user)
      await prisma.notifikasi.create({
        data: {
          penerima_id: customChat.user_id,
          jenis: 'custom_chat_message',
          pesan: 'Admin telah membalas pertanyaanmu',
          custom_chat_id: chatId,
        },
      })
    } else {
      // Sender is a user — notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      })

      // Collect unique admin IDs to notify (all admins + assigned admin — deduplicated)
      const adminIdsToNotify = new Set<number>(admins.map((a) => a.id))

      // The assigned admin is already in the set if they exist in the admin list,
      // but we add explicitly in case they somehow differ
      if (customChat.admin_id) {
        adminIdsToNotify.add(customChat.admin_id)
      }

      if (adminIdsToNotify.size > 0) {
        await prisma.notifikasi.createMany({
          data: Array.from(adminIdsToNotify).map((adminId) => ({
            penerima_id: adminId,
            jenis: 'custom_chat_message',
            pesan: `Pesan baru dari ${senderName} di chat: ${customChat.judul}`,
            custom_chat_id: chatId,
          })),
        })
      }
    }

    // ─── Pusher Events ───────────────────────────────────────────────────────

    if (pusherServer) {
      // 1. Notify chat room participants with the full message + sender info
      await pusherServer.trigger(
        `custom-chat-${chatId}`,
        'new-message',
        { message: newMessage }
      )

      // 2. Notify admin list so the chat card updates (last message, timestamp, etc.)
      await pusherServer.trigger(
        'admin-custom-chats',
        'chat-updated',
        { customChat: updatedChat }
      )
    }

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/custom-chat/[id]/messages] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
