import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deskripsi_update, foto_url } = await request.json();
    
    if (!deskripsi_update?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const progressUpdate = await prisma.progresUpdate.create({
      data: {
        aspirasi_id: parseInt(id),
        admin_id: parseInt(session.user.id),
        deskripsi_update: deskripsi_update.trim(),
        foto_url: foto_url?.trim() || null,
      },
      include: {
        admin: true
      }
    });

    // Create notification for user
    const aspirasi = await prisma.aspirasi.findUnique({
      where: { id: parseInt(id) },
      select: {
        user_id: true,
        nomor_tiket: true,
        custom_chat: {
          select: { id: true }
        }
      }
    });

    if (aspirasi) {
      await prisma.notifikasi.create({
        data: {
          penerima_id: aspirasi.user_id,
          jenis: 'progres_update',
          pesan: `Update progres: ${deskripsi_update.trim()}`,
          aspirasi_id: parseInt(id)
        }
      });

      if (aspirasi.custom_chat?.id) {
        const chatMessage = await prisma.customChatMessage.create({
          data: {
            custom_chat_id: aspirasi.custom_chat.id,
            sender_id: parseInt(session.user.id),
            sender_role: 'admin',
            konten: `Update progress tiket ${aspirasi.nomor_tiket}:\n\n${deskripsi_update.trim()}`,
            foto_url: foto_url?.trim() || null,
          }
        });

        if (pusherServer) {
          await pusherServer.trigger(
            `custom-chat-${aspirasi.custom_chat.id}`,
            'new-message',
            { message: chatMessage }
          );
        }
      }
    }

    return NextResponse.json({ success: true, progressUpdate });

  } catch (error) {
    console.error('Error adding progress update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}