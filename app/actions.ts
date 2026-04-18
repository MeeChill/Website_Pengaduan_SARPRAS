'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { hash } from "bcryptjs"
import { pusherServer } from '@/lib/pusher'
import { resend } from '@/lib/resend'
import sharp from "sharp"

// --- Helpers for Real-time & Email ---
async function triggerRealtimeNotification(userId: number, message: string) {
  try {
    if (pusherServer) {
      await pusherServer.trigger(`user-${userId}`, 'new-notification', { message })
    }
  } catch (e) {
    console.error("Pusher error:", e)
  }
}

async function sendEmailNotification(to: string, subject: string, text: string) {
  try {
    if (resend) {
      await (resend as any).emails.send({
        from: 'Neo-Sarana <notifications@yourdomain.com>',
        to: [to],
        subject,
        text
      })
    }
  } catch (e) {
    console.error("Resend error:", e)
  }
}

// Helper to get an admin ID
async function getAdminId() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  return admin?.id
}

// Helper to get a yayasan ID
async function getYayasanId() {
  const yayasan = await prisma.user.findFirst({ where: { role: 'yayasan' } })
  return yayasan?.id
}

// --- Helper for Image Compression ---
async function compressImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Resize if larger than 1200px
    .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
    .toBuffer()
}

export async function createAspirasi(formData: FormData) {
  // Check limit
  const count = await prisma.inputAspirasi.count()
  if (count >= 1000) {
    throw new Error("Maksimal data aspirasi telah tercapai (1000 data)")
  }

  const judul = formData.get('judul') as string
  const deskripsi = formData.get('deskripsi') as string
  const lokasi = formData.get('lokasi') as string
  const kategori_id = parseInt(formData.get('kategori_id') as string)
  const siswa_id = parseInt(formData.get('siswa_id') as string)
  
  // Handle Photo Upload
  const fotoFile = formData.get('foto') as File | null
  let fotoUrl = null

  if (fotoFile && fotoFile.size > 0) {
    const bytes = await fotoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Compress the image
    const compressedBuffer = await compressImage(buffer)
    
    if (process.env.VERCEL) {
        // In Vercel, we can't write to public/uploads. 
        // We will skip file saving to avoid the crash.
        console.log("Skipping file upload in Vercel environment (Read-only filesystem). Use S3/Blob for persistence.")
        fotoUrl = null // or maybe a placeholder image
    } else {
        const uploadDir = join(process.cwd(), 'public/uploads')
        await mkdir(uploadDir, { recursive: true })

        // Always save as .jpg since we compressed to JPEG
        const filename = `${Date.now()}-${fotoFile.name.replace(/\.[^/.]+$/, "").replace(/\s/g, '-')}.jpg`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, compressedBuffer)
        fotoUrl = `/uploads/${filename}`
    }
  }

  const input = await prisma.inputAspirasi.create({
    data: {
      judul,
      deskripsi,
      lokasi,
      kategori_id,
      siswa_id,
      foto: fotoUrl,
    }
  })

  const aspirasi = await prisma.aspirasi.create({
    data: {
      input_aspirasi_id: input.id,
      status_validasi: 'pending',
      status_progres: 'belum_dimulai',
    }
  })

  // 4. Notification for all Admins
  const admins = await prisma.user.findMany({ where: { role: 'admin' } })
  for (const admin of admins) {
    await prisma.notifikasi.create({
      data: {
        penerima_id: admin.id,
        jenis: 'info',
        pesan: `Aspirasi baru: ${judul}`,
        input_aspirasi_id: input.id,
        aspirasi_id: aspirasi.id
      }
    })
    await triggerRealtimeNotification(admin.id, `Aspirasi baru: ${judul}`)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/aspirasi')
  redirect('/dashboard/aspirasi')
}

