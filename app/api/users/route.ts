import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        nisn: true,
        kelas: true,
        aspirasi: {
          select: { id: true }
        }
      },
      orderBy: { id: 'asc' }
    })

    // Count aspirasi per user
    const usersWithCount = users.map(user => ({
      ...user,
      totalAspirasi: user.aspirasi.length,
      aspirasi: undefined
    }))

    return NextResponse.json({ users: usersWithCount })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nama, username, password, role, nisn, kelas } = await req.json()

    if (!nama || !username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        nisn,
        kelas
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
