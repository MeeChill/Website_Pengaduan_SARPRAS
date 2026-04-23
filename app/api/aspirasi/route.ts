import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const judul = formData.get('judul') as string;
    const lokasi = formData.get('lokasi') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const nomor_tiket = formData.get('nomor_tiket') as string;
    const fotoFiles = formData.getAll('foto') as File[];
    const riwayatChatRaw = formData.get('riwayat_chat') as string | null;

    // Validate required fields
    if (!judul || !lokasi || !deskripsi || !nomor_tiket) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload photos
    let fotoBeforeUrl: string | null = null;
    
    if (fotoFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const firstFile = fotoFiles[0];
      const buffer = Buffer.from(await firstFile.arrayBuffer());
      const filename = `${Date.now()}-${firstFile.name}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      fotoBeforeUrl = `/uploads/${filename}`;
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

    // Create complaint
    const aspirasi = await prisma.aspirasi.create({
      data: {
        user_id: parseInt(session.user.id),
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

    const customChat = await prisma.customChat.create({
      data: {
        user_id: parseInt(session.user.id),
        aspirasi_id: aspirasi.id,
        judul: `${aspirasi.nomor_tiket} - ${aspirasi.judul}`,
        status: 'open',
        prioritas: 'normal',
        messages: {
          create: {
            sender_id: parseInt(session.user.id),
            sender_role: 'user',
            konten: buildInitialChatMessage(
              aspirasi.nomor_tiket,
              aspirasi.judul,
              aspirasi.lokasi,
              aspirasi.deskripsi,
              riwayatChat
            ),
            foto_url: fotoBeforeUrl,
          },
        },
      },
      include: {
        messages: {
          orderBy: { dibuat_pada: 'asc' },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      nomor_tiket: aspirasi.nomor_tiket,
      aspirasi,
      custom_chat_id: customChat.id,
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
          kategori: true
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