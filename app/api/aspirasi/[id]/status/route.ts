import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

function buildRejectionSummary(opts: {
  nomor_tiket: string;
  judul: string;
  alasan: string;
}) {
  const alasan = opts.alasan.trim();
  // One-line friendly for notification UI
  const notif = `❌ Laporan ditolak | Tiket: ${opts.nomor_tiket} | Judul: ${opts.judul} | Alasan: ${alasan} | Silakan perbaiki lalu kirim ulang via tab Buat Laporan.`;

  // More detailed message for progress/custom-chat
  const detail = [
    `❌ Laporan **DITOLAK**`,
    `Tiket: ${opts.nomor_tiket}`,
    `Judul: ${opts.judul}`,
    ``,
    `Alasan penolakan: ${alasan}`,
    ``,
    `Yang bisa kamu lakukan:`,
    `- Lengkapi lokasi (gedung/lantai/ruangan)`,
    `- Jelaskan kerusakan lebih detail`,
    `- Sertakan foto before yang jelas (jika ada)`,
    ``,
    `Silakan ajukan ulang melalui tab **Buat Laporan**.`,
  ].join('\n');

  return { notif, detail };
}

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
    const { status, alasan_penolakan, keterangan_selesai } = await request.json();
    
    if (!['pending', 'dalam_progres', 'selesai', 'ditolak'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (status === 'ditolak' && !String(alasan_penolakan ?? '').trim()) {
      return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 });
    }
    const existing = await prisma.aspirasi.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        user_id: true,
        nomor_tiket: true,
        judul: true,
        foto_after: true,
        status: true,
        custom_chat: { select: { id: true } },
      },
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.status === 'selesai' || existing.status === 'ditolak') {
      return NextResponse.json(
        { error: 'Laporan sudah final (selesai/ditolak) dan tidak dapat diubah lagi' },
        { status: 409 }
      );
    }
    
    if (status === 'selesai' && !String(keterangan_selesai ?? '').trim()) {
      return NextResponse.json({ error: 'Keterangan penyelesaian wajib diisi' }, { status: 400 });
    }
    if (status === 'selesai' && !existing.foto_after) {
      return NextResponse.json({ error: 'Foto after wajib diupload sebelum menyelesaikan laporan' }, { status: 400 });
    }

    const before = existing;

    const aspirasi = await prisma.aspirasi.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        tanggal_mulai: status === 'dalam_progres' ? new Date() : undefined,
        tanggal_selesai: status === 'selesai' ? new Date() : undefined,
        // keterangan_selesai: status === 'selesai' ? String(keterangan_selesai ?? '').trim() : undefined
      },
      include: {
        custom_chat: {
          select: { id: true }
        }
      }
    });

    // Create notification for user
    const statusLabel = status.replace('_', ' ');
    const rejectionReason = String(alasan_penolakan ?? '').trim();
    const rejection = status === 'ditolak'
      ? buildRejectionSummary({
          nomor_tiket: before.nomor_tiket,
          judul: before.judul,
          alasan: rejectionReason,
        })
      : null;
    const notif = await prisma.notifikasi.create({
      data: {
        penerima_id: before.user_id,
        jenis: 'status_update',
        pesan:
          status === 'ditolak'
            ? rejection!.notif
            : `Status aspirasi Anda telah diperbarui menjadi: ${statusLabel}`,
        aspirasi_id: parseInt(id)
      }
    });
    if (pusherServer) {
      await pusherServer.trigger(`user-${before.user_id}`, 'notification', {
        id: notif.id,
        jenis: notif.jenis,
        pesan: notif.pesan,
        dibaca: notif.dibaca,
        tanggal_notif: notif.tanggal_notif.toISOString(),
        aspirasi_id: notif.aspirasi_id ?? undefined,
        custom_chat_id: notif.custom_chat_id ?? undefined,
      });
      await pusherServer.trigger(`user-${before.user_id}`, 'aspirasi-updated', {
        aspirasi_id: parseInt(id),
        type: 'status_update',
        status,
      });
    }

    if (status === 'ditolak') {
      await prisma.progresUpdate.create({
        data: {
          aspirasi_id: parseInt(id),
          admin_id: parseInt(session.user.id),
          deskripsi_update: rejection!.detail,
        },
      });
    }
    if (status === 'selesai') {
      await prisma.progresUpdate.create({
        data: {
          aspirasi_id: parseInt(id),
          admin_id: parseInt(session.user.id),
          deskripsi_update: `✅ Laporan **SELESAI**\n\nTiket: ${before.nomor_tiket}\nJudul: ${before.judul}\n\nKeterangan penyelesaian: ${String(keterangan_selesai ?? '').trim()}` // TODO: Enable after migration,
        },
      });
    }

    if (before.custom_chat?.id) {
      const chatMessage = await prisma.customChatMessage.create({
        data: {
          custom_chat_id: before.custom_chat.id,
          sender_id: parseInt(session.user.id),
          sender_role: 'admin',
          konten:
            status === 'ditolak'
              ? rejection!.detail
              : status === 'selesai'
              ? `✅ Update tiket ${before.nomor_tiket}: status laporan diubah menjadi **SELESAI**.\n\nKeterangan penyelesaian: ${String(keterangan_selesai ?? '').trim()}` // TODO: Enable after migration
              : `Update tiket ${before.nomor_tiket}: status laporan diubah menjadi ${statusLabel}.`,
        }
      });

      if (pusherServer) {
        await pusherServer.trigger(
          `custom-chat-${before.custom_chat.id}`,
          'new-message',
          { message: chatMessage }
        );
      }
    }

    return NextResponse.json({ success: true, aspirasi, rejection_template: rejection ?? undefined });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}