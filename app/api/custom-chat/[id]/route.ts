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

    const customChat = await prisma.customChat.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: { id: true, nama: true, username: true, kelas: true, nisn: true },
        },
        admin: {
          select: { id: true, nama: true, username: true },
        },
        aspirasi: {
          select: { id: true, nomor_tiket: true, status: true },
        },
        messages: {
          orderBy: { dibuat_pada: 'asc' },
          include: {
            sender: {
              select: { id: true, nama: true, username: true, role: true },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    })

    if (!customChat) {
      return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
    }

    // Users can only see their own chats
    const userId = parseInt(session.user.id)
    const role = session.user.role

    if (role === 'user' && customChat.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ customChat })
  } catch (error) {
    console.error('[GET /api/custom-chat/[id]] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })
    }

    const { id } = await params
    const chatId = parseInt(id)

    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })
    }

    // Check chat exists
    const existing = await prisma.customChat.findUnique({
      where: { id: chatId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json() as {
      prioritas?: string
      status?: string
      admin_id?: number
    }

    const VALID_PRIORITAS = ['low', 'normal', 'high', 'urgent']
    const VALID_STATUS = ['open', 'in_progress', 'closed']

    // Build update payload — only include provided fields
    const updateData: {
      prioritas?: string
      status?: string
      admin_id?: number | null
    } = {}

    if (body.prioritas !== undefined) {
      if (!VALID_PRIORITAS.includes(body.prioritas)) {
        return NextResponse.json(
          { error: `prioritas harus salah satu dari: ${VALID_PRIORITAS.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.prioritas = body.prioritas
    }

    if (body.status !== undefined) {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json(
          { error: `status harus salah satu dari: ${VALID_STATUS.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.admin_id !== undefined) {
      // Allow null to un-assign admin
      updateData.admin_id = body.admin_id ?? null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada field yang diupdate' },
        { status: 400 }
      )
    }

    const updatedChat = await prisma.customChat.update({
      where: { id: chatId },
      data: updateData,
      include: {
        user: {
          select: { id: true, nama: true, username: true, kelas: true, nisn: true },
        },
        admin: {
          select: { id: true, nama: true, username: true },
        },
        aspirasi: {
          select: { id: true, nomor_tiket: true, status: true },
        },
        messages: {
          orderBy: { dibuat_pada: 'asc' },
          include: {
            sender: {
              select: { id: true, nama: true, username: true, role: true },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    })

    // Trigger Pusher event so admin list updates in real-time
    if (pusherServer) {
      await pusherServer.trigger('admin-custom-chats', 'chat-updated', {
        customChat: updatedChat,
      })
    }

    return NextResponse.json({ customChat: updatedChat })
  } catch (error) {
    console.error('[PATCH /api/custom-chat/[id]] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
