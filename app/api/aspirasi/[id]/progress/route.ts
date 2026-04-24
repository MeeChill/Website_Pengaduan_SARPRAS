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

    const existing = await prisma.aspirasi.findUnique({
      where: { id: parseInt(id) },
      select: { status: true, user_id: true, nomor_tiket: true, custom_chat: { select: { id: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.status === 'selesai' || existing.status === 'ditolak') {
      return NextResponse.json(
        { error: 'Laporan sudah final (selesai/ditolak). Tidak bisa tambah progress.' },
        { status: 409 }
      );
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
    const notif = await prisma.notifikasi.create({
      data: {
        penerima_id: existing.user_id,
        jenis: 'progres_update',
        pesan: `Update progres: ${deskripsi_update.trim()}`,
        aspirasi_id: parseInt(id)
      }
    });
    if (pusherServer) {
      await pusherServer.trigger(`user-${existing.user_id}`, 'notification', {
        id: notif.id,
        jenis: notif.jenis,
        pesan: notif.pesan,
        dibaca: notif.dibaca,
        tanggal_notif: notif.tanggal_notif.toISOString(),
        aspirasi_id: notif.aspirasi_id ?? undefined,
        custom_chat_id: notif.custom_chat_id ?? undefined,
      });
      await pusherServer.trigger(`user-${existing.user_id}`, 'aspirasi-updated', {
        aspirasi_id: parseInt(id),
        type: 'progres_update',
      });
    }

    if (existing.custom_chat?.id) {
      const chatMessage = await prisma.customChatMessage.create({
        data: {
          custom_chat_id: existing.custom_chat.id,
          sender_id: parseInt(session.user.id),
          sender_role: 'admin',
          konten: `Update progress tiket ${existing.nomor_tiket}:\n\n${deskripsi_update.trim()}`,
          foto_url: foto_url?.trim() || null,
        }
      });

      if (pusherServer) {
        await pusherServer.trigger(
          `custom-chat-${existing.custom_chat.id}`,
          'new-message',
          { message: chatMessage }
        );
      }
    }

    return NextResponse.json({ success: true, progressUpdate });

  } catch (error) {
    console.error('Error adding progress update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}