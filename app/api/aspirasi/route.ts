import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { pusherServer } from '@/lib/pusher';

type LaporanHistoryItem = {
  role: 'bot' | 'user';
  content: string;
};

function buildInitialChatMessage(
  nomorTiket: string,
  judul: string,
  lokasi: string,
  deskripsi: string,
  history: LaporanHistoryItem[]
) {
  const transcript = history
    .map((item) => `${item.role === 'user' ? 'User' : 'Bot'}: ${item.content}`)
    .join('\n\n');

  return [
    `Saya baru saja mengirim laporan dengan nomor tiket **${nomorTiket}**.`,
    '',
    `Judul: ${judul}`,
    `Lokasi: ${lokasi}`,
    `Deskripsi: ${deskripsi}`,
    transcript ? `\nRiwayat pengisian laporan:\n${transcript}` : '',
    '',
    'Saya akan melanjutkan percakapan terkait laporan ini di thread yang sama.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.error('Unauthorized access to /api/aspirasi - No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const judul = formData.get('judul') as string;
    const lokasi = formData.get('lokasi') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const nomor_tiket = formData.get('nomor_tiket') as string;
    const fotoFiles = formData.getAll('foto') as File[];
    const riwayatChatRaw = formData.get('riwayat_chat') as string | null;

    console.log('Received aspirasi submission:', {
      user_id: session.user.id,
      judul: judul?.substring(0, 50) + '...',
      lokasi: lokasi?.substring(0, 50) + '...',
      deskripsi_length: deskripsi?.length,
      nomor_tiket,
      foto_count: fotoFiles.length
    });

    // Validate required fields
    if (!judul || !lokasi || !deskripsi || !nomor_tiket) {
      console.error('Missing required fields', { judul, lokasi, deskripsi, nomor_tiket });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload photos
    let fotoBeforeUrl: string | null = null;
    
    if (fotoFiles.length > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const firstFile = fotoFiles[0];
        console.log('Uploading file:', firstFile.name, 'Size:', firstFile.size, 'Type:', firstFile.type);
        
        const buffer = Buffer.from(await firstFile.arrayBuffer());
        const filename = `${Date.now()}-${firstFile.name}`;
        const filepath = path.join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        fotoBeforeUrl = `/uploads/${filename}`;
        console.log('File uploaded successfully:', filename);
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continue without photo if upload fails
        fotoBeforeUrl = null;
      }
    }

    // Get or create default category
    let kategori = await prisma.kategori.findFirst({
      where: { nama_kategori: 'Umum' }
    });

    if (!kategori) {
      kategori = await prisma.kategori.create({
        data: {
          nama_kategori: 'Umum',
          deskripsi: 'Kategori umum untuk aspirasi'
        }
      });
    }

    let riwayatChat: LaporanHistoryItem[] = [];
    if (riwayatChatRaw) {
      try {
        const parsed = JSON.parse(riwayatChatRaw);
        if (Array.isArray(parsed)) {
          riwayatChat = parsed.filter(
            (item): item is LaporanHistoryItem =>
              item &&
              (item.role === 'bot' || item.role === 'user') &&
              typeof item.content === 'string'
          );
        }
      } catch (error) {
        console.error('Failed to parse riwayat_chat:', error);
      }
    }

    // Validate user exists before creating aspirasi
    console.log('Validating user ID:', session.user.id);
    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!existingUser) {
      console.error('User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found. Please login again.' },
        { status: 404 }
      );
    }

    console.log('User validation successful:', userId);

    // Create complaint
    console.log('Creating aspirasi in database...');
    const aspirasi = await prisma.aspirasi.create({
      data: {
        user_id: userId,
        kategori_id: kategori.id,
        judul,
        lokasi,
        deskripsi,
        nomor_tiket,
        foto_before: fotoBeforeUrl,
        status: 'pending'
      },
      include: {
        user: true,
        kategori: true
      }
    });
    console.log('Aspirasi created successfully:', aspirasi.id, 'Nomor Tiket:', aspirasi.nomor_tiket);

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notifikasi.createMany({
        data: admins.map((admin) => ({
          penerima_id: admin.id,
          jenis: 'new_aspirasi',
          pesan: `Laporan baru diajukan: ${aspirasi.nomor_tiket} - ${aspirasi.judul}`,
          aspirasi_id: aspirasi.id,
        })),
      });
      if (pusherServer) {
        await pusherServer.trigger('admin-custom-chats', 'notification', {
          id: Date.now(),
          jenis: 'new_aspirasi',
          pesan: `Laporan baru diajukan: ${aspirasi.nomor_tiket} - ${aspirasi.judul}`,
          dibaca: false,
          tanggal_notif: new Date().toISOString(),
          aspirasi_id: aspirasi.id,
        });
      }
    }

    // Simpan ringkasan riwayat laporan sebagai jejak percakapan di backend logs.
    // Tidak lagi membuat thread custom chat otomatis agar alur tetap di tab Buat Laporan.
    const laporanTranscript = buildInitialChatMessage(
      aspirasi.nomor_tiket,
      aspirasi.judul,
      aspirasi.lokasi,
      aspirasi.deskripsi,
      riwayatChat
    );
    if (laporanTranscript) {
      console.info('Laporan transcript saved:', {
        aspirasi_id: aspirasi.id,
        length: laporanTranscript.length,
      });
    }

    return NextResponse.json({ 
      success: true, 
      nomor_tiket: aspirasi.nomor_tiket,
      aspirasi,
      custom_chat_id: null,
    });

  } catch (error) {
    console.error('Error creating aspirasi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const nomorTiket = searchParams.get('nomor_tiket');

    if (id || nomorTiket) {
      // Get single complaint by ID or ticket number
      const where = id ? { id: parseInt(id) } : { nomor_tiket: nomorTiket! };
      
      const aspirasi = await prisma.aspirasi.findFirst({
        where,
        include: {
          user: true,
          kategori: true,
          progres_updates: {
            include: { admin: true },
            orderBy: { tanggal_update: 'desc' }
          }
        }
      });

      if (!aspirasi) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }

      // Check if user is authorized to view this complaint
      if (session.user.role === 'user' && aspirasi.user_id !== parseInt(session.user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ aspirasi });
    } else {
      // Get all complaints (with role-based filtering)
      const where = session.user.role === 'admin' ? {} : { user_id: parseInt(session.user.id) };
      
      const aspirasi = await prisma.aspirasi.findMany({
        where,
        include: {
          user: true,
          kategori: true,
          progres_updates: {
            include: {
              admin: {
                select: { nama: true },
              },
            },
            orderBy: { tanggal_update: 'asc' },
          },
        },
        orderBy: { tanggal_input: 'desc' }
      });

      return NextResponse.json({ aspirasi });
    }

  } catch (error) {
    console.error('Error fetching aspirasi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}