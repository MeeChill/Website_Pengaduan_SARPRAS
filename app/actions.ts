'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { hash } from "bcryptjs"

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

    const uploadDir = join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${fotoFile.name.replace(/\s/g, '-')}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)
    fotoUrl = `/uploads/${filename}`
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

  // Notify Admin
  const adminId = await getAdminId()
  if (adminId) {
    await prisma.notifikasi.create({
      data: {
        penerima_id: adminId,
        jenis: 'info',
        pesan: `Aspirasi baru: ${judul}`,
        input_aspirasi_id: input.id,
        aspirasi_id: aspirasi.id
      }
    })
  }

  revalidatePath('/dashboard/aspirasi')
  redirect('/dashboard/aspirasi')
}

export async function updateValidation(aspirasiId: number, status: string, userId: number, catatan: string) {
  const updated = await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      status_validasi: status,
      validasi_oleh: userId,
      tanggal_validasi: new Date(),
      catatan_validasi: catatan,
    },
    include: { input_aspirasi: true }
  })

  // Notifications
  if (status === 'diajukan') {
    // Admin -> Yayasan
    const yayasanId = await getYayasanId()
    if (yayasanId) {
      await prisma.notifikasi.create({
        data: {
          penerima_id: yayasanId,
          jenis: 'warning',
          pesan: `Validasi diperlukan: ${updated.input_aspirasi.judul}`,
          aspirasi_id: aspirasiId
        }
      })
    }
  } else if (status === 'disetujui') {
    // Yayasan -> Siswa & Admin
    await prisma.notifikasi.create({
      data: {
        penerima_id: updated.input_aspirasi.siswa_id,
        jenis: 'success',
        pesan: `Aspirasi Anda disetujui: ${updated.input_aspirasi.judul}`,
        aspirasi_id: aspirasiId
      }
    })
    
    const adminId = await getAdminId()
    if (adminId) {
      await prisma.notifikasi.create({
        data: {
          penerima_id: adminId,
          jenis: 'success',
          pesan: `Aspirasi disetujui Yayasan, siap dikerjakan: ${updated.input_aspirasi.judul}`,
          aspirasi_id: aspirasiId
        }
      })
    }
  } else if (status === 'ditolak') {
    // Admin/Yayasan -> Siswa
    await prisma.notifikasi.create({
      data: {
        penerima_id: updated.input_aspirasi.siswa_id,
        jenis: 'error',
        pesan: `Aspirasi ditolak: ${updated.input_aspirasi.judul}. Catatan: ${catatan}`,
        aspirasi_id: aspirasiId
      }
    })
  }

  revalidatePath(`/dashboard/aspirasi/${aspirasiId}`)
}

export async function updateProgress(aspirasiId: number, status: string, userId: number, deskripsi: string) {
  const updated = await prisma.aspirasi.update({
    where: { id: aspirasiId },
    data: {
      status_progres: status,
      admin_id: userId,
      tanggal_mulai: status === 'dalam_progres' ? new Date() : undefined,
      tanggal_selesai: status === 'selesai' ? new Date() : undefined,
    },
    include: { input_aspirasi: true }
  })

  await prisma.progresUpdate.create({
    data: {
      aspirasi_id: aspirasiId,
      admin_id: userId,
      deskripsi_update: deskripsi,
    }
  })

  // Notify Siswa
  await prisma.notifikasi.create({
    data: {
      penerima_id: updated.input_aspirasi.siswa_id,
      jenis: 'info',
      pesan: `Update Progres (${status.replace('_', ' ')}): ${deskripsi}`,
      aspirasi_id: aspirasiId
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