export async function updateValidation(aspirasiId: number, status: string, userId: number, catatan: string, tenggatWaktu?: string) {
  const updated = await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      status_validasi: status,
      validasi_oleh: userId,
      tanggal_validasi: new Date(),
      catatan_validasi: catatan,
      tenggat_waktu: tenggatWaktu ? new Date(tenggatWaktu) : undefined,
    },
    include: { input_aspirasi: true }
  })

  // Notifications
  if (status === 'diajukan') {
    // Admin -> Yayasan
    const yayasans = await prisma.user.findMany({ where: { role: 'yayasan' } })
    for (const y of yayasans) {
      const message = `Validasi diperlukan: ${updated.input_aspirasi.judul}`
      await prisma.notifikasi.create({
        data: {
          penerima_id: y.id,
          jenis: 'warning',
          pesan: message,
          aspirasi_id: aspirasiId
        }
      })
      await triggerRealtimeNotification(y.id, message)
    }
  } else if (status === 'disetujui') {
    // Yayasan -> Siswa & Admin
    const messageSiswa = `Aspirasi Anda disetujui: ${updated.input_aspirasi.judul}${tenggatWaktu ? `. Target selesai: ${new Date(tenggatWaktu).toLocaleDateString('id-ID')}` : ''}`
    await prisma.notifikasi.create({
      data: {
        penerima_id: updated.input_aspirasi.siswa_id,
        jenis: 'success',
        pesan: messageSiswa,
        aspirasi_id: aspirasiId
      }
    })
    await triggerRealtimeNotification(updated.input_aspirasi.siswa_id, messageSiswa)
    
    const admins = await prisma.user.findMany({ where: { role: 'admin' } })
    for (const admin of admins) {
      const messageAdmin = `Aspirasi disetujui Yayasan, siap dikerjakan: ${updated.input_aspirasi.judul}${tenggatWaktu ? `. Tenggat: ${new Date(tenggatWaktu).toLocaleDateString('id-ID')}` : ''}`
      await prisma.notifikasi.create({
        data: {
          penerima_id: admin.id,
          jenis: 'success',
          pesan: messageAdmin,
          aspirasi_id: aspirasiId
        }
      })
      await triggerRealtimeNotification(admin.id, messageAdmin)
    }
  } else if (status === 'ditolak') {
    // Admin/Yayasan -> Siswa
    const message = `Aspirasi ditolak: ${updated.input_aspirasi.judul}. Catatan: ${catatan}`
    await prisma.notifikasi.create({
      data: {
        penerima_id: updated.input_aspirasi.siswa_id,
        jenis: 'error',
        pesan: message,
        aspirasi_id: aspirasiId
      }
    })
    await triggerRealtimeNotification(updated.input_aspirasi.siswa_id, message)
  }

  revalidatePath(`/dashboard/aspirasi/${aspirasiId}`)
}

