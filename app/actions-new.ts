'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { pusherServer } from '@/lib/pusher'

// --- Helper for Real-time Notifications ---
async function triggerRealtimeNotification(userId: number, message: string) {
  try {
    if (pusherServer) {
      await pusherServer.trigger(`user-${userId}`, 'new-notification', { message })
    }
  } catch (e) {
    console.error("Pusher error:", e)
  }
}

// --- Helper for Image Compression ---
async function compressImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
}

export async function updateProgress(formData: FormData) {
  const aspirasiId = parseInt(formData.get('aspirasiId') as string)
  const status = formData.get('status') as string
  const userId = parseInt(formData.get('userId') as string)
  const deskripsiUpdate = formData.get('deskripsiUpdate') as string
  
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

        const filename = `after-${Date.now()}-${fotoAfterFile.name.replace(/\.[^/.]+$/, "").replace(/\s/g, '-')}.jpg`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, compressedBuffer)
        fotoAfterUrl = `/uploads/${filename}`
    }
  }

  const updated = await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      status,
      admin_id: userId,
      tanggal_mulai: status === 'dalam_progres' ? new Date() : undefined,
      tanggal_selesai: status === 'selesai' ? new Date() : undefined,
      foto_after: fotoAfterUrl || undefined,
    },
    include: { user: true }
  })

  await prisma.progresUpdate.create({
    data: {
      aspirasi_id: aspirasiId,
      admin_id: userId,
      deskripsi_update: deskripsiUpdate,
    }
  })

  // Notify User - with real-time update
  const message = `Update Progres (${status.replace('_', ' ')}): ${deskripsiUpdate}`
  await prisma.notifikasi.create({
    data: {
      penerima_id: updated.user_id,
      jenis: 'progres_update',
      pesan: message,
      aspirasi_id: aspirasiId
    }
  })
  await triggerRealtimeNotification(updated.user_id, message)

  revalidatePath(`/admin`)
}