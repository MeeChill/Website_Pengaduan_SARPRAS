import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function resolveSessionUserId(sessionUser: { id?: string; email?: string | null }) {
  const rawId = sessionUser.id
  const parsedId = rawId ? parseInt(rawId, 10) : NaN

  if (!Number.isNaN(parsedId)) {
    const userById = await prisma.user.findUnique({
      where: { id: parsedId },
      select: { id: true },
    })
    if (userById) return userById.id
  }

  if (sessionUser.email) {
    const userByUsername = await prisma.user.findUnique({
      where: { username: sessionUser.email },
      select: { id: true },
    })
    if (userByUsername) return userByUsername.id
  }

  return null
}

// GET all chats for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await resolveSessionUserId({
      id: session.user.id as string | undefined,
      email: session.user.email,
    })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chats = await prisma.chat.findMany({
      where: { user_id: userId },
      orderBy: { diperbarui_pada: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { dibuat_pada: 'desc' }
        }
      }
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create a new chat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { judul } = await req.json()
    const userId = await resolveSessionUserId({
      id: session.user.id as string | undefined,
      email: session.user.email,
    })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chat = await prisma.chat.create({
      data: {
        user_id: userId,
        judul: judul || 'Chat Baru'
      }
    })

    return NextResponse.json({ chat }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