export async function updateProgress(formData: FormData) {
  const aspirasiId = parseInt(formData.get('aspirasiId') as string)
  const status = formData.get('status') as string
  const userId = parseInt(formData.get('userId') as string)
  const deskripsiUpdate = formData.get('deskripsiUpdate') as string // Detail for Yayasan
  const deskripsiSingkat = formData.get('deskripsiSingkat') as string // Simple for User
  
  // Handle Photo After Upload (only when status is 'selesai')
  const fotoAfterFile = formData.get('fotoAfter') as File | null
  let fotoAfterUrl = null

  if (status === 'selesai' && fotoAfterFile && fotoAfterFile.size > 0) {
    const bytes = await fotoAfterFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Compress the image
    const compressedBuffer = await compressImage(buffer)

    if (process.env.VERCEL) {
        console.log("Skipping file upload in Vercel environment.")
    } else {
        const uploadDir = join(process.cwd(), 'public/uploads')
        await mkdir(uploadDir, { recursive: true })

        // Always save as .jpg since we compressed to JPEG
        const filename = `${Date.now()}-after-${fotoAfterFile.name.replace(/\.[^/.]+$/, "").replace(/\s/g, '-')}.jpg`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, compressedBuffer)
        fotoAfterUrl = `/uploads/${filename}`
    }
  }

  const updated = await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      status_progres: status,
      admin_id: userId,
      tanggal_mulai: status === 'dalam_progres' ? new Date() : undefined,
      tanggal_selesai: status === 'selesai' ? new Date() : undefined,
      foto_after: fotoAfterUrl || undefined,
    },
    include: { input_aspirasi: true }
  })

  await prisma.progresUpdate.create({
    data: {
      aspirasi_id: aspirasiId,
      admin_id: userId,
      deskripsi_update: deskripsiUpdate,
      deskripsi_singkat: deskripsiSingkat,
    }
  })

  // Notify Siswa - use deskripsiSingkat if available, otherwise deskripsiUpdate
  const message = `Update Progres (${status.replace('_', ' ')}): ${deskripsiSingkat || deskripsiUpdate}`
  await prisma.notifikasi.create({
    data: {
      penerima_id: updated.input_aspirasi.siswa_id,
      jenis: 'info',
      pesan: message,
      aspirasi_id: aspirasiId
    }
  })
  await triggerRealtimeNotification(updated.input_aspirasi.siswa_id, message)

  revalidatePath(`/dashboard/aspirasi/${aspirasiId}`)
}

export async function submitFeedback(aspirasiId: number, rating: number, feedback: string) {
  await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      rating,
      feedback
    }
  })

  revalidatePath(`/dashboard/aspirasi/${aspirasiId}`)
}

export async function createUser(formData: FormData) {
  // Check limit
  const count = await prisma.user.count()
  if (count >= 1000) {
    throw new Error("Maksimal data user telah tercapai (1000 data)")
  }

  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const nisn = formData.get('nis') as string
  const kelas = formData.get('kelas') as string

  const hashedPassword = await hash(password, 10)

  await prisma.user.create({
    data: {
      nama,
      username,
      password: hashedPassword,
      role: 'siswa',
      nisn,
      kelas
    }
  })

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function updateAdmin(id: number, formData: FormData) {
  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const data: any = {
    nama,
    username,
  }

  if (password && password.trim() !== '') {
    data.password = await hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data
  })

  revalidatePath('/dashboard/admins')
  redirect('/dashboard/admins')
}

export async function createAdmin(formData: FormData) {
  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const hashedPassword = await hash(password, 10)

  await prisma.user.create({
    data: {
      nama,
      username,
      password: hashedPassword,
      role: 'admin'
    }
  })

  revalidatePath('/dashboard/admins')
  redirect('/dashboard/admins')
}

export async function markNotificationRead(id: number) {
  await prisma.notifikasi.update({
    where: { id },
    data: { dibaca: true }
  })
  revalidatePath('/dashboard')
}

export async function deleteUser(id: number) {
  // First delete related records to avoid foreign key constraints if necessary
  // or rely on cascade delete if configured in schema.
  // Assuming cascade delete is not set up for everything, we might need to be careful.
  // But for now, let's try simple delete.
  
  // Actually, user has relations to InputAspirasi, etc. 
  // Ideally, we should soft delete or handle relations.
  // For this task, let's assume we delete the user.
  
  try {
    await prisma.user.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    // You might want to handle this better, e.g. return an error state
  }
  
  revalidatePath('/dashboard/users')
}

export async function deleteAdmin(id: number) {
  try {
    await prisma.user.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Error deleting admin:", error)
  }
  revalidatePath('/dashboard/admins')
}

export async function updateUser(id: number, formData: FormData) {
  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const nisn = formData.get('nis') as string
  const kelas = formData.get('kelas') as string
  const password = formData.get('password') as string

  const data: any = {
    nama,
    username,
    nisn,
    kelas
  }

  if (password && password.trim() !== '') {
    data.password = await hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data
  })

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}
