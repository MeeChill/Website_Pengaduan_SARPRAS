import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const fotoAfter = formData.get('foto_after') as File | null;
    
    if (!fotoAfter) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    const existing = await prisma.aspirasi.findUnique({
      where: { id: parseInt(id) },
      select: { status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.status === 'selesai' || existing.status === 'ditolak') {
      return NextResponse.json(
        { error: 'Laporan sudah final (selesai/ditolak). Tidak bisa upload foto after.' },
        { status: 409 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await fotoAfter.arrayBuffer());
    const filename = `after-${Date.now()}-${fotoAfter.name}`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    const fotoAfterUrl = `/uploads/${filename}`;

    const aspirasi = await prisma.aspirasi.update({
      where: { id: parseInt(id) },
      data: { 
        foto_after: fotoAfterUrl
      }
    });

    // Create notification for user
    const notif = await prisma.notifikasi.create({
      data: {
        penerima_id: aspirasi.user_id,
        jenis: 'status_update',
        pesan: `Admin telah mengunggah foto penyelesaian (After) untuk aspirasi Anda.`,
        aspirasi_id: parseInt(id)
      }
    });
    if (pusherServer) {
      await pusherServer.trigger(`user-${aspirasi.user_id}`, 'notification', {
        id: notif.id,
        jenis: notif.jenis,
        pesan: notif.pesan,
        dibaca: notif.dibaca,
        tanggal_notif: notif.tanggal_notif.toISOString(),
        aspirasi_id: notif.aspirasi_id ?? undefined,
        custom_chat_id: notif.custom_chat_id ?? undefined,
      });
      await pusherServer.trigger(`user-${aspirasi.user_id}`, 'aspirasi-updated', {
        aspirasi_id: parseInt(id),
        type: 'photo_after',
        foto_after: fotoAfterUrl,
      });
    }

    return NextResponse.json({ success: true, foto_after: fotoAfterUrl });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
