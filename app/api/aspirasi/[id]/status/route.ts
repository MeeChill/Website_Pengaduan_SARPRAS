import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();
    
    if (!['pending', 'dalam_progres', 'selesai'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const aspirasi = await prisma.aspirasi.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        tanggal_mulai: status === 'dalam_progres' ? new Date() : undefined,
        tanggal_selesai: status === 'selesai' ? new Date() : undefined
      },
      include: {
        custom_chat: {
          select: { id: true }
        }
      }
    });

    // Create notification for user
    await prisma.notifikasi.create({
      data: {
        penerima_id: aspirasi.user_id,
        jenis: 'status_update',
        pesan: `Status aspirasi Anda telah diperbarui menjadi: ${status.replace('_', ' ')}`,
        aspirasi_id: parseInt(id)
      }
    });

    if (aspirasi.custom_chat?.id) {
      const statusLabel = status.replace('_', ' ');
      const chatMessage = await prisma.customChatMessage.create({
        data: {
          custom_chat_id: aspirasi.custom_chat.id,
          sender_id: parseInt(session.user.id),
          sender_role: 'admin',
          konten: `Update tiket ${aspirasi.nomor_tiket}: status laporan diubah menjadi ${statusLabel}.`,
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

    return NextResponse.json({ success: true, aspirasi });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}