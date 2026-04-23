import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
